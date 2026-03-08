import { useState, useMemo } from "react";
import { Calendar, Plus, Trash2, Bell, BellOff, CreditCard, Music, Tv, Gamepad2, Cloud, Dumbbell, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import type { LucideIcon } from "lucide-react";
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from "@/hooks/useSubscriptions";
import FullScreenModal from "./FullScreenModal";
import type { Transaction } from "./TransactionList";

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const subscriptionIcons: Record<string, { icon: LucideIcon; color: string }> = {
  music: { icon: Music, color: "bg-primary" },
  video: { icon: Tv, color: "bg-destructive" },
  gaming: { icon: Gamepad2, color: "bg-secondary-foreground" },
  cloud: { icon: Cloud, color: "bg-primary/70" },
  fitness: { icon: Dumbbell, color: "bg-accent-foreground" },
  education: { icon: BookOpen, color: "bg-primary/50" },
  other: { icon: CreditCard, color: "bg-muted-foreground" },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const SubscriptionsModal = ({ isOpen, onClose, transactions }: SubscriptionsModalProps) => {
  const { data: subscriptions = [] } = useSubscriptions();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newIcon, setNewIcon] = useState("other");
  const [newFrequency, setNewFrequency] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();

  const totalMonthly = useMemo(() => {
    return subscriptions
      .filter(s => s.is_active)
      .reduce((sum, s) => sum + (s.billing_cycle === "yearly" ? Number(s.amount) / 12 : Number(s.amount)), 0);
  }, [subscriptions]);

  const totalYearly = useMemo(() => {
    return subscriptions
      .filter(s => s.is_active)
      .reduce((sum, s) => sum + (s.billing_cycle === "yearly" ? Number(s.amount) : Number(s.amount) * 12), 0);
  }, [subscriptions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const handleAdd = () => {
    if (!newName || !newAmount || parseFloat(newAmount) <= 0) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const iconData = subscriptionIcons[newIcon];

    createSubscription.mutate({
      name: newName,
      amount: parseFloat(newAmount),
      category: "Подписки",
      billing_cycle: newFrequency,
      next_payment_date: nextDate.toISOString().split("T")[0],
      is_active: true,
      icon: newIcon,
      color: iconData.color,
    });
    setNewName("");
    setNewAmount("");
    setNewIcon("other");
    setIsAdding(false);
    toast({ title: "Подписка добавлена", description: newName });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    updateSubscription.mutate({ id, is_active: !currentActive });
  };

  const handleDelete = (id: string) => {
    deleteSubscription.mutate(id);
    toast({ title: "Подписка удалена" });
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Подписки">
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

      {/* Subscriptions List */}
      <div className="space-y-2 mb-6">
        {subscriptions.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет подписок</p>
            <p className="text-sm">Добавьте подписки для учёта расходов</p>
          </div>
        )}

        {subscriptions.map((sub) => {
          const iconKey = sub.icon || "other";
          const iconData = subscriptionIcons[iconKey] || subscriptionIcons.other;
          const IconComponent = iconData.icon;

          return (
            <div
              key={sub.id}
              className={`p-4 rounded-xl transition-all ${
                sub.is_active ? "bg-muted/50" : "bg-muted/20 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${sub.color || iconData.color} flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(sub.next_payment_date)} • {sub.billing_cycle === "yearly" ? "ежегодно" : "ежемесячно"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">{formatCurrency(Number(sub.amount))} ₽</p>
                  <Switch
                    checked={sub.is_active}
                    onCheckedChange={() => handleToggle(sub.id, sub.is_active)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
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
                  <Icon className={`w-5 h-5 ${newIcon === key ? "text-primary-foreground" : "text-muted-foreground"}`} />
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
    </FullScreenModal>
  );
};

export default SubscriptionsModal;
