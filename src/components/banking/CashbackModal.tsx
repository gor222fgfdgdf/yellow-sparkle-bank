import { useState, useEffect } from "react";
import { X, Diamond, Check, ArrowRight, Gift, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface CashbackCategory {
  id: string;
  name: string;
  percentage: number;
  icon: string;
  isSelected: boolean;
  earned: number;
}

interface CashbackHistory {
  id: string;
  category: string;
  amount: number;
  cashback: number;
  date: string;
  merchant: string;
}

interface CashbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
}

const STORAGE_KEY = "banking_cashback";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const defaultCategories: CashbackCategory[] = [
  { id: "1", name: "Рестораны", percentage: 5, icon: "🍽️", isSelected: false, earned: 1250 },
  { id: "2", name: "Супермаркеты", percentage: 3, icon: "🛒", isSelected: true, earned: 2340 },
  { id: "3", name: "АЗС", percentage: 5, icon: "⛽", isSelected: false, earned: 870 },
  { id: "4", name: "Транспорт", percentage: 5, icon: "🚕", isSelected: true, earned: 1560 },
  { id: "5", name: "Развлечения", percentage: 5, icon: "🎬", isSelected: false, earned: 450 },
  { id: "6", name: "Путешествия", percentage: 10, icon: "✈️", isSelected: false, earned: 3200 },
  { id: "7", name: "Аптеки", percentage: 3, icon: "💊", isSelected: true, earned: 380 },
  { id: "8", name: "Спорт", percentage: 5, icon: "🏃", isSelected: false, earned: 920 },
];

const defaultHistory: CashbackHistory[] = [
  { id: "1", category: "Супермаркеты", amount: 2340, cashback: 70, date: "Сегодня", merchant: "Пятёрочка" },
  { id: "2", category: "Транспорт", amount: 890, cashback: 45, date: "Сегодня", merchant: "Яндекс Такси" },
  { id: "3", category: "Аптеки", amount: 1450, cashback: 44, date: "Вчера", merchant: "Горздрав" },
  { id: "4", category: "Супермаркеты", amount: 1670, cashback: 50, date: "Вчера", merchant: "ВкусВилл" },
  { id: "5", category: "Транспорт", amount: 560, cashback: 28, date: "2 дня назад", merchant: "Ситимобил" },
];

const CashbackModal = ({ isOpen, onClose, onWithdraw }: CashbackModalProps) => {
  const [tab, setTab] = useState<"balance" | "categories" | "history">("balance");
  const [categories, setCategories] = useState<CashbackCategory[]>(defaultCategories);
  const [history] = useState<CashbackHistory[]>(defaultHistory);
  const [balance, setBalance] = useState(2847);
  const [pendingBalance] = useState(237);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setCategories(data.categories || defaultCategories);
      setBalance(data.balance || 2847);
    }
  }, []);

  const saveData = (cats: CashbackCategory[], bal: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: cats, balance: bal }));
  };

  const selectedCount = categories.filter(c => c.isSelected).length;
  const maxSelections = 3;

  const handleToggleCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (!category.isSelected && selectedCount >= maxSelections) {
      toast({ 
        title: "Лимит достигнут", 
        description: `Можно выбрать максимум ${maxSelections} категории`, 
        variant: "destructive" 
      });
      return;
    }

    const updated = categories.map(c =>
      c.id === id ? { ...c, isSelected: !c.isSelected } : c
    );
    setCategories(updated);
    saveData(updated, balance);
    
    if (!category.isSelected) {
      toast({ title: "Категория добавлена", description: `${category.name} — ${category.percentage}% кэшбэк` });
    }
  };

  const handleWithdraw = () => {
    if (balance < 100) {
      toast({ title: "Минимум 100 ₽", description: "Накопите больше кэшбэка", variant: "destructive" });
      return;
    }
    
    onWithdraw(balance);
    toast({ title: "Кэшбэк выведен", description: `${formatCurrency(balance)} ₽ зачислено на карту` });
    setBalance(0);
    saveData(categories, 0);
  };

  const totalEarned = categories.reduce((sum, c) => sum + c.earned, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Кэшбэк</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

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
            {/* Balance Card */}
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

            {/* Stats */}
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

            {/* Withdraw */}
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
                    category.isSelected 
                      ? "bg-primary/10 border-2 border-primary" 
                      : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Заработано: {formatCurrency(category.earned)} ₽
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                      category.isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      {category.percentage}%
                    </span>
                    {category.isSelected && (
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
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>История пуста</p>
                <p className="text-sm">Совершайте покупки и получайте кэшбэк</p>
              </div>
            ) : (
              history.map((item) => (
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
                    <p className="font-bold text-green-600">+{formatCurrency(item.cashback)} ₽</p>
                    <p className="text-sm text-muted-foreground">
                      с {formatCurrency(item.amount)} ₽
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashbackModal;
