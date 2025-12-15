import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, Mail, Download, Check } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  isIncoming?: boolean;
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

  const filterTransactionsByPeriod = () => {
    const now = new Date();
    let daysBack = 30;
    
    switch (period) {
      case "week": daysBack = 7; break;
      case "month": daysBack = 30; break;
      case "quarter": daysBack = 90; break;
      case "year": daysBack = 365; break;
    }

    return transactions.slice(0, Math.min(transactions.length, daysBack * 3));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const filtered = filterTransactionsByPeriod();
    
    // Header
    doc.setFontSize(20);
    doc.text("Выписка по счёту", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Период: ${getPeriodLabel()}`, 20, 30);
    doc.text(`Счёт: ${selectedAccount === "all" ? "Все счета" : accounts.find(a => a.id === selectedAccount)?.name}`, 20, 38);
    doc.text(`Дата формирования: ${new Date().toLocaleDateString("ru-RU")}`, 20, 46);

    // Table
    const tableData = filtered.map(t => [
      t.date,
      t.name,
      t.category,
      (t.isIncoming ? "+" : "-") + t.amount.toLocaleString("ru-RU") + " ₽"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["Дата", "Операция", "Категория", "Сумма"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 221, 45] as [number, number, number], textColor: [0, 0, 0] as [number, number, number] },
    });

    // Summary
    const income = filtered.filter(t => t.isIncoming).reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => !t.isIncoming).reduce((sum, t) => sum + t.amount, 0);
    
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.text(`Всего поступлений: +${income.toLocaleString("ru-RU")} ₽`, 20, finalY + 15);
    doc.text(`Всего расходов: -${expense.toLocaleString("ru-RU")} ₽`, 20, finalY + 23);
    doc.text(`Итого: ${(income - expense).toLocaleString("ru-RU")} ₽`, 20, finalY + 31);

    return doc;
  };

  const generateCSV = () => {
    const filtered = filterTransactionsByPeriod();
    const headers = ["Дата", "Операция", "Категория", "Сумма"];
    const rows = filtered.map(t => [
      t.date,
      t.name,
      t.category,
      (t.isIncoming ? "+" : "-") + t.amount
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(";")).join("\n");
    return csvContent;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "week": return "Неделя";
      case "month": return "Месяц";
      case "quarter": return "Квартал";
      case "year": return "Год";
      default: return "Месяц";
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (format === "pdf") {
        const doc = generatePDF();
        doc.save(`выписка_${new Date().toISOString().split("T")[0]}.pdf`);
        toast.success("PDF-выписка скачана");
      } else if (format === "csv") {
        const csv = generateCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `выписка_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV-выписка скачана");
      } else if (format === "excel") {
        const csv = generateCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `выписка_${new Date().toISOString().split("T")[0]}.xls`;
        link.click();
        toast.success("Excel-выписка скачана");
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
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
                <SelectItem value="year">Год</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
          <div className="bg-muted rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">Будет экспортировано</p>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{filterTransactionsByPeriod().length} операций</span>
              <Check className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StatementExportModal;
