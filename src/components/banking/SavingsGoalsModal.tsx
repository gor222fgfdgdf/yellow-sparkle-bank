import { useState } from "react";
import { Plus, Trash2, Target, Plane, Car, Home, GraduationCap, Gift, PiggyBank, Check, TrendingUp, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";
import { useSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal } from "@/hooks/useSavingsGoals";
import FullScreenModal from "./FullScreenModal";

interface SavingsGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeduct: (amount: number, goalName: string) => void;
}

const goalIcons: { id: string; icon: LucideIcon; label: string; color: string }[] = [
  { id: "plane", icon: Plane, label: "Отпуск", color: "bg-primary" },
  { id: "car", icon: Car, label: "Автомобиль", color: "bg-primary/80" },
  { id: "home", icon: Home, label: "Жильё", color: "bg-accent-foreground" },
  { id: "education", icon: GraduationCap, label: "Образование", color: "bg-secondary-foreground" },
  { id: "gift", icon: Gift, label: "Подарок", color: "bg-destructive" },
  { id: "piggy", icon: PiggyBank, label: "Подушка", color: "bg-primary/60" },
  { id: "target", icon: Target, label: "Другое", color: "bg-muted-foreground" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const SavingsGoalsModal = ({ isOpen, onClose, onDeduct }: SavingsGoalsModalProps) => {
  const { data: goals = [] } = useSavingsGoals();
  const createGoal = useCreateSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const deleteGoal = useDeleteSavingsGoal();

  const [isCreating, setIsCreating] = useState(false);
  const [depositingId, setDepositingId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newIcon, setNewIcon] = useState("target");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const getIconData = (iconId: string) => {
    return goalIcons.find(i => i.id === iconId) || goalIcons[goalIcons.length - 1];
  };

  const resetForm = () => {
    setNewName("");
    setNewTarget("");
    setNewIcon("target");
    setIsCreating(false);
    setDepositingId(null);
    setWithdrawingId(null);
    setAmount("");
  };

  const handleCreate = () => {
    if (!newName || !newTarget || parseFloat(newTarget) <= 0) {
      toast({ title: "Ошибка", description: "Заполните название и целевую сумму", variant: "destructive" });
      return;
    }

    const iconData = getIconData(newIcon);
    createGoal.mutate({
      name: newName,
      target_amount: parseFloat(newTarget),
      current_amount: 0,
      icon: newIcon,
      color: iconData.color,
    });
    resetForm();
    toast({ title: "Цель создана", description: newName });
  };

  const handleDeposit = (goal: typeof goals[0]) => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) return;

    const newAmount = Math.min(goal.current_amount + depositAmount, goal.target_amount);
    updateGoal.mutate({ id: goal.id, current_amount: newAmount });
    onDeduct(depositAmount, goal.name);

    if (newAmount >= goal.target_amount) {
      toast({ title: "🎉 Цель достигнута!", description: `${goal.name} — ${formatCurrency(goal.target_amount)} ₽` });
    } else {
      toast({ title: "Пополнено", description: `+${formatCurrency(depositAmount)} ₽ в "${goal.name}"` });
    }
    resetForm();
  };

  const handleWithdraw = (goal: typeof goals[0]) => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > goal.current_amount) {
      toast({ title: "Ошибка", description: "Недостаточно средств", variant: "destructive" });
      return;
    }

    updateGoal.mutate({ id: goal.id, current_amount: goal.current_amount - withdrawAmount });
    toast({ title: "Снято", description: `-${formatCurrency(withdrawAmount)} ₽ из "${goal.name}"` });
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteGoal.mutate(id);
    toast({ title: "Цель удалена" });
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Финансовые цели">
      {/* Goals List */}
      <div className="space-y-4 mb-6">
        {goals.length === 0 && !isCreating && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет финансовых целей</p>
            <p className="text-sm">Создайте цель и начните копить</p>
          </div>
        )}

        {goals.map((goal) => {
          const iconData = getIconData(goal.icon);
          const IconComponent = iconData.icon;
          const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          const isComplete = goal.current_amount >= goal.target_amount;

          return (
            <div key={goal.id} className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${goal.color || iconData.color} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {isComplete ? "✓ Цель достигнута!" : `Осталось ${formatCurrency(goal.target_amount - goal.current_amount)} ₽`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-1.5 hover:bg-muted rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">
                    {formatCurrency(goal.current_amount)} ₽
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.target_amount)} ₽
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{percentage.toFixed(0)}%</p>
              </div>

              {depositingId === goal.id || withdrawingId === goal.id ? (
                <div className="flex gap-2 mt-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Сумма"
                    className="flex-1 px-3 py-2 bg-background rounded-lg text-foreground"
                  />
                  <Button
                    size="sm"
                    onClick={() => depositingId ? handleDeposit(goal) : handleWithdraw(goal)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setDepositingId(goal.id); setWithdrawingId(null); }}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Пополнить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setWithdrawingId(goal.id); setDepositingId(null); }}
                    disabled={goal.current_amount === 0}
                  >
                    <TrendingDown className="w-4 h-4 mr-1" />
                    Снять
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Form */}
      {isCreating ? (
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Название цели"
            className="w-full px-4 py-3 bg-background rounded-xl text-foreground"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {goalIcons.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setNewIcon(item.id)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    newIcon === item.id ? `${item.color} ring-2 ring-offset-2 ring-primary` : "bg-background"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${newIcon === item.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </button>
              );
            })}
          </div>

          <input
            type="number"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            placeholder="Целевая сумма (₽)"
            className="w-full px-4 py-3 bg-background rounded-xl text-foreground"
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={resetForm}>
              Отмена
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Создать
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Создать цель
        </Button>
      )}
    </FullScreenModal>
  );
};

export default SavingsGoalsModal;
