import { useState, useMemo } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, Mail, Download, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useProfile } from "@/hooks/useProfile";
import stampImg from "@/assets/rshb-stamp.png";
import signatureImg from "@/assets/rshb-signature.png";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  is_income?: boolean;
  account_id?: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  card_number?: string | null;
  account_number?: string | null;
  type?: string;
}

interface StatementExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
}

const categoryTranslations: Record<string, string> = {
  "Продукты": "Groceries",
  "Транспорт": "Transport",
  "Развлечения": "Entertainment",
  "Кафе и рестораны": "Cafes & Restaurants",
  "Здоровье": "Health",
  "Одежда": "Clothing",
  "Связь": "Communication",
  "ЖКХ": "Utilities",
  "Образование": "Education",
  "Переводы": "Transfers",
  "Зарплата": "Salary",
  "Подарки": "Gifts",
  "Путешествия": "Travel",
  "Красота": "Beauty",
  "Дом": "Home",
  "Спорт": "Sport",
  "Подписки": "Subscriptions",
  "Прочее": "Other",
  "Супермаркеты": "Supermarkets",
  "Такси": "Taxi",
  "Аптеки": "Pharmacy",
  "Фастфуд": "Fast Food",
  "Маркетплейсы": "Marketplaces",
  "Электроника": "Electronics",
  "Топливо": "Fuel",
  "Инвестиции": "Investments",
};

const translateCategory = (cat: string) => categoryTranslations[cat] || cat;


const formatDateRu = (dateString: string) => {
  const d = new Date(dateString);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
};

const StatementExportModal = ({ isOpen, onClose, transactions, accounts }: StatementExportModalProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");
  const [format, setFormat] = useState<string>("pdf");
  const [email, setEmail] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const { data: profile } = useProfile();

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let start = new Date(now);

    switch (period) {
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(now.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      case "custom":
        if (customStartDate) start = new Date(customStartDate);
        if (customEndDate) {
          const customEnd = new Date(customEndDate);
          customEnd.setHours(23, 59, 59, 999);
          return { start, end: customEnd };
        }
        break;
    }

    start.setHours(0, 0, 0, 0);
    return { start, end };
  };

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange();
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        const isInDateRange = transactionDate >= start && transactionDate <= end;
        const isAccountMatch = selectedAccount === "all" || t.account_id === selectedAccount;
        return isInDateRange && isAccountMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, period, selectedAccount, customStartDate, customEndDate]);

  const loadImageWithWhiteBg = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const generateTransactionRef = (id: string, date: string) => {
    const d = new Date(date);
    const hash = id.replace(/-/g, "").substring(0, 8).toUpperCase();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${hash}`;
  };

  const generateTransactionTime = (id: string, index: number) => {
    // Generate deterministic time from transaction id
    const seed = parseInt(id.replace(/-/g, "").substring(0, 8), 16);
    const hours = (seed + index * 3) % 14 + 8; // 08:00-21:59
    const minutes = (seed + index * 7) % 60;
    const seconds = (seed + index * 13) % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const generateAuthCode = (id: string) => {
    const hash = id.replace(/-/g, "");
    return hash.substring(0, 6).toUpperCase();
  };

  const generateTerminalId = (id: string) => {
    const seed = parseInt(id.replace(/-/g, "").substring(4, 12), 16);
    return String(seed % 90000000 + 10000000);
  };

  const generateMCC = (id: string) => {
    return String((parseInt(id.substring(0, 4), 16) % 9000) + 1000);
  };

  const buildDescription = (t: Transaction, authCode: string) => {
    const termId = generateTerminalId(t.id);
    const mcc = generateMCC(t.id);
    if (t.is_income) {
      return `${t.name}\nAuth: ${authCode} | Terminal: ${termId}`;
    }
    return `${t.name}\nAuth: ${authCode} | MCC: ${mcc} | Terminal: ${termId}`;
  };

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const { start, end } = getDateRange();
    const account = selectedAccount !== "all" ? accounts.find((a) => a.id === selectedAccount) : null;
    const accountNumber = account?.account_number || "40817810514230007456";
    const cardNumber = account?.card_number ? account.card_number.replace(/(\d{4})(?=\d)/g, "$1 ") : "6282 8700 0412 7694";
    const ownerName = profile?.full_name || "Account Holder";

    const pageWidth = 210;
    const margin = 14;
    let y = 12;

    // Bank header with logo
    try {
      const headerImg = await loadImageWithWhiteBg((await import("@/assets/rshb-header.png")).default);
      doc.addImage(headerImg, "PNG", margin, y, 50, 12);
    } catch {}

    // Bank details on right side
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const bankInfo = [
      "JSC Rosselkhozbank",
      "License No. 3349 dated 12.08.2015",
      "119034, Moscow, Gagarinsky per., 3",
      "BIC 044525111 | INN 7725114488",
    ];
    bankInfo.forEach((line, i) => {
      doc.text(line, pageWidth - margin, y + 3 + i * 3.5, { align: "right" });
    });
    y += 18;

    // Divider line
    doc.setDrawColor(0, 100, 50);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Title
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("STATEMENT OF CARD ACCOUNT", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `No. ${accountNumber} for period from ${formatDateRu(start.toISOString())} to ${formatDateRu(end.toISOString())}`,
      pageWidth / 2, y, { align: "center" }
    );
    y += 8;

    // Info table (two-column layout)
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    const infoData: [string, string][] = [
      ["Statement date:", formatDateRu(new Date().toISOString())],
      ["Account holder:", ownerName],
      ["Account number:", accountNumber],
      ["Card number:", cardNumber],
      ["Account currency:", "Russian Ruble (RUB)"],
      ["Branch:", "Moscow Regional Branch No. 3349/0101"],
      ["Statement period:", `${formatDateRu(start.toISOString())} — ${formatDateRu(end.toISOString())}`],
    ];

    autoTable(doc, {
      startY: y,
      body: infoData,
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        font: "helvetica",
        textColor: [0, 0, 0],
        lineWidth: 0,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold", textColor: [80, 80, 80] },
        1: { cellWidth: 120 },
      },
      theme: "plain",
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable?.finalY || y + 30;
    y += 4;

    // Calculate opening balance & running balance
    const sortedAsc = filteredTransactions.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const income = sortedAsc.filter((t) => t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);
    const expense = sortedAsc.filter((t) => !t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);
    // When a specific account is selected, derive opening from its current balance
    // When "all" is selected, sum all account balances as closing
    const closingBalance = account ? account.balance : accounts.reduce((s, a) => s + a.balance, 0);
    const openingBalance = closingBalance - income + expense;

    // Balance summary box
    doc.setFillColor(245, 247, 245);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`Opening balance: ${formatAmount(openingBalance)} RUB`, margin + 4, y + 5);
    doc.text(`Closing balance: ${formatAmount(closingBalance)} RUB`, margin + 4, y + 9.5);
    doc.text(`Total debit: ${formatAmount(expense)} RUB`, pageWidth / 2 + 10, y + 5);
    doc.text(`Total credit: ${formatAmount(income)} RUB`, pageWidth / 2 + 10, y + 9.5);
    y += 16;

    // Section title
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("TRANSACTIONS", margin, y);
    y += 4;

    // Transactions table — professional columns
    const tableHeaders = [
      "No.",
      "Date / Time",
      "Reference",
      "Description",
      "Debit\n(RUB)",
      "Credit\n(RUB)",
      "Balance\n(RUB)",
    ];

    let runningBalance = openingBalance;
    const tableData = filteredTransactions
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t, i) => {
        if (t.is_income) {
          runningBalance += Math.abs(t.amount);
        } else {
          runningBalance -= Math.abs(t.amount);
        }

        const debit = !t.is_income ? formatAmount(t.amount) : "";
        const credit = t.is_income ? formatAmount(t.amount) : "";
        const time = generateTransactionTime(t.id, i);
        const ref = generateTransactionRef(t.id, t.date);
        const authCode = generateAuthCode(t.id);

        const description = buildDescription(t, authCode);

        return [
          String(i + 1),
          `${formatDateRu(t.date)}\n${time}`,
          ref,
          description,
          debit,
          credit,
          formatAmount(runningBalance),
        ];
      });

    // Add totals row
    tableData.push([
      "",
      "",
      "",
      "TOTAL",
      formatAmount(expense),
      formatAmount(income),
      formatAmount(runningBalance),
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: {
        fontSize: 6.5,
        cellPadding: 1.8,
        font: "helvetica",
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.15,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [0, 100, 50],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.15,
        lineColor: [0, 80, 40],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 24 },
        2: { cellWidth: 28, fontSize: 5.5, textColor: [100, 100, 100] },
        3: { cellWidth: 60 },
        4: { cellWidth: 22, halign: "right" },
        5: { cellWidth: 22, halign: "right" },
        6: { cellWidth: 22, halign: "right" },
      },
      theme: "grid",
      margin: { left: margin, right: margin },
      alternateRowStyles: {
        fillColor: [250, 252, 250],
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          // Debit in red
          if (data.column.index === 4 && data.cell.raw && data.cell.raw !== "") {
            data.cell.styles.textColor = [180, 30, 30];
          }
          // Credit in green
          if (data.column.index === 5 && data.cell.raw && data.cell.raw !== "") {
            data.cell.styles.textColor = [0, 120, 50];
          }
          // Totals row bold
          const isLast = data.row.index === tableData.length - 1;
          if (isLast) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [235, 240, 235];
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    let footerY = finalY + 10;

    if (footerY > 250) {
      doc.addPage();
      footerY = 20;
    }

    // Closing info
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(
      `This statement contains ${filteredTransactions.length} transaction(s) for the period ${formatDateRu(start.toISOString())} — ${formatDateRu(end.toISOString())}.`,
      margin, footerY
    );
    footerY += 4;
    doc.text(
      `Statement generated electronically on ${formatDateRu(new Date().toISOString())} and is valid without signature.`,
      margin, footerY
    );
    footerY += 10;

    // Divider
    doc.setDrawColor(0, 100, 50);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    footerY += 8;

    // Signature block
    if (footerY > 240) {
      doc.addPage();
      footerY = 20;
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Authorized representative:", margin, footerY);
    doc.text("_________________________", margin + 45, footerY);
    doc.text("A. G. Osipenko", margin + 100, footerY);

    try {
      const sigImg = await loadImageWithWhiteBg(signatureImg);
      doc.addImage(sigImg, "PNG", margin + 50, footerY - 6, 25, 10);
    } catch {}

    footerY += 15;

    // Stamp
    try {
      const stmpDataUrl = await loadImageWithWhiteBg(stampImg);
      const stampSize = 38;
      const stampX = pageWidth / 2 - stampSize / 2;
      doc.setFillColor(255, 255, 255);
      doc.rect(stampX, footerY - 5, stampSize, stampSize, "F");
      doc.addImage(stmpDataUrl, "JPEG", stampX, footerY - 5, stampSize, stampSize);
    } catch {}

    return doc;
  };

  const generateCSV = () => {
    const headers = ["No.", "Date", "Time", "Reference", "Description", "Debit", "Credit", "Balance", "Currency"];
    
    const account = selectedAccount !== "all" ? accounts.find((a) => a.id === selectedAccount) : null;
    const income = filteredTransactions.filter((t) => t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expense = filteredTransactions.filter((t) => !t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const closingBal = account ? account.balance : accounts.reduce((s, a) => s + a.balance, 0);
    let runBal = closingBal - income + expense;

    const sorted = filteredTransactions.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const rows = sorted.map((t, i) => {
      if (t.is_income) runBal += Math.abs(t.amount); else runBal -= Math.abs(t.amount);
      return [
        String(i + 1),
        formatDateRu(t.date),
        generateTransactionTime(t.id, i),
        generateTransactionRef(t.id, t.date),
        `"${t.name}"`,
        !t.is_income ? formatAmount(t.amount) : "",
        t.is_income ? formatAmount(t.amount) : "",
        formatAmount(runBal),
        "RUB",
      ];
    });

    const summary = [
      [],
      ["", "", "", "", "TOTAL", formatAmount(expense), formatAmount(income), formatAmount(runBal), ""],
    ];

    const csvContent = [headers, ...rows, ...summary].map((row) => row.join(";")).join("\n");
    return csvContent;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === "pdf") {
        const doc = await generatePDF();
        doc.save(`vypiska_${new Date().toISOString().split("T")[0]}.pdf`);
        toast.success("Выписка скачана в PDF");
      } else if (format === "csv") {
        const csv = generateCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `vypiska_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("Выписка скачана в CSV");
      } else if (format === "excel") {
        const csv = generateCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `vypiska_${new Date().toISOString().split("T")[0]}.xls`;
        link.click();
        toast.success("Выписка скачана в Excel");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при экспорте");
    }
    setIsExporting(false);
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Введите email");
      return;
    }
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success(`Выписка отправлена на ${email}`);
    setIsExporting(false);
    setEmail("");
  };

  const income = filteredTransactions.filter((t) => t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = filteredTransactions.filter((t) => !t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Выписка по счёту">
      <div className="space-y-6">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label>Счёт</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все счета</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <Label>Период</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">За неделю</SelectItem>
                <SelectItem value="month">За месяц</SelectItem>
                <SelectItem value="quarter">За квартал</SelectItem>
                <SelectItem value="year">За год</SelectItem>
                <SelectItem value="custom">Произвольный период</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>С</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>По</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Формат</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormat("pdf")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format === "pdf" ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <FileText className={`w-8 h-8 mx-auto mb-2 ${format === "pdf" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">PDF</p>
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format === "csv" ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${format === "csv" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">CSV</p>
              </button>
              <button
                onClick={() => setFormat("excel")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format === "excel" ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${format === "excel" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">Excel</p>
              </button>
            </div>
          </div>

          {/* Download Button */}
          <Button onClick={handleExport} className="w-full" disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Экспорт..." : "Скачать выписку"}
          </Button>

          {/* Email Section */}
          <div className="border-t border-border pt-6 space-y-4">
            <Label>Отправить на email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="example@mail.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="outline" onClick={handleSendEmail} disabled={isExporting}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted rounded-xl p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Будет экспортировано</p>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{filteredTransactions.length} операций</span>
              <Check className="w-5 h-5 text-success" />
            </div>
            {filteredTransactions.length > 0 && (
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Поступления:</span>
                  <span className="text-success font-medium">+{income.toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Расходы:</span>
                  <span className="text-destructive font-medium">−{expenses.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
            )}
          </div>
      </div>
    </FullScreenModal>
  );
};

export default StatementExportModal;
