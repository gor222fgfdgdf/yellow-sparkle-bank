import { useState, useMemo } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Check, Calendar, Share2 } from "lucide-react";
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
  created_at?: string;
  currency?: string;
  original_amount?: number | null;
  commission?: number | null;
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

/** Russian number format: 10 000,00 */
const formatAmountRu = (value: number) => {
  const abs = Math.abs(value);
  const parts = abs.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart},${parts[1]}`;
};

/** Signed Russian amount: -10 000,00 or 10 000,00 */
const formatSignedRu = (value: number) => {
  if (value === 0) return "0,00";
  const formatted = formatAmountRu(value);
  return value < 0 ? `-${formatted}` : formatted;
};

// Generate a random merchant code like S1C4304, S1B9576
const genMerchantCode = (txId: string) => {
  const hash = txId.replace(/-/g, '').slice(0, 6);
  const n = parseInt(hash, 16);
  const letter = String.fromCharCode(65 + (n % 26));
  return `S1${letter}${(n % 9000 + 1000)}`;
};

// Generate a random SBP ID
const genSbpId = (txId: string) => {
  const hash = txId.replace(/-/g, '');
  return hash.slice(0, 9).replace(/[a-f]/gi, (c) => String(parseInt(c, 16)));
};

// Build detailed description matching RSHB original format
const buildStatementDescription = (tx: Transaction, dateStr: string) => {
  const name = tx.name;
  const nameLower = name.toLowerCase();
  const catLower = (tx.category || '').toLowerCase();
  const txCurrency = tx.currency || 'RUB';
  const isForex = txCurrency !== 'RUB';

  // Комиссия за информирование
  if (nameLower.includes('комиссия') && nameLower.includes('информир')) {
    return 'Комиссия за услугу информирования по счету';
  }

  // Foreign card transactions (THB, VND, etc.)
  if (isForex && !tx.is_income) {
    const countryMap: Record<string, string> = { 'THB': 'THA', 'VND': 'VNM', 'USD': 'USA', 'EUR': 'EUR', 'CNY': 'CHN' };
    const country = countryMap[txCurrency] || 'INT';
    const merchantCode = genMerchantCode(tx.id);
    if (nameLower.includes('atm') || catLower.includes('снятие')) {
      return `${country}, ATM ${name.replace(/atm/i, '').trim()}\n${merchantCode}`;
    }
    return `${country},\n${merchantCode}\n${name}`;
  }

  // Salary
  if (catLower.includes('зарплат') || nameLower.includes('мани мен')) {
    if (nameLower.includes('аванс')) {
      return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nЗачисление аванса\nот ООО МФК «Мани Мен» (ИНН 7704784072)`;
    }
    if (nameLower.includes('отпускн')) {
      return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nЗачисление отпускных\nот ООО МФК «Мани Мен» (ИНН 7704784072)`;
    }
    return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nЗачисление заработной платы и премии\nот ООО МФК «Мани Мен» (ИНН 7704784072)`;
  }

  // SBP transfers (incoming)
  if (tx.is_income && (nameLower.includes('перевод') || catLower.includes('перевод'))) {
    const sbpId = genSbpId(tx.id);
    return `Перевод через СБП от ${name} на 4081781051 4230007456.\nИдентификатор операции в СБП С2С ${sbpId}\nДата операции ${dateStr}\nСтатус перевода Исполнен`;
  }

  // SBP transfers (outgoing)
  if (!tx.is_income && (nameLower.includes('перевод') || catLower.includes('перевод'))) {
    const sbpId = genSbpId(tx.id);
    return `Перевод ${name} через СБП, по номеру телефона, ID перевода ${sbpId}, дата ${dateStr}`;
  }

  // SBP payments (оплата товаров)
  if (nameLower.includes('сбп') || nameLower.includes('sbp') || nameLower.includes('plati')) {
    const sbpId = genSbpId(tx.id);
    return `Оплата товаров и услуг ${name.replace(/через СБП/i, '').trim()} через СБП, ID перевода ${sbpId}, дата ${dateStr}`;
  }

  // Mobile/Telecom payments
  if (catLower.includes('связь') || nameLower.includes('мтс') || nameLower.includes('билайн') || nameLower.includes('мегафон') || nameLower.includes('теле2')) {
    return `Перевод денежных средств за услугу "${name}" ПАО "${name}", Дата и время операции ${dateStr}`;
  }

  // Regular RUB card purchase
  if (!tx.is_income && txCurrency === 'RUB') {
    const merchantCode = genMerchantCode(tx.id);
    return `RUS, ${name}\n${merchantCode}`;
  }

  return name;
};

const StatementExportModal = ({ isOpen, onClose, transactions, accounts }: StatementExportModalProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");
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
      case "halfyear":
        start.setMonth(now.getMonth() - 6);
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

  const loadFont = async (doc: jsPDF) => {
    try {
      const [regularResp, boldResp] = await Promise.all([
        fetch("/fonts/Roboto-Regular.ttf"),
        fetch("/fonts/Roboto-Bold.ttf"),
      ]);

      const [regularBuf, boldBuf] = await Promise.all([
        regularResp.arrayBuffer(),
        boldResp.arrayBuffer(),
      ]);

      const toBase64 = (buf: ArrayBuffer) => {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };

      doc.addFileToVFS("Roboto-Regular.ttf", toBase64(regularBuf));
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

      doc.addFileToVFS("Roboto-Bold.ttf", toBase64(boldBuf));
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
    } catch (e) {
      console.error("Failed to load Roboto font:", e);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    await loadFont(doc);

    const { start, end } = getDateRange();
    const account = selectedAccount !== "all" ? accounts.find((a) => a.id === selectedAccount) : null;
    const accountNumber = account?.account_number || "40817810514230007456";
    const ownerName = profile?.full_name || "Владелец счёта";

    const pageWidth = 297;
    const margin = 14;
    const fn = "Roboto";
    let y = 16;

    // Title
    doc.setFontSize(11);
    doc.setFont(fn, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ВЫПИСКА ПО КАРТОЧНОМУ СЧЕТУ", pageWidth / 2, y, { align: "center" });
    y += 8;

    // Subtitle
    doc.setFontSize(10);
    doc.setFont(fn, "bold");
    doc.text(
      `ВЫПИСКА ПО КАРТОЧНОМУ СЧЕТУ ${accountNumber} за период с ${formatDateRu(start.toISOString())} по ${formatDateRu(end.toISOString())}`,
      pageWidth / 2, y, { align: "center", maxWidth: pageWidth - margin * 2 }
    );
    y += 10;

    // Info fields
    doc.setFontSize(9);
    doc.setFont(fn, "normal");
    const infoLines = [
      `Дата выписки: ${formatDateRu(new Date().toISOString())}`,
      `Валюта счёта: Российский рубль`,
      `Владелец счёта: ${ownerName}`,
      `Дата входящего остатка: ${formatDateRu(start.toISOString())}`,
      `Филиал/Отделение: Воронежский региональный филиал`,
    ];
    infoLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 5;
    });

    // Calculate opening balance
    const sortedAsc = filteredTransactions.slice().sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime();
    });
    const income = sortedAsc.filter((tx) => tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const expense = sortedAsc.filter((tx) => !tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const closingBalance = account ? account.balance : accounts.reduce((s, a) => s + a.balance, 0);
    const openingBalance = closingBalance - income + expense;

    doc.text(`Сумма входящего остатка в валюте счета на дату начала периода: ${formatSignedRu(openingBalance)}`, margin, y);
    y += 8;

    // Section title
    doc.setFontSize(10);
    doc.setFont(fn, "bold");
    doc.text("ПОДТВЕРЖДЕННЫЕ ОПЕРАЦИИ", margin, y);
    y += 4;

    // 9-column table matching RSHB format
    const tableHeaders = [
      "Дата\nпроведения\nоперации",
      "Дата\nсовершения\nоперации",
      "Расход\nпо счету",
      "Приход\nпо счету",
      "Содержание\nоперации",
      "Валюта\nоперации",
      "Сумма в\nвалюте\nоперации",
      "Комиссия\nв валюте",
      "№ карты",
    ];

    // Sort descending by date (newest first)
    const sortedDesc = filteredTransactions.slice().sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
    });

    let totalDebit = 0;
    let totalCredit = 0;

    const tableData = sortedDesc.map((tx) => {
      const dateStr = formatDateRu(tx.date);
      const debitVal = !tx.is_income ? -Math.abs(tx.amount) : 0;
      const creditVal = tx.is_income ? Math.abs(tx.amount) : 0;

      if (debitVal < 0) totalDebit += debitVal;
      if (creditVal > 0) totalCredit += creditVal;

      const debitStr = debitVal !== 0 ? formatSignedRu(debitVal) : "0,00";
      const creditStr = creditVal !== 0 ? formatAmountRu(creditVal) : "0,00";

      const description = buildStatementDescription(tx, dateStr);

      const txCurrency = tx.currency || 'RUB';
      const isForex = txCurrency !== 'RUB';
      
      const currencyDisplayMap: Record<string, string> = {
        'RUB': 'Российский\nрубль',
        'THB': 'Бат',
        'VND': 'Донг',
        'USD': 'Доллар\nСША',
        'EUR': 'Евро',
        'CNY': 'Юань',
      };
      const currencyDisplay = currencyDisplayMap[txCurrency] || txCurrency;

      let currAmountStr: string;
      if (isForex && tx.original_amount != null) {
        currAmountStr = debitVal !== 0 
          ? formatSignedRu(-Math.abs(tx.original_amount)) 
          : formatAmountRu(Math.abs(tx.original_amount));
      } else {
        currAmountStr = debitVal !== 0 ? formatSignedRu(debitVal) : formatAmountRu(creditVal);
      }

      const commissionVal = tx.commission || 0;
      const commissionStr = commissionVal !== 0 ? formatSignedRu(-Math.abs(commissionVal)) : "0,00";

      const nameLower = tx.name.toLowerCase();
      const catLower = (tx.category || '').toLowerCase();
      const isTransferOrSBP = nameLower.includes('перевод') || nameLower.includes('сбп') || nameLower.includes('sbp') || catLower.includes('перевод') || catLower.includes('пополнение') || nameLower.includes('пополнение') || nameLower.includes('мани мен');
      const cardStr = !isTransferOrSBP ? "6234 46**\n**** 7694" : "";

      return [
        dateStr,
        dateStr,
        debitStr,
        creditStr,
        description,
        currencyDisplay,
        currAmountStr,
        commissionStr,
        cardStr,
      ];
    });

    // Add totals row
    tableData.push([
      "", "", formatSignedRu(totalDebit), formatAmountRu(totalCredit), "", "", "", "", "",
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 2,
        font: fn,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "left",
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 24, halign: "left" },
        1: { cellWidth: 24, halign: "left" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 80 },
        5: { cellWidth: 26 },
        6: { cellWidth: 28, halign: "right" },
        7: { cellWidth: 20, halign: "right" },
        8: { cellWidth: 11 },
      },
      theme: "grid",
      rowPageBreak: "avoid",
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.section === "body") {
          const isLast = data.row.index === tableData.length - 1;
          if (isLast) {
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    // Footer after table
    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    let footerY = finalY + 6;

    if (footerY > 185) {
      doc.addPage();
      footerY = 20;
    }

    doc.setFontSize(9);
    doc.setFont(fn, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Дата исходящего остатка: ${formatDateRu(end.toISOString())}`, margin, footerY);
    footerY += 5;
    doc.text(`Исходящий остаток в валюте счета на дату окончания периода: ${formatSignedRu(closingBalance)}`, margin, footerY);
    footerY += 10;

    // Pending operations section
    doc.setFontSize(10);
    doc.setFont(fn, "bold");
    doc.text("ОПЕРАЦИИ, ОЖИДАЮЩИЕ ОБРАБОТКИ", margin, footerY);
    footerY += 4;

    const pendingHeaders = [
      "Дата совершения\nоперации",
      "Сумма в валюте\nоперации",
      "Комиссия в валюте\nоперации",
      "Валюта\nоперации",
      "Содержание\nоперации",
      "№ карты",
    ];

    autoTable(doc, {
      startY: footerY,
      head: [pendingHeaders],
      body: [],
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        font: fn,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "left",
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
      theme: "grid",
      margin: { left: margin, right: margin },
    });

    const pendingFinalY = (doc as any).lastAutoTable?.finalY || footerY + 15;
    let afterPendingY = pendingFinalY + 6;

    if (afterPendingY > 270) {
      doc.addPage();
      afterPendingY = 20;
    }

    doc.setFontSize(8);
    doc.setFont(fn, "normal");
    doc.text(
      `Сумма доступного остатка на дату формирования выписки с учетом неподтвержденных операций: ${formatSignedRu(closingBalance)}`,
      margin, afterPendingY
    );

    return doc;
  };

  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyFilename, setReadyFilename] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    setReadyBlob(null);
    try {
      const doc = await generatePDF();
      const filename = `vypiska_${new Date().toISOString().split("T")[0]}.pdf`;
      const blob = doc.output("blob");

      const file = new File([blob], filename, { type: "application/pdf" });
      const shareData = { files: [file], title: filename };
      if (navigator.canShare && navigator.canShare(shareData)) {
        setReadyBlob(blob);
        setReadyFilename(filename);
        toast.success("Выписка готова — нажмите «Поделиться»");
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        toast.success("Выписка скачана в PDF");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при экспорте");
    }
    setIsExporting(false);
  };

  const handleShare = async () => {
    if (!readyBlob) return;
    try {
      const file = new File([readyBlob], readyFilename, { type: "application/pdf" });
      await navigator.share({ files: [file], title: readyFilename });
      toast.success("Выписка отправлена");
      setReadyBlob(null);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.log("[PDF] share error:", e?.message);
        toast.error("Ошибка при отправке");
      }
    }
  };

  const incomeSum = filteredTransactions.filter((tx) => tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const expensesSum = filteredTransactions.filter((tx) => !tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);

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
              <SelectItem value="halfyear">За 6 месяцев</SelectItem>
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

        {/* Download Button */}
        <Button onClick={handleExport} className="w-full" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Экспорт..." : "Сформировать выписку"}
        </Button>

        {readyBlob && (
          <Button onClick={handleShare} className="w-full" variant="default">
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться PDF
          </Button>
        )}

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
                <span className="text-success font-medium">+{incomeSum.toLocaleString("ru-RU")} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Расходы:</span>
                <span className="text-destructive font-medium">−{expensesSum.toLocaleString("ru-RU")} ₽</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </FullScreenModal>
  );
};

export default StatementExportModal;
