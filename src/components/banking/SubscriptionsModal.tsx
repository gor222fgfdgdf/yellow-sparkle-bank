import { useState, useEffect, useMemo } from "react";
import { X, Calendar, AlertCircle, Plus, Trash2, Bell, BellOff, CreditCard, Music, Tv, Gamepad2, Cloud, Dumbbell, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import type { LucideIcon } from "lucide-react";
import type { Transaction } from "./TransactionList";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
  nextPayment: string;
  frequency: "monthly" | "yearly";
  isActive: boolean;
  remindBefore: number; // days
}

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const STORAGE_KEY = "banking_subscriptions";

const subscriptionIcons: Record<string, { icon: LucideIcon; color: string }> = {
  music: { icon: Music, color: "bg-green-500" },
  video: { icon: Tv, color: "bg-red-500" },
  gaming: { icon: Gamepad2, color: "bg-purple-500" },
  cloud: { icon: Cloud, color: "bg-blue-500" },
  fitness: { icon: Dumbbell, color: "bg-orange-500" },
  education: { icon: BookOpen, color: "bg-teal-500" },
  other: { icon: CreditCard, color: "bg-gray-500" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const getNextPaymentDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

const defaultSubscriptions: Subscription[] = [
  { id: "1", name: "Яндекс Плюс", amount: 299, icon: "music", color: "bg-yellow-500", nextPayment: getNextPaymentDate(5), frequency: "monthly", isActive: true, remindBefore: 3 },
  { id: "2", name: "Netflix", amount: 799, icon: "video", color: "bg-red-500", nextPayment: getNextPaymentDate(12), frequency: "monthly", isActive: true, remindBefore: 3 },
  { id: "3", name: "Spotify", amount: 199, icon: "music", color: "bg-green-500", nextPayment: getNextPaymentDate(8), frequency: "monthly", isActive: true, remindBefore: 1 },
  { id: "4", name: "iCloud 200GB", amount: 149, icon: "cloud", color: "bg-blue-400", nextPayment: getNextPaymentDate(15), frequency: "monthly", isActive: true, remindBefore: 3 },
  { id: "5", name: "PlayStation Plus", amount: 4999, icon: "gaming", color: "bg-blue-600", nextPayment: getNextPaymentDate(45), frequency: "yearly", isActive: true, remindBefore: 7 },
];

const SubscriptionsModal = ({ isOpen, onClose, transactions }: SubscriptionsModalProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(defaultSubscriptions);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newIcon, setNewIcon] = useState("other");
  const [newFrequency, setNewFrequency] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSubscriptions(JSON.parse(saved));
    }
  }, []);

  const saveSubscriptions = (updated: Subscription[]) => {
    setSubscriptions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + (s.frequency === "yearly" ? s.amount / 12 : s.amount), 0);
  }, [subscriptions]);

  const totalYearly = useMemo(() => {
    return subscriptions
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + (s.frequency === "yearly" ? s.amount : s.amount * 12), 0);
  }, [subscriptions]);

  const upcomingPayments = useMemo(() => {
    return [...subscriptions]
      .filter(s => s.isActive)
      .sort((a, b) => {
        const dateA = new Date(a.nextPayment.split(" ").reverse().join(" "));
        const dateB = new Date(b.nextPayment.split(" ").reverse().join(" "));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  }, [subscriptions]);

  const handleAdd = () => {
    if (!newName || !newAmount || parseFloat(newAmount) <= 0) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    const iconData = subscriptionIcons[newIcon];
    const newSub: Subscription = {
      id: Date.now().toString(),
      name: newName,
      amount: parseFloat(newAmount),
      icon: newIcon,
      color: iconData.color,
      nextPayment: getNextPaymentDate(Math.floor(Math.random() * 28) + 1),
      frequency: newFrequency,
      isActive: true,
      remindBefore: 3,
    };

    saveSubscriptions([...subscriptions, newSub]);
    setNewName("");
    setNewAmount("");
    setNewIcon("other");
    setIsAdding(false);
    toast({ title: "Подписка добавлена", description: newName });
  };

  const handleToggle = (id: string) => {
    const updated = subscriptions.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    saveSubscriptions(updated);
  };

  const handleDelete = (id: string) => {
    saveSubscriptions(subscriptions.filter(s => s.id !== id));
    toast({ title: "Подписка удалена" });
  };

  const toggleReminder = (id: string) => {
    const updated = subscriptions.map(s =>
      s.id === id ? { ...s, remindBefore: s.remindBefore > 0 ? 0 : 3 } : s
    );
    saveSubscriptions(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Подписки</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">В месяц</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(Math.round(totalMonthly))} ₽</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">В год</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(Math.round(totalYearly))} ₽</p>
          </div>
        </div>

        {/* Upcoming */}
        {upcomingPayments.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ближайшие списания
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {upcomingPayments.map((sub) => {
                const iconData = subscriptionIcons[sub.icon];
                const IconComponent = iconData.icon;
                return (
                  <div
                    key={sub.id}
                    className="flex-shrink-0 bg-muted/50 rounded-xl p-3 min-w-[140px]"
                  >
                    <div className={`w-8 h-8 rounded-lg ${sub.color} flex items-center justify-center mb-2`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-medium text-foreground text-sm">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.nextPayment}</p>
                    <p className="text-sm font-bold text-foreground mt-1">{formatCurrency(sub.amount)} ₽</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscriptions List */}
        <div className="space-y-2 mb-6">
          {subscriptions.map((sub) => {
            const iconData = subscriptionIcons[sub.icon];
            const IconComponent = iconData.icon;
            
            return (
              <div
                key={sub.id}
                className={`p-4 rounded-xl transition-all ${
                  sub.isActive ? "bg-muted/50" : "bg-muted/20 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${sub.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.nextPayment} • {sub.frequency === "yearly" ? "ежегодно" : "ежемесячно"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{formatCurrency(sub.amount)} ₽</p>
                    <Switch
                      checked={sub.isActive}
                      onCheckedChange={() => handleToggle(sub.id)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleReminder(sub.id)}
                    className={`flex items-center gap-1 text-sm ${
                      sub.remindBefore > 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {sub.remindBefore > 0 ? (
                      <>
                        <Bell className="w-4 h-4" />
                        За {sub.remindBefore} дн.
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4" />
                        Без напоминания
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Form */}
        {isAdding ? (
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Название подписки"
              className="w-full px-4 py-3 bg-background rounded-xl text-foreground"
            />
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.entries(subscriptionIcons).map(([key, data]) => {
                const Icon = data.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setNewIcon(key)}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      newIcon === key ? `${data.color} ring-2 ring-offset-2 ring-primary` : "bg-background"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${newIcon === key ? "text-white" : "text-muted-foreground"}`} />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Сумма (₽)"
                className="flex-1 px-4 py-3 bg-background rounded-xl text-foreground"
              />
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as typeof newFrequency)}
                className="px-4 py-3 bg-background rounded-xl text-foreground"
              >
                <option value="monthly">В месяц</option>
                <option value="yearly">В год</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>
                Отмена
              </Button>
              <Button className="flex-1" onClick={handleAdd}>
                Добавить
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить подписку
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsModal;
