import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, Mail, Download, Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useProfile } from "@/hooks/useProfile";

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

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const { start, end } = getDateRange();
    const account = selectedAccount !== "all" ? accounts.find((a) => a.id === selectedAccount) : null;
    const accountName = account?.name || "All Accounts";
    const accountNumber = account?.account_number || "XXXXXXXXXXXXXXXXXXXX";
    const ownerName = profile?.full_name || "Account Holder";

    const pageWidth = 210;
    const margin = 15;
    let y = 15;

    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("CARD ACCOUNT STATEMENT", margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `CARD ACCOUNT STATEMENT ${accountNumber} for period ${formatDateRu(start.toISOString())} - ${formatDateRu(end.toISOString())}`,
      margin, y, { maxWidth: pageWidth - margin * 2 }
    );
    y += 10;

    // Info block
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const infoLines = [
      `Statement date: ${formatDateRu(new Date().toISOString())}`,
      `Account currency: Russian Ruble (RUB)`,
      `Account holder: ${ownerName}`,
      `Opening balance date: ${formatDateRu(start.toISOString())}`,
      `Branch: Regional Branch`,
    ];

    for (const line of infoLines) {
      doc.text(line, margin, y);
      y += 5;
    }

    // Calculate opening balance
    const income = filteredTransactions.filter((t) => t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);
    const expense = filteredTransactions.filter((t) => !t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);
    const currentBalance = account?.balance ?? 0;
    const openingBalance = currentBalance - income + expense;

    doc.text(`Opening balance in account currency: ${formatAmount(openingBalance)} RUB`, margin, y);
    y += 8;

    // Section title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIRMED TRANSACTIONS", margin, y);
    doc.setFont("helvetica", "normal");
    y += 4;

    // Transactions table
    const tableHeaders = [
      "Transaction\nDate",
      "Debit",
      "Credit",
      "Description",
      "Currency",
      "Amount in\nCurrency",
    ];

    const tableData = filteredTransactions.map((t) => {
      const expenseVal = !t.is_income ? formatAmount(t.amount) : "0.00";
      const incomeVal = t.is_income ? formatAmount(t.amount) : "0.00";
      const description = `${t.is_income ? "Income" : "Payment"}: ${t.name}\nCategory: ${t.category}`;
      const amountInCurrency = t.is_income
        ? formatAmount(t.amount)
        : `-${formatAmount(t.amount)}`;

      return [
        formatDateRu(t.date),
        expenseVal,
        incomeVal,
        description,
        "RUB",
        amountInCurrency,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        font: "helvetica",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "normal",
        halign: "left",
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22, halign: "right" },
        2: { cellWidth: 22, halign: "right" },
        3: { cellWidth: 70 },
        4: { cellWidth: 22 },
        5: { cellWidth: 24, halign: "right" },
      },
      theme: "grid",
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.section === "body") {
          // Color expenses red, income green
          if (data.column.index === 1) {
            const text = data.cell.raw as string;
            if (text !== "0.00") {
              data.cell.styles.textColor = [180, 30, 30];
            }
          }
          if (data.column.index === 2) {
            const text = data.cell.raw as string;
            if (text !== "0.00") {
              data.cell.styles.textColor = [30, 120, 30];
            }
          }
        }
      },
    });

    // Footer - closing balance
    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    let footerY = finalY + 8;

    if (footerY > 270) {
      doc.addPage();
      footerY = 20;
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    doc.text(`Closing balance date: ${formatDateRu(end.toISOString())}`, margin, footerY);
    footerY += 5;
    doc.text(`Closing balance in account currency: ${formatAmount(currentBalance)} RUB`, margin, footerY);
    footerY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PENDING TRANSACTIONS", margin, footerY);
    doc.setFont("helvetica", "normal");
    footerY += 6;
    doc.setFontSize(9);
    doc.text(`Available balance as of statement date including pending transactions: ${formatAmount(currentBalance)} RUB`, margin, footerY, {
      maxWidth: pageWidth - margin * 2,
    });

    return doc;
  };

  const generateCSV = () => {
    const headers = ["Date", "Debit", "Credit", "Description", "Category", "Currency"];
    const rows = filteredTransactions.map((t) => [
      formatDateRu(t.date),
      !t.is_income ? formatAmount(t.amount) : "0.00",
      t.is_income ? formatAmount(t.amount) : "0.00",
      `"${t.name}"`,
      `"${t.category}"`,
      "RUB",
    ]);

    const income = filteredTransactions.filter((t) => t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expense = filteredTransactions.filter((t) => !t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const summary = [
      [],
      ["SUMMARY"],
      ["Income", "", formatAmount(income), "", "", ""],
      ["Expenses", formatAmount(expense), "", "", "", ""],
      ["Balance", "", "", formatAmount(income - expense), "", ""],
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Выписка по счёту</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
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
      </SheetContent>
    </Sheet>
  );
};

export default StatementExportModal;
