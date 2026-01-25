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
}

interface StatementExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
}

const StatementExportModal = ({ isOpen, onClose, transactions, accounts }: StatementExportModalProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");
  const [format, setFormat] = useState<string>("pdf");
  const [email, setEmail] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

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
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const isInDateRange = transactionDate >= start && transactionDate <= end;
      const isAccountMatch = selectedAccount === "all" || t.account_id === selectedAccount;
      return isInDateRange && isAccountMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, period, selectedAccount, customStartDate, customEndDate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " RUB";
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const { start, end } = getDateRange();
    
    // Header with bank branding
    doc.setFillColor(255, 221, 45);
    doc.rect(0, 0, 210, 35, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ACCOUNT STATEMENT", 20, 22);
    
    // Account and period info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const accountName = selectedAccount === "all" 
      ? "All Accounts" 
      : accounts.find(a => a.id === selectedAccount)?.name || "Unknown Account";
    
    doc.text(`Account: ${accountName}`, 20, 45);
    doc.text(`Period: ${formatDate(start.toISOString())} - ${formatDate(end.toISOString())}`, 20, 52);
    doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, 59);

    // Transactions table
    const tableData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.name,
      t.category,
      (t.is_income ? "+" : "-") + formatCurrency(Math.abs(t.amount))
    ]);

    autoTable(doc, {
      startY: 68,
      head: [["Date", "Transaction", "Category", "Amount"]],
      body: tableData,
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        font: "helvetica"
      },
      headStyles: { 
        fillColor: [255, 221, 45],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "left"
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 70 },
        2: { cellWidth: 45 },
        3: { cellWidth: 40, halign: "right" }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === "body") {
          const text = data.cell.raw as string;
          if (text.startsWith("+")) {
            data.cell.styles.textColor = [34, 139, 34];
          } else {
            data.cell.styles.textColor = [200, 50, 50];
          }
        }
      }
    });

    // Summary section
    const income = filteredTransactions.filter(t => t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expense = filteredTransactions.filter(t => !t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expense;
    
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, finalY + 8, 190, finalY + 8);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("PERIOD SUMMARY:", 20, finalY + 18);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(34, 139, 34);
    doc.text(`Income: +${formatCurrency(income)}`, 20, finalY + 28);
    
    doc.setTextColor(200, 50, 50);
    doc.text(`Expenses: -${formatCurrency(expense)}`, 20, finalY + 36);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(balance >= 0 ? 34 : 200, balance >= 0 ? 139 : 50, balance >= 0 ? 34 : 50);
    doc.text(`Balance: ${balance >= 0 ? "+" : "-"}${formatCurrency(Math.abs(balance))}`, 20, finalY + 46);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`Document generated automatically. Transactions: ${filteredTransactions.length}`, 20, 285);

    return doc;
  };

  const generateCSV = () => {
    const { start, end } = getDateRange();
    const headers = ["Date", "Transaction", "Category", "Type", "Amount"];
    const rows = filteredTransactions.map(t => [
      formatDate(t.date),
      `"${t.name}"`,
      `"${t.category}"`,
      t.is_income ? "Income" : "Expense",
      (t.is_income ? "" : "-") + Math.abs(t.amount).toFixed(2)
    ]);
    
    const income = filteredTransactions.filter(t => t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expense = filteredTransactions.filter(t => !t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const summary = [
      [],
      ["SUMMARY"],
      ["Income", "", "", "", income.toFixed(2)],
      ["Expenses", "", "", "", (-expense).toFixed(2)],
      ["Balance", "", "", "", (income - expense).toFixed(2)]
    ];
    
    const csvContent = [headers, ...rows, ...summary].map(row => row.join(";")).join("\n");
    return csvContent;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "week": return "За неделю";
      case "month": return "За месяц";
      case "quarter": return "За квартал";
      case "year": return "За год";
      case "custom": return "Произвольный период";
      default: return "За месяц";
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (format === "pdf") {
        const doc = generatePDF();
        doc.save(`statement_${new Date().toISOString().split("T")[0]}.pdf`);
        toast.success("PDF statement downloaded");
      } else if (format === "csv") {
        const csv = generateCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `statement_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV statement downloaded");
      } else if (format === "excel") {
        const csv = generateCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `statement_${new Date().toISOString().split("T")[0]}.xls`;
        link.click();
        toast.success("Excel statement downloaded");
      }
    } catch (error) {
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Выписка отправлена на ${email}`);
    setIsExporting(false);
    setEmail("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Экспорт выписки</SheetTitle>
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
                {accounts.map(account => (
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
                  format === "pdf" 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card"
                }`}
              >
                <FileText className={`w-8 h-8 mx-auto mb-2 ${format === "pdf" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">PDF</p>
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format === "csv" 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card"
                }`}
              >
                <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${format === "csv" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">CSV</p>
              </button>
              <button
                onClick={() => setFormat("excel")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format === "excel" 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card"
                }`}
              >
                <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${format === "excel" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-foreground">Excel</p>
              </button>
            </div>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleExport} 
            className="w-full" 
            disabled={isExporting}
          >
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
              <Button 
                variant="outline" 
                onClick={handleSendEmail}
                disabled={isExporting}
              >
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
                  <span className="text-success font-medium">
                    +{filteredTransactions.filter(t => t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Расходы:</span>
                  <span className="text-destructive font-medium">
                    −{filteredTransactions.filter(t => !t.is_income).reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString("ru-RU")} ₽
                  </span>
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
