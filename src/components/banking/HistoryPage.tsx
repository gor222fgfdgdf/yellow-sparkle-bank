import { useState, useMemo } from "react";
import { Search, X, Filter, BarChart3 } from "lucide-react";
import type { Transaction } from "./TransactionList";
import type { Account } from "./AccountsList";
import AnalyticsSection from "./AnalyticsSection";
import TransactionDetailModal from "./TransactionDetailModal";

interface HistoryPageProps {
  transactions: Transaction[];
  accounts: Account[];
}

type PeriodFilter = "current" | "1month" | "2months" | "3months";
type ViewMode = "transactions" | "analytics";

const periodLabels: Record<PeriodFilter, string> = {
  current: "Текущий месяц",
  "1month": "За месяц",
  "2months": "За 2 месяца",
  "3months": "За 3 месяца",
};

const formatCurrencyShort = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const HistoryPage = ({ transactions, accounts }: HistoryPageProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("current");
  const [viewMode, setViewMode] = useState<ViewMode>("transactions");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filter by period using rawDate
  const periodFiltered = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const maxMonths = period === "current" ? 0 : 
                      period === "1month" ? 1 : 
                      period === "2months" ? 2 : 3;

    return transactions.filter(t => {
      const txDate = new Date(t.rawDate);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();
      let diff = (currentYear - txYear) * 12 + (currentMonth - txMonth);
      return diff >= 0 && diff <= maxMonths;
    });
  }, [transactions, period]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchQuery) return periodFiltered;
    const q = searchQuery.toLowerCase();
    return periodFiltered.filter(t =>
      t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [periodFiltered, searchQuery]);

  // Calculate totals
  const income = useMemo(() =>
    filtered.filter(t => t.isIncoming).reduce((s, t) => s + t.amount, 0), [filtered]);
  const expenses = useMemo(() =>
    filtered.filter(t => !t.isIncoming).reduce((s, t) => s + t.amount, 0), [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach(tx => {
      if (!map[tx.date]) map[tx.date] = [];
      map[tx.date].push(tx);
    });
    return map;
  }, [filtered]);

  // Category breakdown for color bar
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    filtered.filter(t => !t.isIncoming).forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const categoryColors = [
    "bg-primary", "bg-destructive", "bg-blue-500", "bg-amber-500",
    "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-orange-500"
  ];

  // Find account for transaction
  const getAccountLabel = (tx: Transaction) => {
    if (!tx.accountId) return "";
    const acc = accounts.find(a => a.id === tx.accountId);
    if (acc?.cardNumber) return `Счёт **${acc.cardNumber}`;
    return acc?.name || "";
  };

  return (
    <div className="space-y-0 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-foreground">История</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "transactions" ? "analytics" : "transactions")}
            className={`p-2 rounded-full transition-colors ${viewMode === "analytics" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            <BarChart3 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Search className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="px-4 pb-3">
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

      {/* Period filter chips */}
      <div className="overflow-x-auto scrollbar-hide px-4 pb-4">
        <div className="flex gap-2">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key as PeriodFilter)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                period === key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics or Transactions view */}
      {viewMode === "analytics" ? (
        <div className="px-4">
          <AnalyticsSection transactions={transactions} />
        </div>
      ) : (
        <>
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
                      style={{ width: `${expenses > 0 ? (amount / expenses) * 100 : 0}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
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
                      <button
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.isIncoming ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <Icon className={`w-5 h-5 ${tx.isIncoming ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{tx.name}</p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-semibold text-sm ${tx.isIncoming ? 'text-primary' : 'text-foreground'}`}>
                            {tx.isIncoming ? '+' : '-'} {formatCurrencyShort(tx.amount)} ₽
                          </p>
                          <p className="text-[10px] text-muted-foreground">{getAccountLabel(tx)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">Нет операций</p>
              <p className="text-sm mt-1">За выбранный период операции не найдены</p>
            </div>
          )}
        </>
      )}

      {selectedTx && (
        <TransactionDetailModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          transaction={{ ...selectedTx, isIncoming: selectedTx.isIncoming || false }}
        />
      )}
    </div>
  );
};

export default HistoryPage;
