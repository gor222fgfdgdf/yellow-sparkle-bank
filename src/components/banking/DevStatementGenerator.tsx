import { useState, useMemo, useCallback } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Share2, Calendar, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DevStatementGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

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

// ---- Formatting helpers (same as StatementExportModal) ----
const formatDateRu = (dateString: string) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const formatDateEn = (dateString: string) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatAmountRu = (value: number) => {
  const abs = Math.abs(value);
  const parts = abs.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart},${parts[1]}`;
};

const formatSignedRu = (value: number) => {
  if (value === 0) return "0,00";
  const formatted = formatAmountRu(value);
  return value < 0 ? `-${formatted}` : formatted;
};

const formatAmountEn = (value: number) => {
  const abs = Math.abs(value);
  const parts = abs.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${intPart}.${parts[1]}`;
};

const formatSignedEn = (value: number) => {
  if (value === 0) return "0.00";
  const formatted = formatAmountEn(value);
  return value < 0 ? `-${formatted}` : formatted;
};

const genMerchantCode = (txId: string) => {
  const hash = txId.replace(/-/g, '').slice(0, 6);
  const n = parseInt(hash, 16);
  const letter = String.fromCharCode(65 + (n % 26));
  return `S1${letter}${(n % 9000 + 1000)}`;
};

const genSbpId = (txId: string) => {
  const hash = txId.replace(/-/g, '');
  return hash.slice(0, 9).replace(/[a-f]/gi, (c) => String(parseInt(c, 16)));
};

const buildStatementDescription = (tx: Transaction, dateStr: string) => {
  const name = tx.name;
  const nameLower = name.toLowerCase();
  const catLower = (tx.category || '').toLowerCase();
  const txCurrency = tx.currency || 'RUB';
  const isForex = txCurrency !== 'RUB';

  if (nameLower.includes('комиссия') && nameLower.includes('информир')) {
    return 'Комиссия за услугу информирования по счету';
  }
  if (isForex && !tx.is_income) {
    const countryMap: Record<string, string> = { 'THB': 'THA', 'VND': 'VNM', 'USD': 'USA', 'EUR': 'EUR', 'CNY': 'CHN' };
    const country = countryMap[txCurrency] || 'INT';
    const merchantCode = genMerchantCode(tx.id);
    if (nameLower.includes('atm') || catLower.includes('снятие')) {
      return `${country}, ATM ${name.replace(/atm/i, '').trim()}\n${merchantCode}`;
    }
    return `${country},\n${merchantCode}\n${name}`;
  }
  if (catLower.includes('зарплат') || nameLower.includes('мани мен')) {
    if (nameLower.includes('аванс')) return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nЗачисление аванса\nот ООО МФК «Мани Мен» (ИНН 7704784072)`;
    if (nameLower.includes('отпускн')) return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nЗачисление отпускных\nот ООО МФК «Мани Мен» (ИНН 7704784072)`;
    return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nЗачисление заработной платы и премии\nот ООО МФК «Мани Мен» (ИНН 7704784072)`;
  }
  if (tx.is_income && (nameLower.includes('перевод') || catLower.includes('перевод'))) {
    const sbpId = genSbpId(tx.id);
    return `Перевод через СБП от ${name} на 4081781051 4230007456.\nИдентификатор операции в СБП С2С ${sbpId}\nДата операции ${dateStr}\nСтатус перевода Исполнен`;
  }
  if (!tx.is_income && (nameLower.includes('перевод') || catLower.includes('перевод'))) {
    const sbpId = genSbpId(tx.id);
    return `Перевод ${name} через СБП, по номеру телефона, ID перевода ${sbpId}, дата ${dateStr}`;
  }
  if (nameLower.includes('сбп') || nameLower.includes('sbp') || nameLower.includes('plati')) {
    const sbpId = genSbpId(tx.id);
    return `Оплата товаров и услуг ${name.replace(/через СБП/i, '').trim()} через СБП, ID перевода ${sbpId}, дата ${dateStr}`;
  }
  if (catLower.includes('связь') || nameLower.includes('мтс') || nameLower.includes('билайн') || nameLower.includes('мегафон') || nameLower.includes('теле2')) {
    return `Перевод денежных средств за услугу "${name}" ПАО "${name}", Дата и время операции ${dateStr}`;
  }
  if (!tx.is_income && txCurrency === 'RUB') {
    const merchantCode = genMerchantCode(tx.id);
    return `RUS, ${name}\n${merchantCode}`;
  }
  return name;
};

const buildStatementDescriptionEn = (tx: Transaction, dateStr: string) => {
  const name = tx.name;
  const nameLower = name.toLowerCase();
  const catLower = (tx.category || '').toLowerCase();
  const txCurrency = tx.currency || 'RUB';
  const isForex = txCurrency !== 'RUB';

  if (nameLower.includes('комиссия') && nameLower.includes('информир')) return 'Account information service fee';
  if (isForex && !tx.is_income) {
    const countryMap: Record<string, string> = { 'THB': 'THA', 'VND': 'VNM', 'USD': 'USA', 'EUR': 'EUR', 'CNY': 'CHN' };
    const country = countryMap[txCurrency] || 'INT';
    const merchantCode = genMerchantCode(tx.id);
    if (nameLower.includes('atm') || catLower.includes('снятие')) return `${country}, ATM ${name.replace(/atm/i, '').trim()}\n${merchantCode}`;
    return `${country},\n${merchantCode}\n${name}`;
  }
  if (catLower.includes('зарплат') || nameLower.includes('мани мен')) {
    if (nameLower.includes('аванс')) return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nAdvance payment credit\nfrom OOO MFK "Mani Men" (TIN 7704784072)`;
    if (nameLower.includes('отпускн')) return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nVacation pay credit\nfrom OOO MFK "Mani Men" (TIN 7704784072)`;
    return `RUS, DBO TRANSFER RSHB INTERNET-BANK\nSalary and bonus credit\nfrom OOO MFK "Mani Men" (TIN 7704784072)`;
  }
  if (tx.is_income && (nameLower.includes('перевод') || catLower.includes('перевод'))) {
    const sbpId = genSbpId(tx.id);
    return `FPS transfer from ${name} to 4081781051 4230007456.\nFPS operation ID C2C ${sbpId}\nOperation date ${dateStr}\nTransfer status Completed`;
  }
  if (!tx.is_income && (nameLower.includes('перевод') || catLower.includes('перевод'))) {
    const sbpId = genSbpId(tx.id);
    return `Transfer to ${name} via FPS, by phone number, transfer ID ${sbpId}, date ${dateStr}`;
  }
  if (nameLower.includes('сбп') || nameLower.includes('sbp') || nameLower.includes('plati')) {
    const sbpId = genSbpId(tx.id);
    return `Payment for goods and services ${name.replace(/через СБП/i, '').trim()} via FPS, transfer ID ${sbpId}, date ${dateStr}`;
  }
  if (catLower.includes('связь') || nameLower.includes('мтс') || nameLower.includes('билайн') || nameLower.includes('мегафон') || nameLower.includes('теле2')) {
    return `Funds transfer for service "${name}" PJSC "${name}", Operation date ${dateStr}`;
  }
  if (!tx.is_income && txCurrency === 'RUB') {
    const merchantCode = genMerchantCode(tx.id);
    return `RUS, ${name}\n${merchantCode}`;
  }
  return name;
};

// ---- Component ----
const DevStatementGenerator = ({ isOpen, onClose }: DevStatementGeneratorProps) => {
  const { user } = useAuth();
  const { data: accounts = [] } = useAccounts();
  const { data: profile } = useProfile();

  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [startDate, setStartDate] = useState<string>("2024-01-01");
  const [endDate, setEndDate] = useState<string>("2026-12-31");
  const [isExporting, setIsExporting] = useState(false);
  const [readyBlob, setReadyBlob] = useState<Blob | null>(null);
  const [readyFilename, setReadyFilename] = useState("");
  const [sixMonthAnchor, setSixMonthAnchor] = useState<string>("");

  const apply6Months = useCallback((anchorDate: string) => {
    if (!anchorDate) return;
    const end = new Date(anchorDate);
    const start = new Date(anchorDate);
    start.setMonth(start.getMonth() - 6);
    start.setDate(start.getDate() + 1);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  }, []);

  // Fetch ALL transactions without date filter (includes future)
  const { data: allTransactions = [], isLoading } = useQuery({
    queryKey: ["dev-all-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user && isOpen,
  });

  const filteredTransactions = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return allTransactions
      .filter((t) => {
        const d = new Date(t.date);
        const inRange = d >= start && d <= end;
        const accountMatch = selectedAccount === "all" || t.account_id === selectedAccount;
        return inRange && accountMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, startDate, endDate, selectedAccount]);

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
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
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

  const buildTableRow = (tx: Transaction, isRu: boolean) => {
    const dateStr = isRu ? formatDateRu(tx.date) : formatDateEn(tx.date);
    const debitVal = !tx.is_income ? -Math.abs(tx.amount) : 0;
    const creditVal = tx.is_income ? Math.abs(tx.amount) : 0;

    const fmt = isRu ? formatSignedRu : formatSignedEn;
    const fmtAbs = isRu ? formatAmountRu : formatAmountEn;

    const debitStr = debitVal !== 0 ? fmt(debitVal) : (isRu ? "0,00" : "0.00");
    const creditStr = creditVal !== 0 ? fmtAbs(creditVal) : (isRu ? "0,00" : "0.00");

    const description = isRu ? buildStatementDescription(tx, dateStr) : buildStatementDescriptionEn(tx, dateStr);

    const txCurrency = tx.currency || 'RUB';
    const isForex = txCurrency !== 'RUB';

    const currencyDisplayMapRu: Record<string, string> = { 'RUB': 'Российский\nрубль', 'THB': 'Бат', 'VND': 'Донг', 'USD': 'Доллар\nСША', 'EUR': 'Евро', 'CNY': 'Юань' };
    const currencyDisplayMapEn: Record<string, string> = { 'RUB': 'Russian\nRuble', 'THB': 'Baht', 'VND': 'Dong', 'USD': 'US\nDollar', 'EUR': 'Euro', 'CNY': 'Yuan' };
    const currencyDisplay = (isRu ? currencyDisplayMapRu : currencyDisplayMapEn)[txCurrency] || txCurrency;

    let currAmountStr: string;
    if (isForex && tx.original_amount != null) {
      currAmountStr = debitVal !== 0 ? fmt(-Math.abs(tx.original_amount)) : fmtAbs(Math.abs(tx.original_amount));
    } else {
      currAmountStr = debitVal !== 0 ? fmt(debitVal) : fmtAbs(creditVal);
    }

    const commissionVal = tx.commission || 0;
    const commissionStr = commissionVal !== 0 ? fmt(-Math.abs(commissionVal)) : (isRu ? "0,00" : "0.00");

    const nameLower = tx.name.toLowerCase();
    const catLower = (tx.category || '').toLowerCase();
    const isTransferOrSBP = nameLower.includes('перевод') || nameLower.includes('сбп') || nameLower.includes('sbp') || catLower.includes('перевод') || catLower.includes('пополнение') || nameLower.includes('пополнение') || nameLower.includes('мани мен');
    const cardStr = !isTransferOrSBP ? "6234 46**\n**** 7694" : "";

    return { row: [dateStr, dateStr, debitStr, creditStr, description, currencyDisplay, currAmountStr, commissionStr, cardStr], debitVal, creditVal };
  };

  const generatePDF = async () => {
    const isRu = lang === "ru";
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    await loadFont(doc);

    const account = selectedAccount !== "all" ? accounts.find((a) => a.id === selectedAccount) : null;
    const accountNumber = account?.account_number || "40817810514230007456";
    const ownerName = profile?.full_name || (isRu ? "Владелец счёта" : "Account Holder");

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const pageWidth = 297;
    const margin = 14;
    const fn = "Roboto";
    let y = 16;

    const fmtDate = isRu ? formatDateRu : formatDateEn;
    const fmtSigned = isRu ? formatSignedRu : formatSignedEn;
    const fmtAbs = isRu ? formatAmountRu : formatAmountEn;

    // Title
    doc.setFontSize(12);
    doc.setFont(fn, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(isRu ? "ВЫПИСКА ПО КАРТОЧНОМУ СЧЕТУ" : "CARD ACCOUNT STATEMENT", pageWidth / 2, y, { align: "center" });
    y += 8;

    const periodLabel = isRu
      ? `ВЫПИСКА ПО КАРТОЧНОМУ СЧЕТУ ${accountNumber} за период с ${fmtDate(start.toISOString())} по ${fmtDate(end.toISOString())}`
      : `CARD ACCOUNT STATEMENT ${accountNumber} for the period from ${fmtDate(start.toISOString())} to ${fmtDate(end.toISOString())}`;
    doc.setFontSize(11);
    doc.text(periodLabel, pageWidth / 2, y, { align: "center", maxWidth: pageWidth - margin * 2 });
    y += 10;

    doc.setFontSize(10);
    doc.setFont(fn, "normal");
    const statementDateStr = fmtDate(end.toISOString());
    const infoLines = isRu ? [
      `Дата выписки: ${statementDateStr}`,
      `Валюта счёта: Российский рубль`,
      `Владелец счёта: ${ownerName}`,
      `Дата входящего остатка: ${fmtDate(start.toISOString())}`,
      `Филиал/Отделение: Воронежский региональный филиал`,
    ] : [
      `Statement date: ${statementDateStr}`,
      `Account currency: Russian Ruble`,
      `Account holder: ${ownerName}`,
      `Opening balance date: ${fmtDate(start.toISOString())}`,
      `Branch/Office: Voronezh Regional Branch`,
    ];
    infoLines.forEach((line) => { doc.text(line, margin, y); y += 5; });

    // Calculate balances
    const income = filteredTransactions.filter(tx => tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const expense = filteredTransactions.filter(tx => !tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const closingBalance = account ? account.balance : accounts.reduce((s, a) => s + a.balance, 0);
    const openingBalance = closingBalance - income + expense;

    doc.text(
      isRu
        ? `Сумма входящего остатка в валюте счета на дату начала периода: ${fmtSigned(openingBalance)}`
        : `Opening balance in account currency at the beginning of the period: ${fmtSigned(openingBalance)}`,
      margin, y
    );
    y += 8;

    doc.setFontSize(10);
    doc.setFont(fn, "bold");
    doc.text(isRu ? "ПОДТВЕРЖДЕННЫЕ ОПЕРАЦИИ" : "CONFIRMED OPERATIONS", margin, y);
    y += 4;

    const tableHeaders = isRu ? [
      "Дата\nпроведения\nоперации", "Дата\nсовершения\nоперации", "Расход\nпо счету", "Приход\nпо счету",
      "Содержание\nоперации", "Валюта\nоперации", "Сумма в\nвалюте\nоперации", "Комиссия в\nвалюте\nоперации", "№ карты",
    ] : [
      "Processing\ndate", "Transaction\ndate", "Account\ndebit", "Account\ncredit",
      "Transaction\ndescription", "Transaction\ncurrency", "Amount in\ntransaction\ncurrency", "Commission\nin transaction\ncurrency", "Card No.",
    ];

    const sortedDesc = filteredTransactions.slice().sort((a, b) => {
      const dd = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dd !== 0) return dd;
      return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
    });

    let totalDebit = 0;
    let totalCredit = 0;
    const tableData = sortedDesc.map((tx) => {
      const { row, debitVal, creditVal } = buildTableRow(tx, isRu);
      if (debitVal < 0) totalDebit += debitVal;
      if (creditVal > 0) totalCredit += creditVal;
      return row;
    });

    tableData.push(["", "", fmtSigned(totalDebit), fmtAbs(totalCredit), "", "", "", "", ""]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 2, font: fn, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", halign: "left", lineWidth: 0.2, lineColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 24, halign: "left" }, 1: { cellWidth: 24, halign: "left" },
        2: { cellWidth: 28, halign: "right" }, 3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 75 }, 5: { cellWidth: 26 },
        6: { cellWidth: 28, halign: "right" }, 7: { cellWidth: 25, halign: "right" },
        8: { cellWidth: 11 },
      },
      theme: "grid", rowPageBreak: "avoid", margin: { left: margin, right: margin },
      didParseCell: (data) => {
        if (data.section === "body" && data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    let footerY = finalY + 6;
    if (footerY > 185) { doc.addPage(); footerY = 20; }

    doc.setFontSize(9);
    doc.setFont(fn, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(isRu ? `Дата исходящего остатка: ${fmtDate(end.toISOString())}` : `Closing balance date: ${fmtDate(end.toISOString())}`, margin, footerY);
    footerY += 5;
    doc.text(
      isRu
        ? `Исходящий остаток в валюте счета на дату окончания периода: ${fmtSigned(closingBalance)}`
        : `Closing balance in account currency at the end of the period: ${fmtSigned(closingBalance)}`,
      margin, footerY
    );
    footerY += 10;

    doc.setFontSize(10);
    doc.setFont(fn, "bold");
    doc.text(isRu ? "ОПЕРАЦИИ, ОЖИДАЮЩИЕ ОБРАБОТКИ" : "PENDING OPERATIONS", margin, footerY);
    footerY += 4;

    const pendingHeaders = isRu
      ? ["Дата совершения\nоперации", "Сумма в валюте\nоперации", "Комиссия в валюте\nоперации", "Валюта\nоперации", "Содержание\nоперации", "№ карты"]
      : ["Transaction\ndate", "Amount in\ntransaction currency", "Commission in\ntransaction currency", "Transaction\ncurrency", "Transaction\ndescription", "Card No."];

    autoTable(doc, {
      startY: footerY, head: [pendingHeaders], body: [],
      styles: { fontSize: 9, cellPadding: 2, font: fn, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", halign: "left", lineWidth: 0.2, lineColor: [0, 0, 0] },
      theme: "grid", margin: { left: margin, right: margin },
    });

    const pendingFinalY = (doc as any).lastAutoTable?.finalY || footerY + 15;
    let afterPendingY = pendingFinalY + 6;
    if (afterPendingY > 270) { doc.addPage(); afterPendingY = 20; }

    doc.setFontSize(9);
    doc.setFont(fn, "normal");
    doc.text(
      isRu
        ? `Сумма доступного остатка на дату формирования выписки с учетом неподтвержденных операций: ${fmtSigned(closingBalance)}`
        : `Available balance as of the statement date including pending operations: ${fmtSigned(closingBalance)}`,
      margin, afterPendingY
    );

    return doc;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setReadyBlob(null);
    try {
      const doc = await generatePDF();
      const filename = lang === "en"
        ? `dev_statement_${startDate}_${endDate}.pdf`
        : `dev_vypiska_${startDate}_${endDate}.pdf`;
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
        toast.success("Выписка скачана");
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
      if (e?.name !== "AbortError") toast.error("Ошибка при отправке");
    }
  };

  const incomeSum = filteredTransactions.filter(tx => tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const expensesSum = filteredTransactions.filter(tx => !tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const totalAll = allTransactions.length;
  const futureCount = allTransactions.filter(tx => new Date(tx.date) > new Date()).length;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="🛠 Dev: Выписка из будущего">
      <div className="space-y-5">
        {/* Info badge */}
        <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1">
          <p className="font-semibold text-sm">⚡ Режим разработки</p>
          <p className="text-muted-foreground">Генерация выписок за любые даты, включая будущие транзакции</p>
          {isLoading ? (
            <div className="flex items-center gap-2 pt-1"><Loader2 className="w-3 h-3 animate-spin" /><span>Загрузка…</span></div>
          ) : (
            <>
              <p>Всего транзакций: <strong>{totalAll}</strong></p>
              <p>Из них будущих: <strong>{futureCount}</strong></p>
            </>
          )}
        </div>

        {/* Account */}
        <div className="space-y-2">
          <Label>Счёт</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все счета</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>Язык выписки</Label>
          <Select value={lang} onValueChange={(v) => setLang(v as "ru" | "en")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>С</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>По</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>

        {/* Quick date buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Март 2026", s: "2026-03-01", e: "2026-03-31" },
            { label: "Q1 2026", s: "2026-01-01", e: "2026-03-31" },
            { label: "2025", s: "2025-01-01", e: "2025-12-31" },
            { label: "2024", s: "2024-01-01", e: "2024-12-31" },
            { label: "Всё", s: "2020-01-01", e: "2030-12-31" },
          ].map((q) => (
            <Button
              key={q.label}
              variant="outline"
              size="sm"
              onClick={() => { setStartDate(q.s); setEndDate(q.e); setSixMonthAnchor(""); }}
              className="text-xs"
            >
              {q.label}
            </Button>
          ))}
        </div>

        {/* 6-month range with anchor date */}
        <div className="space-y-2">
          <Label>За 6 месяцев до указанной даты</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                type="date" 
                value={sixMonthAnchor} 
                onChange={(e) => {
                  setSixMonthAnchor(e.target.value);
                  apply6Months(e.target.value);
                }} 
                className="pl-10" 
                placeholder="Конечная дата"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setSixMonthAnchor(today);
                apply6Months(today);
              }}
              className="text-xs whitespace-nowrap"
            >
              Сегодня
            </Button>
          </div>
          {sixMonthAnchor && (
            <p className="text-xs text-muted-foreground">
              Период: {startDate} — {endDate}
            </p>
          )}
        </div>

        {/* Export */}
        <Button onClick={handleExport} className="w-full" disabled={isExporting || isLoading}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Генерация..." : `Сформировать выписку (${filteredTransactions.length} оп.)`}
        </Button>

        {readyBlob && (
          <Button onClick={handleShare} className="w-full" variant="default">
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться PDF
          </Button>
        )}

        {/* Preview stats */}
        {filteredTransactions.length > 0 && (
          <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Операций:</span>
              <span className="font-medium">{filteredTransactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Поступления:</span>
              <span className="text-success font-medium">+{incomeSum.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Расходы:</span>
              <span className="text-destructive font-medium">−{expensesSum.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>
        )}
      </div>
    </FullScreenModal>
  );
};

export default DevStatementGenerator;
