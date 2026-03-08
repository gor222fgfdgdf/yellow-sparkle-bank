import { useState } from "react";
import { Diamond, Check, Gift, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FullScreenModal from "./FullScreenModal";
import { useCashbackCategories, useCashbackBalance, useUpdateCashbackCategory, useUpdateCashbackBalance } from "@/hooks/useCashback";
import { useTransactions } from "@/hooks/useTransactions";

interface CashbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const categoryIcons: Record<string, string> = {
  "Рестораны": "🍽️",
  "Супермаркеты": "🛒",
  "АЗС": "⛽",
  "Транспорт": "🚕",
  "Развлечения": "🎬",
  "Путешествия": "✈️",
  "Аптеки": "💊",
  "Спорт": "🏃",
  "Одежда": "👕",
};

const CashbackModal = ({ isOpen, onClose, onWithdraw }: CashbackModalProps) => {
  const [tab, setTab] = useState<"balance" | "categories" | "history">("balance");
  const { toast } = useToast();

  const { data: categories = [] } = useCashbackCategories();
  const { data: balanceData } = useCashbackBalance();
  const { data: transactions = [] } = useTransactions();
  const updateCategory = useUpdateCashbackCategory();
  const updateBalance = useUpdateCashbackBalance();

  const balance = balanceData?.balance || 0;
  const pendingBalance = balanceData?.pending_balance || 0;

  const selectedCount = categories.filter(c => c.is_selected).length;
  const maxSelections = 3;

  const handleToggleCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (!category.is_selected && selectedCount >= maxSelections) {
      toast({ 
        title: "Лимит достигнут", 
        description: `Можно выбрать максимум ${maxSelections} категории`, 
        variant: "destructive" 
      });
      return;
    }

    updateCategory.mutate({ id, is_selected: !category.is_selected });

    if (!category.is_selected) {
      toast({ title: "Категория добавлена", description: `${category.category} — ${category.percentage}% кэшбэк` });
    }
  };

  const handleWithdraw = () => {
    if (balance < 100) {
      toast({ title: "Минимум 100 ₽", description: "Накопите больше кэшбэка", variant: "destructive" });
      return;
    }
    
    onWithdraw(balance);
    updateBalance.mutate({ balance: 0 });
    toast({ title: "Кэшбэк выведен", description: `${formatCurrency(balance)} ₽ зачислено на карту` });
  };

  const totalEarned = categories.reduce((sum, c) => sum + (c.earned_amount || 0), 0);

  // Build cashback history from real transactions
  const cashbackHistory = transactions
    .filter(tx => !tx.is_income && tx.amount !== 0)
    .slice(0, 10)
    .map(tx => {
      const matchedCat = categories.find(c => c.category === tx.category && c.is_selected);
      const pct = matchedCat ? matchedCat.percentage : 1;
      return {
        id: tx.id,
        category: tx.category,
        amount: Math.abs(tx.amount),
        cashback: Math.round(Math.abs(tx.amount) * pct / 100),
        date: tx.date,
        merchant: tx.name,
      };
    });

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Кэшбэк">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
        {[
          { id: "balance", label: "Баланс" },
          { id: "categories", label: "Категории" },
          { id: "history", label: "История" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "balance" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Diamond className="w-5 h-5" />
              <span className="font-medium">Доступно к выводу</span>
            </div>
            <p className="text-4xl font-bold mb-4">{formatCurrency(balance)} ₽</p>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Clock className="w-4 h-4" />
              <span>Ожидает: {formatCurrency(pendingBalance)} ₽</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Заработано всего</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalEarned)} ₽</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Активных категорий</p>
              <p className="text-xl font-bold text-foreground">{selectedCount}/{maxSelections}</p>
            </div>
          </div>

          <Button className="w-full" onClick={handleWithdraw} disabled={balance < 100}>
            <Wallet className="w-4 h-4 mr-2" />
            Вывести на карту
          </Button>

          {balance < 100 && (
            <p className="text-xs text-center text-muted-foreground">
              Минимальная сумма для вывода — 100 ₽
            </p>
          )}
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Выбрано: {selectedCount}/{maxSelections}
            </p>
            <p className="text-sm text-muted-foreground">
              Сбрасывается 1 числа
            </p>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleToggleCategory(category.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  category.is_selected 
                    ? "bg-primary/10 border-2 border-primary" 
                    : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[category.category] || "💰"}</span>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{category.category}</p>
                    <p className="text-sm text-muted-foreground">
                      Заработано: {formatCurrency(category.earned_amount || 0)} ₽
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                    category.is_selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {category.percentage}%
                  </span>
                  {category.is_selected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-2">
          {cashbackHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>История пуста</p>
              <p className="text-sm">Совершайте покупки и получайте кэшбэк</p>
            </div>
          ) : (
            cashbackHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-foreground">{item.merchant}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category} • {item.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+{formatCurrency(item.cashback)} ₽</p>
                  <p className="text-sm text-muted-foreground">
                    с {formatCurrency(item.amount)} ₽
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </FullScreenModal>
  );
};

export default CashbackModal;
