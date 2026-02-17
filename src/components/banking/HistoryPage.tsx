import { useState, useMemo } from "react";
import { ArrowLeft, Search, X, ChevronRight } from "lucide-react";
import type { Transaction } from "./TransactionList";

interface HistoryPageProps {
  transactions: Transaction[];
  onBack: () => void;
}

const formatCurrencyShort = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const HistoryPage = ({ transactions, onBack }: HistoryPageProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate totals
  const income = useMemo(() => 
    transactions.filter(t => t.isIncoming).reduce((s, t) => s + t.amount, 0), [transactions]);
  const expenses = useMemo(() => 
    transactions.filter(t => !t.isIncoming).reduce((s, t) => s + t.amount, 0), [transactions]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach(tx => {
      if (!map[tx.date]) map[tx.date] = [];
      map[tx.date].push(tx);
    });
    return map;
  }, [filtered]);

  // Expense category breakdown for the color bar
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => !t.isIncoming).forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const categoryColors = [
    "bg-primary", "bg-destructive", "bg-blue-500", "bg-amber-500", 
    "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-orange-500"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-border">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="flex-1 text-center font-bold text-foreground text-lg">История</h1>
        <button onClick={() => setSearchOpen(!searchOpen)} className="p-1">
          <Search className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск операций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="overflow-x-auto scrollbar-hide px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-shrink-0 bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
            18 янв. - 17 февр.
            <X className="w-3.5 h-3.5" />
          </div>
          <div className="flex-shrink-0 bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
            Счета и карты <span className="bg-background/20 rounded-full px-1.5 text-xs">2</span>
            <X className="w-3.5 h-3.5" />
          </div>
          <div className="flex-shrink-0 bg-muted text-muted-foreground rounded-full px-4 py-2 text-sm font-medium">
            Тип
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Income/Expenses summary */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">Поступления</p>
              <p className="text-xl font-bold text-foreground mt-1">{formatCurrencyShort(income)} ₽</p>
              <div className="w-full h-1.5 bg-primary/20 rounded-full mt-3">
                <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">Траты</p>
              <p className="text-xl font-bold text-foreground mt-1">{formatCurrencyShort(expenses)} ₽</p>
              <div className="w-full h-1.5 rounded-full mt-3 flex overflow-hidden gap-0.5">
                {categoryBreakdown.slice(0, 4).map(([cat, amount], i) => (
                  <div
                    key={cat}
                    className={`h-full ${categoryColors[i]} rounded-full`}
                    style={{ width: `${(amount / expenses) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Promo banner */}
        <div className="px-4 pb-4">
          <button className="w-full bg-card rounded-2xl p-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💳</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Кредит. Ставка ниже на 2-6%</p>
              <p className="text-xs text-muted-foreground">в Приложении</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Transactions grouped by date */}
        <div className="space-y-2">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date} className="bg-card rounded-2xl mx-4 overflow-hidden">
              <p className="text-base font-bold text-foreground px-4 pt-4 pb-2">{date}</p>
              <div className="divide-y divide-border">
                {txs.map((tx) => {
                  const Icon = tx.icon;
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-semibold text-sm ${tx.isIncoming ? 'text-primary' : 'text-foreground'}`}>
                          {tx.isIncoming ? '+' : '-'} {formatCurrencyShort(tx.amount)} ₽
                        </p>
                        <p className="text-[10px] text-muted-foreground">Счёт **7694</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
};

export default HistoryPage;
