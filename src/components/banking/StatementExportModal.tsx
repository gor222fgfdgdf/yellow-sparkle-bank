import { useState, useMemo } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Check, Calendar, Globe, Share2 } from "lucide-react";
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
  created_at?: string;
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

type Lang = "en" | "ru";

const i18n: Record<string, Record<Lang, string>> = {
  bankName: { en: "JSC Rosselkhozbank", ru: "АО «Россельхозбанк»" },
  license: { en: "License No. 3349 dated 12.08.2015", ru: "Лицензия №3349 от 12.08.2015" },
  address: { en: "119034, Moscow, Gagarinsky per., 3", ru: "119034, г. Москва, Гагаринский пер., д. 3" },
  bic: { en: "BIC 044525111 | INN 7725114488", ru: "БИК 044525111 | ИНН 7725114488" },
  title: { en: "STATEMENT OF CARD ACCOUNT", ru: "ВЫПИСКА ПО КАРТОЧНОМУ СЧЁТУ" },
  statementDate: { en: "Statement date:", ru: "Дата выписки:" },
  accountHolder: { en: "Account holder:", ru: "Владелец счёта:" },
  accountNumber: { en: "Account number:", ru: "Номер счёта:" },
  cardNumber: { en: "Card number:", ru: "Номер карты:" },
  currency: { en: "Account currency:", ru: "Валюта счёта:" },
  currencyVal: { en: "Russian Ruble (RUB)", ru: "Российский рубль" },
  branch: { en: "Branch:", ru: "Отделение:" },
  branchVal: { en: "Moscow Regional Branch No. 3349/0101", ru: "Воронежский региональный филиал" },
  period: { en: "Statement period:", ru: "Период выписки:" },
  opening: { en: "Opening balance:", ru: "Остаток на начало:" },
  closing: { en: "Closing balance:", ru: "Остаток на конец:" },
  totalDebit: { en: "Total debit:", ru: "Итого списания:" },
  totalCredit: { en: "Total credit:", ru: "Итого зачисления:" },
  transactions: { en: "TRANSACTIONS", ru: "ПОДТВЕРЖДЕННЫЕ ОПЕРАЦИИ" },
  no: { en: "No.", ru: "№" },
  dateTime: { en: "Date / Time", ru: "Дата / Время" },
  reference: { en: "Reference", ru: "Референс" },
  description: { en: "Description", ru: "Описание" },
  debit: { en: "Debit\n(RUB)", ru: "Списание\n(RUB)" },
  credit: { en: "Credit\n(RUB)", ru: "Зачисление\n(RUB)" },
  balance: { en: "Balance\n(RUB)", ru: "Остаток\n(RUB)" },
  total: { en: "TOTAL", ru: "ИТОГО" },
  footerCount: { en: "transaction(s) for the period", ru: "операций за период" },
  footerGenerated: { en: "Statement generated electronically on", ru: "Выписка сформирована электронно" },
  footerValid: { en: "and is valid without signature.", ru: "и действительна без подписи." },
  authRep: { en: "Authorized representative:", ru: "Уполномоченный представитель:" },
  authName: { en: "A. G. Osipenko", ru: "А. Г. Осипенко" },
  forPeriodFrom: { en: "for period from", ru: "за период с" },
  to: { en: "to", ru: "по" },
  noLabel: { en: "No.", ru: "№" },
  stmtContains: { en: "This statement contains", ru: "Выписка содержит" },
};

const opTypesRu: Record<string, string> = {
  "ATM Cash Withdrawal": "Выдача наличных в банкомате",
  "SBP Incoming Transfer": "Входящий перевод СБП",
  "Incoming Card Transfer": "Входящий перевод по карте",
  "SBP Outgoing Transfer": "Исходящий перевод СБП",
  "Outgoing Card Transfer": "Исходящий перевод по карте",
  "Salary Credit": "Зачисление заработной платы",
  "QR Code Payment (SBP)": "Оплата по QR-коду (СБП)",
  "Store Purchase": "Покупка в магазине",
  "Service Payment": "Оплата услуг",
  "Commission Fee": "Комиссия",
  "Loyalty Refund": "Возврат по программе лояльности",
  "Purchase": "Покупка",
};

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

const StatementExportModal = ({ isOpen, onClose, transactions, accounts }: StatementExportModalProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");
  const format = "pdf";
  const [isExporting, setIsExporting] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [lang, setLang] = useState<Lang>("ru");
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

  const generateTransactionTime = (tx: Transaction, index: number) => {
    if (tx.created_at) {
      const d = new Date(tx.created_at);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }
    const seed = parseInt(tx.id.replace(/-/g, "").substring(0, 8), 16);
    const hours = (seed + index * 3) % 14 + 8;
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

  const getOperationType = (t: Transaction): string => {
    const nameLower = t.name.toLowerCase();
    const cat = t.category;

    if (nameLower.includes('atm') || cat === 'Снятие наличных')
      return 'ATM Cash Withdrawal';

    if (cat === 'Переводы' || nameLower.includes('перевод') || nameLower.includes('transfer')) {
      if (t.is_income) {
        if (nameLower.includes('сбп') || nameLower.includes('sbp')) return 'SBP Incoming Transfer';
        return 'Incoming Card Transfer';
      }
      if (nameLower.includes('сбп') || nameLower.includes('sbp')) return 'SBP Outgoing Transfer';
      return 'Outgoing Card Transfer';
    }

    if (cat === 'Зарплата' || nameLower.includes('salary') || nameLower.includes('зарплат') || nameLower.includes('аванс') || nameLower.includes('зп и премия') || nameLower.includes('отпускн'))
      return 'Salary Credit';

    if (nameLower.includes('qr')) return 'QR Code Payment (SBP)';
    if (cat === 'Кафе и рестораны' || cat === 'Фастфуд') return 'QR Code Payment (SBP)';
    if (cat === 'Супермаркеты' || cat === 'Продукты' || cat === 'Маркетплейсы' || cat === 'Электроника' || cat === 'Одежда')
      return 'Store Purchase';
    if (cat === 'Подписки' || cat === 'Связь' || cat === 'ЖКХ') return 'Service Payment';
    if (nameLower.includes('комиссия') || nameLower.includes('commission')) return 'Commission Fee';
    if (cat === 'Все для дома' || cat === 'Дом') return 'Store Purchase';
    if (cat === 'Развлечения') return 'QR Code Payment (SBP)';
    if (cat === 'Транспорт' || cat === 'Такси') return 'Service Payment';
    if (nameLower.includes('возврат') || nameLower.includes('loyalty') || nameLower.includes('лояльност')) return 'Loyalty Refund';
    if (t.is_income) return 'Incoming Card Transfer';
    return 'Purchase';
  };

  const transliterateName = (name: string): string => {
    if (/^[a-zA-Z0-9\s.,\-*@&()\/!#$%^+=:;'"]+$/.test(name)) return name;

    const map: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
      'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
      'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y',
      'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
      'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
      'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y',
      'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    };
    return name.split('').map(c => map[c] ?? c).join('');
  };

  const buildDescription = (t: Transaction, authCode: string, cardNum: string, accountNum: string) => {
    const opTypeEn = getOperationType(t);
    const opType = lang === "ru" ? (opTypesRu[opTypeEn] || opTypeEn) : opTypeEn;
    const lastCard = cardNum.replace(/\s/g, '').slice(-4);
    const lastAcc = accountNum.slice(-4);

    const isCardOp = !t.name.toLowerCase().includes('счет') && !t.name.toLowerCase().includes('сбп');
    const opSuffix = lang === "ru"
      ? (isCardOp ? `Карта ****${lastCard}` : `Счёт ****${lastAcc}`)
      : (isCardOp ? `Card ****${lastCard}` : `Account ****${lastAcc}`);

    let safeName: string;
    if (lang !== "ru" && opTypeEn === 'Salary Credit') {
      const nl = t.name.toLowerCase();
      if (nl.includes('аванс')) safeName = 'MFK ManiMen LLC — Salary Advance';
      else if (nl.includes('отпускн')) safeName = 'MFK ManiMen LLC — Vacation Pay';
      else safeName = 'MFK ManiMen LLC — Salary & Bonus';
    } else {
      safeName = lang === "ru" ? t.name : transliterateName(t.name);
    }

    return `${opType}\n${safeName}. ${opSuffix}`;
  };

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

  const t = (key: string) => i18n[key]?.[lang] || key;
  const fontName = lang === "ru" ? "Roboto" : "helvetica";

  // ===== RUSSIAN FORMAT: exact replica of RSHB bank statement =====
  const generateRuPDF = async () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    await loadFont(doc);

    const { start, end } = getDateRange();
    const account = selectedAccount !== "all" ? accounts.find((a) => a.id === selectedAccount) : null;
    const accountNumber = account?.account_number || "40817810514230007456";
    const cardNumber = account?.card_number || "";
    const ownerName = profile?.full_name || "Владелец счёта";

    const pageWidth = 210;
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

    // Info fields (plain text, not table)
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

    // Sort descending by date (newest first), matching the original statement
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

      // Build description - use full transaction name as content
      const description = tx.name;

      // Currency amount matches debit/credit
      const currAmountStr = debitVal !== 0 ? formatSignedRu(debitVal) : formatAmountRu(creditVal);

      // Card number - show last 4 if card transaction
      const lastCard = cardNumber ? `${cardNumber.slice(-4)}` : "";
      const isCardTx = tx.name.includes("ATM") || tx.name.includes("THA") || tx.name.includes("VNM") || tx.name.includes("REST") || tx.name.includes("RUS,");
      const cardStr = isCardTx && lastCard ? lastCard : "";

      return [
        dateStr,        // Дата проведения
        dateStr,        // Дата совершения
        debitStr,       // Расход
        creditStr,      // Приход
        description,    // Содержание
        "Российский\nрубль",  // Валюта
        currAmountStr,  // Сумма в валюте
        "0,00",         // Комиссия
        cardStr,        // № карты
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
        fontSize: 7,
        cellPadding: 1.5,
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
        0: { cellWidth: 18, halign: "left" },   // Дата проведения
        1: { cellWidth: 18, halign: "left" },   // Дата совершения
        2: { cellWidth: 18, halign: "right" },  // Расход
        3: { cellWidth: 18, halign: "right" },  // Приход
        4: { cellWidth: 40 },                    // Содержание
        5: { cellWidth: 18 },                    // Валюта
        6: { cellWidth: 20, halign: "right" },  // Сумма в валюте
        7: { cellWidth: 16, halign: "right" },  // Комиссия
        8: { cellWidth: 16 },                    // № карты
      },
      theme: "grid",
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

    if (footerY > 270) {
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

    // Empty pending operations table
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

  // ===== ENGLISH FORMAT: existing professional format =====
  const generateEnPDF = async () => {
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
    } catch { }

    // Bank details on right side
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const bankInfo = [t("bankName"), t("license"), t("address"), t("bic")];
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
    doc.text(t("title"), pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${t("noLabel")} ${accountNumber} ${t("forPeriodFrom")} ${formatDateRu(start.toISOString())} ${t("to")} ${formatDateRu(end.toISOString())}`,
      pageWidth / 2, y, { align: "center" }
    );
    y += 8;

    // Info table
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    const infoData: [string, string][] = [
      [t("statementDate"), formatDateRu(new Date().toISOString())],
      [t("accountHolder"), ownerName],
      [t("accountNumber"), accountNumber],
      [t("cardNumber"), cardNumber],
      [t("currency"), t("currencyVal")],
      [t("branch"), t("branchVal")],
      [t("period"), `${formatDateRu(start.toISOString())} — ${formatDateRu(end.toISOString())}`],
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

    // Calculate balances
    const sortedAsc = filteredTransactions.slice().sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime();
    });
    const incomeVal = sortedAsc.filter((tx) => tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const expenseVal = sortedAsc.filter((tx) => !tx.is_income).reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const closingBalance = account ? account.balance : accounts.reduce((s, a) => s + a.balance, 0);
    const openingBalance = closingBalance - incomeVal + expenseVal;

    // Balance summary box
    doc.setFillColor(245, 247, 245);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`${t("opening")} ${formatAmount(openingBalance)} RUB`, margin + 4, y + 5);
    doc.text(`${t("closing")} ${formatAmount(closingBalance)} RUB`, margin + 4, y + 9.5);
    doc.text(`${t("totalDebit")} ${formatAmount(expenseVal)} RUB`, pageWidth / 2 + 10, y + 5);
    doc.text(`${t("totalCredit")} ${formatAmount(incomeVal)} RUB`, pageWidth / 2 + 10, y + 9.5);
    y += 16;

    // Section title
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(t("transactions"), margin, y);
    y += 4;

    // Table headers
    const tableHeaders = [
      t("no"),
      t("dateTime"),
      t("reference"),
      t("description"),
      t("debit"),
      t("credit"),
      t("balance"),
    ];

    let runningBalance = openingBalance;
    const tableData = filteredTransactions
      .slice()
      .sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime();
      })
      .map((tx, i) => {
        if (tx.is_income) {
          runningBalance += Math.abs(tx.amount);
        } else {
          runningBalance -= Math.abs(tx.amount);
        }

        const debit = !tx.is_income ? formatAmount(tx.amount) : "";
        const credit = tx.is_income ? formatAmount(tx.amount) : "";
        const time = generateTransactionTime(tx, i);
        const ref = generateTransactionRef(tx.id, tx.date);
        const authCode = generateAuthCode(tx.id);

        const description = buildDescription(tx, authCode, cardNumber, accountNumber);

        return [
          String(i + 1),
          `${formatDateRu(tx.date)}\n${time}`,
          ref,
          description,
          debit,
          credit,
          formatAmount(runningBalance),
        ];
      });

    // Add totals row
    tableData.push(["", "", "", t("total"), formatAmount(expenseVal), formatAmount(incomeVal), formatAmount(runningBalance)]);

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
          if (data.column.index === 4 && data.cell.raw && data.cell.raw !== "") {
            data.cell.styles.textColor = [180, 30, 30];
          }
          if (data.column.index === 5 && data.cell.raw && data.cell.raw !== "") {
            data.cell.styles.textColor = [0, 120, 50];
          }
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

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(
      `${t("stmtContains")} ${filteredTransactions.length} ${t("footerCount")} ${formatDateRu(start.toISOString())} — ${formatDateRu(end.toISOString())}.`,
      margin, footerY
    );
    footerY += 4;
    doc.text(
      `${t("footerGenerated")} ${formatDateRu(new Date().toISOString())} ${t("footerValid")}`,
      margin, footerY
    );
    footerY += 10;

    // Divider
    doc.setDrawColor(0, 100, 50);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    footerY += 8;

    if (footerY > 240) {
      doc.addPage();
      footerY = 20;
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(t("authRep"), margin, footerY);
    doc.text("_________________________", margin + 45, footerY);
    doc.text(t("authName"), margin + 100, footerY);

    try {
      const sigImg = await loadImageWithWhiteBg(signatureImg);
      doc.addImage(sigImg, "PNG", margin + 50, footerY - 6, 25, 10);
    } catch { }

    footerY += 15;

    try {
      const stmpDataUrl = await loadImageWithWhiteBg(stampImg);
      const stampSize = 38;
      const stampX = pageWidth / 2 - stampSize / 2;
      doc.setFillColor(255, 255, 255);
      doc.rect(stampX, footerY - 5, stampSize, stampSize, "F");
      doc.addImage(stmpDataUrl, "JPEG", stampX, footerY - 5, stampSize, stampSize);
    } catch { }

    return doc;
  };

  const generatePDF = async () => {
    if (lang === "ru") return generateRuPDF();
    return generateEnPDF();
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
        {/* Language Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Язык выписки
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLang("ru")}
              className={`p-3 rounded-xl border-2 transition-all text-center ${lang === "ru" ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
            >
              <p className="text-lg mb-1">🇷🇺</p>
              <p className={`text-sm font-medium ${lang === "ru" ? "text-primary" : "text-foreground"}`}>Русский</p>
            </button>
            <button
              onClick={() => setLang("en")}
              className={`p-3 rounded-xl border-2 transition-all text-center ${lang === "en" ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
            >
              <p className="text-lg mb-1">🇬🇧</p>
              <p className={`text-sm font-medium ${lang === "en" ? "text-primary" : "text-foreground"}`}>English</p>
            </button>
          </div>
        </div>

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
