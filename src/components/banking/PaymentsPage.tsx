import { useState, useMemo } from "react";
import { X, Smartphone, Zap, Droplets, Wifi, Car, Home, CreditCard, Plus, Check, ChevronDown, type LucideIcon, BarChart3, Download, FileText, Table, CalendarClock, Star, Search, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "./TransactionList";
import AnalyticsSection from "./AnalyticsSection";
import AutoPaymentsModal from "./AutoPaymentsModal";
import PaymentTemplatesModal from "./PaymentTemplatesModal";
import TransactionDetailModal from "./TransactionDetailModal";
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { icon: any; label: string; color: string } | null;
  onPayment: (amount: number, provider: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const PaymentModal = ({ isOpen, onClose, category, onPayment }: PaymentModalProps) => {
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const providers: Record<string, string[]> = {
    "Мобильная связь": ["МТС", "Билайн", "Мегафон", "Теле2"],
    "Электричество": ["Мосэнергосбыт", "Петроэлектросбыт", "Энергосбыт Плюс"],
    "Вода": ["Мосводоканал", "Водоканал СПб", "Горводоканал"],
    "Интернет": ["Ростелеком", "Билайн Дом", "МТС Домашний", "Дом.ру"],
    "Транспорт": ["Тройка", "Подорожник", "РЖД", "Аэроэкспресс"],
    "ЖКХ": ["МосОблЕИРЦ", "ГИС ЖКХ", "Управляющая компания"],
    "Кредиты": ["Сбербанк", "Альфа-Банк", "ВТБ", "Россельхозбанк"],
  };

  const handlePay = () => {
    if (!provider) {
      toast({ title: "Ошибка", description: "Выберите поставщика услуг", variant: "destructive" });
      return;
    }
    if (!accountNumber) {
      toast({ title: "Ошибка", description: "Введите номер счёта/лицевого счёта", variant: "destructive" });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Ошибка", description: "Введите корректную сумму", variant: "destructive" });
      return;
    }

    onPayment(parseFloat(amount), provider);
    toast({ title: "Оплачено!", description: `${formatCurrency(parseFloat(amount))} ₽ — ${provider}` });
    setProvider("");
    setAccountNumber("");
    setAmount("");
    onClose();
  };

  if (!isOpen || !category) return null;

  const IconComponent = category.icon;
  const categoryProviders = providers[category.label] || ["Поставщик 1", "Поставщик 2", "Поставщик 3"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{category.label}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Выберите поставщика</p>
          <div className="grid grid-cols-2 gap-2">
            {categoryProviders.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === p ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium text-foreground">{p}</span>
                {provider === p && <Check className="inline-block ml-2 w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Номер лицевого счёта</p>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Введите номер"
            className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Amount */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Сумма</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">₽</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button onClick={handlePay} className="w-full h-14 text-lg font-semibold">
          Оплатить
        </Button>
      </div>
    </div>
  );
};

interface PaymentsPageProps {
  onPayment: (amount: number, provider: string) => void;
  transactions: Transaction[];
}

type MonthFilter = "current" | "1month" | "2months" | "3months";

const monthFilterLabels: Record<MonthFilter, string> = {
  current: "Текущий месяц",
  "1month": "За месяц",
  "2months": "За 2 месяца",
  "3months": "За 3 месяца",
};

const ITEMS_PER_PAGE = 10;

const PaymentsPage = ({ onPayment, transactions }: PaymentsPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{ icon: LucideIcon; label: string; color: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAutoPaymentsOpen, setIsAutoPaymentsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState<MonthFilter>("current");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{
    id: string;
    name: string;
    category: string;
    amount: number;
    date: string;
    isIncoming: boolean;
    icon: any;
  } | null>(null);
  const { toast } = useToast();
  const categories = [
    { icon: Smartphone, label: "Мобильная связь", color: "bg-blue-500/10 text-blue-600" },
    { icon: Zap, label: "Электричество", color: "bg-yellow-500/10 text-yellow-600" },
    { icon: Droplets, label: "Вода", color: "bg-cyan-500/10 text-cyan-600" },
    { icon: Wifi, label: "Интернет", color: "bg-purple-500/10 text-purple-600" },
    { icon: Car, label: "Транспорт", color: "bg-green-500/10 text-green-600" },
    { icon: Home, label: "ЖКХ", color: "bg-orange-500/10 text-orange-600" },
    { icon: CreditCard, label: "Кредиты", color: "bg-red-500/10 text-red-600" },
    { icon: Plus, label: "Ещё", color: "bg-muted text-muted-foreground" },
  ];

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    setIsPaymentModalOpen(true);
  };

  const handleFilterChange = (filter: MonthFilter) => {
    setMonthFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setMonthFilter("current");
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const filteredTransactions = useMemo(() => {
    const getMonthsAgo = (dateStr: string): number => {
      if (dateStr === "Сегодня" || dateStr === "Вчера") return 0;
      
      const monthMap: Record<string, number> = {
        "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
        "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
      };
      
      const parts = dateStr.split(" ");
      if (parts.length < 2) return 0;
      
      const monthStr = parts[1].toLowerCase();
      const transMonth = monthMap[monthStr] ?? 11;
      const currentMonth = new Date().getMonth();
      
      let diff = currentMonth - transMonth;
      if (diff < 0) diff += 12;
      return diff;
    };

    const maxMonths = monthFilter === "current" ? 0 : 
                      monthFilter === "1month" ? 1 : 
                      monthFilter === "2months" ? 2 : 3;

    return transactions.filter(t => {
      // Month filter
      if (getMonthsAgo(t.date) > maxMonths) return false;
      
      // Type filter
      if (typeFilter === "income" && !t.isIncoming) return false;
      if (typeFilter === "expense" && t.isIncoming) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesAmount = t.amount.toString().includes(query);
        if (!matchesName && !matchesCategory && !matchesAmount) return false;
      }
      
      return true;
    });
  }, [transactions, monthFilter, searchQuery, typeFilter]);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransactions.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const exportToCSV = () => {
    const headers = ["Дата", "Название", "Категория", "Сумма", "Тип"];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.name,
      t.category,
      t.amount.toString(),
      t.isIncoming ? "Доход" : "Расход"
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Экспорт завершён", description: "CSV файл скачан" });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("История транзакций", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Дата экспорта: ${new Date().toLocaleDateString("ru-RU")}`, 14, 28);
    doc.text(`Период: ${monthFilterLabels[monthFilter]}`, 14, 34);
    
    const tableData = filteredTransactions.map(t => [
      t.date,
      t.name,
      t.category,
      `${t.isIncoming ? "+" : "-"}${formatCurrency(t.amount)} RUB`,
    ]);
    
    autoTable(doc, {
      head: [["Дата", "Название", "Категория", "Сумма"]],
      body: tableData,
      startY: 42,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 221, 45] },
    });
    
    doc.save(`transactions_${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({ title: "Экспорт завершён", description: "PDF файл скачан" });
  };

  const groupTransactionsByDate = (txns: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    txns.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(visibleTransactions);

  return (
    <div className="space-y-6">
      {/* Tab Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setShowAnalytics(false)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            !showAnalytics ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Платежи
        </button>
        <button
          onClick={() => setShowAnalytics(true)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            showAnalytics ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Аналитика
        </button>
      </div>

      {showAnalytics ? (
        <AnalyticsSection transactions={transactions} />
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-foreground">Оплата услуг</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTemplatesOpen(true)}
                className="text-primary"
              >
                <Star className="w-4 h-4 mr-2" />
                Шаблоны
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPaymentsOpen(true)}
                className="text-primary"
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Автоплатежи
              </Button>
            </div>
          </div>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{cat.label}</span>
              </button>
            ))}
          </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-foreground">История операций</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${showFilters ? "text-primary" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <Table className="w-4 h-4 mr-2" />
                  Экспорт в CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Экспорт в PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <select
              value={monthFilter}
              onChange={(e) => handleFilterChange(e.target.value as MonthFilter)}
              className="text-sm font-medium text-primary bg-transparent border-none cursor-pointer focus:outline-none"
            >
              {Object.entries(monthFilterLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, категории или сумме..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-full"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === "all" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === "income" 
                    ? "bg-green-600 text-white" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <ArrowDownLeft className="w-3 h-3" />
                Доходы
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === "expense" 
                    ? "bg-red-600 text-white" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <ArrowUpRight className="w-3 h-3" />
                Расходы
              </button>
              {(searchQuery || typeFilter !== "all" || monthFilter !== "current") && (
                <button
                  onClick={resetFilters}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  Сбросить
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {(searchQuery || typeFilter !== "all") && (
            <p className="text-sm text-muted-foreground px-1">
              Найдено: {filteredTransactions.length} {filteredTransactions.length === 1 ? "операция" : 
                filteredTransactions.length < 5 ? "операции" : "операций"}
            </p>
          )}
        </div>

        <div className="bg-card rounded-2xl divide-y divide-border overflow-hidden">
          {Object.entries(groupedTransactions).map(([date, txns]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-muted/50">
                <span className="text-sm font-medium text-muted-foreground">{date}</span>
              </div>
              {txns.map((transaction) => {
                const IconComponent = transaction.icon;
                return (
                  <button
                    key={transaction.id}
                    onClick={() => setSelectedTransaction({
                      id: transaction.id,
                      name: transaction.name,
                      category: transaction.category,
                      amount: transaction.amount,
                      date: transaction.date,
                      isIncoming: transaction.isIncoming,
                      icon: transaction.icon,
                    })}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${transaction.isIncoming ? "text-green-600" : "text-foreground"}`}>
                      {transaction.isIncoming ? "+" : "-"}{formatCurrency(transaction.amount)} ₽
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            onClick={loadMore}
            className="w-full flex items-center justify-center gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Загрузить ещё
          </Button>
        )}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Нет операций за выбранный период
            </div>
          )}
        </div>
        </>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        category={selectedCategory}
        onPayment={onPayment}
      />

      <AutoPaymentsModal
        isOpen={isAutoPaymentsOpen}
        onClose={() => setIsAutoPaymentsOpen(false)}
        onExecutePayment={onPayment}
      />

      <PaymentTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onPayment={onPayment}
      />

      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onRepeat={(tx) => {
          // Find matching category for the transaction
          const matchingCategory = categories.find(cat => 
            tx.category.toLowerCase().includes(cat.label.toLowerCase().split(" ")[0]) ||
            cat.label.toLowerCase().includes(tx.category.toLowerCase().split(" ")[0])
          );
          if (matchingCategory && matchingCategory.label !== "Ещё") {
            setSelectedCategory(matchingCategory);
            setIsPaymentModalOpen(true);
          } else {
            // Default to first available category
            setSelectedCategory(categories[0]);
            setIsPaymentModalOpen(true);
          }
        }}
      />
    </div>
  );
};

export default PaymentsPage;
