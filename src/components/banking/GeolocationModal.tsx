import { useState, useMemo } from "react";
import { MapPin, ShoppingCart, Coffee, Car, Utensils, ShoppingBag, CreditCard, Briefcase, Heart, Gamepad2, Smartphone, Home, Zap, Droplets, GraduationCap, Dumbbell, Tv, Fuel, Music } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import FullScreenModal from "./FullScreenModal";
import type { LucideIcon } from "lucide-react";

interface GeolocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart, Coffee, Car, Utensils, ShoppingBag, CreditCard, Briefcase, Heart,
  Gamepad2, Smartphone, Home, Zap, Droplets, GraduationCap, Dumbbell, Tv, Fuel, Music,
};

const categoryColors: Record<string, string> = {
  "Продукты": "#22c55e",
  "Кафе": "#f59e0b",
  "Транспорт": "#3b82f6",
  "Рестораны": "#f97316",
  "Покупки": "#ec4899",
  "Развлечения": "#f43f5e",
  "Здоровье": "#ef4444",
  "Связь": "#14b8a6",
  "ЖКХ": "#06b6d4",
  "Подписки": "#a855f7",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.abs(amount));

const GeolocationModal = ({ isOpen, onClose }: GeolocationModalProps) => {
  const { data: transactions = [] } = useTransactions();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group expenses by category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number; merchants: Record<string, { total: number; count: number }> }> = {};
    transactions.filter(tx => !tx.is_income).forEach(tx => {
      const cat = tx.category;
      if (!stats[cat]) stats[cat] = { total: 0, count: 0, merchants: {} };
      stats[cat].total += Math.abs(Number(tx.amount));
      stats[cat].count += 1;
      if (!stats[cat].merchants[tx.name]) stats[cat].merchants[tx.name] = { total: 0, count: 0 };
      stats[cat].merchants[tx.name].total += Math.abs(Number(tx.amount));
      stats[cat].merchants[tx.name].count += 1;
    });
    return Object.entries(stats)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([category, data]) => ({
        category,
        ...data,
        merchantList: Object.entries(data.merchants)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([name, mdata]) => ({ name, ...mdata })),
      }));
  }, [transactions]);

  // Recent expenses for selected category or all
  const recentExpenses = useMemo(() => {
    return transactions
      .filter(tx => !tx.is_income && (!selectedCategory || tx.category === selectedCategory))
      .slice(0, 20);
  }, [transactions, selectedCategory]);

  const selectedStats = selectedCategory
    ? categoryStats.find(c => c.category === selectedCategory)
    : null;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="География покупок">
      <div className="space-y-4">
        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}
          >
            Все
          </button>
          {categoryStats.slice(0, 8).map(({ category }) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Category breakdown grid */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 gap-3">
            {categoryStats.slice(0, 6).map(({ category, total, count }) => {
              const color = categoryColors[category] || "#6b7280";
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-card rounded-xl p-4 text-left hover:bg-muted transition-colors border border-border"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${color}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <p className="font-medium text-foreground text-sm">{category}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(total)} ₽</p>
                  <p className="text-xs text-muted-foreground">{count} операций</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected category detail */}
        {selectedCategory && selectedStats && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-bold text-foreground text-lg">{selectedCategory}</h3>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Всего потрачено</p>
                  <p className="font-bold text-foreground">{formatCurrency(selectedStats.total)} ₽</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Операций</p>
                  <p className="font-bold text-foreground">{selectedStats.count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Средний чек</p>
                  <p className="font-bold text-foreground">{formatCurrency(selectedStats.total / selectedStats.count)} ₽</p>
                </div>
              </div>
            </div>

            {/* Top merchants */}
            <div>
              <h4 className="font-semibold text-foreground mb-2">Популярные места</h4>
              <div className="space-y-2">
                {selectedStats.merchantList.slice(0, 10).map((merchant) => (
                  <div key={merchant.name} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{merchant.name}</p>
                        <p className="text-xs text-muted-foreground">{merchant.count} покупок</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">{formatCurrency(merchant.total)} ₽</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">
            {selectedCategory ? `Последние в «${selectedCategory}»` : "Последние траты"}
          </h4>
          <div className="space-y-1">
            {recentExpenses.map((tx) => {
              const Icon = iconMap[tx.icon] || CreditCard;
              const txDate = new Date(tx.date);
              const dateStr = txDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} • {dateStr}</p>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {tx.currency !== 'RUB' && tx.original_amount
                      ? `${formatCurrency(Math.abs(Number(tx.original_amount)))} ${tx.currency}`
                      : `${formatCurrency(Math.abs(Number(tx.amount)))} ₽`
                    }
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default GeolocationModal;
