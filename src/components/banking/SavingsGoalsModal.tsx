import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, Target, Plane, Car, Home, GraduationCap, Gift, PiggyBank, Check, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  autoDeduction: number;
  createdAt: string;
}

interface SavingsGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeduct: (amount: number, goalName: string) => void;
}

const STORAGE_KEY = "banking_savings_goals";

const goalIcons: { id: string; icon: LucideIcon; label: string; color: string }[] = [
  { id: "plane", icon: Plane, label: "Отпуск", color: "bg-blue-500" },
  { id: "car", icon: Car, label: "Автомобиль", color: "bg-green-500" },
  { id: "home", icon: Home, label: "Жильё", color: "bg-purple-500" },
  { id: "education", icon: GraduationCap, label: "Образование", color: "bg-orange-500" },
  { id: "gift", icon: Gift, label: "Подарок", color: "bg-pink-500" },
  { id: "piggy", icon: PiggyBank, label: "Подушка", color: "bg-yellow-500" },
  { id: "target", icon: Target, label: "Другое", color: "bg-gray-500" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const SavingsGoalsModal = ({ isOpen, onClose, onDeduct }: SavingsGoalsModalProps) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [depositingId, setDepositingId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newIcon, setNewIcon] = useState("target");
  const [newAutoDeduction, setNewAutoDeduction] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  const saveGoals = (updated: SavingsGoal[]) => {
    setGoals(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getIconData = (iconId: string) => {
    return goalIcons.find(i => i.id === iconId) || goalIcons[goalIcons.length - 1];
  };

  const handleCreate = () => {
    if (!newName || !newTarget || parseFloat(newTarget) <= 0) {
      toast({ title: "Ошибка", description: "Заполните название и целевую сумму", variant: "destructive" });
      return;
    }

    const iconData = getIconData(newIcon);
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: newName,
      targetAmount: parseFloat(newTarget),
      currentAmount: 0,
      icon: newIcon,
      color: iconData.color,
      autoDeduction: parseFloat(newAutoDeduction) || 0,
      createdAt: new Date().toISOString(),
    };

    saveGoals([...goals, newGoal]);
    resetForm();
    toast({ title: "Цель создана", description: newName });
  };

  const resetForm = () => {
    setNewName("");
    setNewTarget("");
    setNewIcon("target");
    setNewAutoDeduction("");
    setIsCreating(false);
    setEditingId(null);
    setDepositingId(null);
    setWithdrawingId(null);
    setAmount("");
  };

  const handleDeposit = (goal: SavingsGoal) => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) return;

    const updated = goals.map(g => 
      g.id === goal.id 
        ? { ...g, currentAmount: Math.min(g.currentAmount + depositAmount, g.targetAmount) }
        : g
    );
    saveGoals(updated);
    onDeduct(depositAmount, goal.name);
    
    const newAmount = Math.min(goal.currentAmount + depositAmount, goal.targetAmount);
    if (newAmount >= goal.targetAmount) {
      toast({ title: "🎉 Цель достигнута!", description: `${goal.name} — ${formatCurrency(goal.targetAmount)} ₽` });
    } else {
      toast({ title: "Пополнено", description: `+${formatCurrency(depositAmount)} ₽ в "${goal.name}"` });
    }
    resetForm();
  };

  const handleWithdraw = (goal: SavingsGoal) => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > goal.currentAmount) {
      toast({ title: "Ошибка", description: "Недостаточно средств", variant: "destructive" });
      return;
    }

    const updated = goals.map(g => 
      g.id === goal.id ? { ...g, currentAmount: g.currentAmount - withdrawAmount } : g
    );
    saveGoals(updated);
    toast({ title: "Снято", description: `-${formatCurrency(withdrawAmount)} ₽ из "${goal.name}"` });
    resetForm();
  };

  const handleDelete = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
    toast({ title: "Цель удалена" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Финансовые цели</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

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
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${goal.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isComplete ? "✓ Цель достигнута!" : `Осталось ${formatCurrency(goal.targetAmount - goal.currentAmount)} ₽`}
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
                      {formatCurrency(goal.currentAmount)} ₽
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.targetAmount)} ₽
                    </span>
                  </div>
                  <Progress value={percentage} className={`h-2 ${isComplete ? "[&>div]:bg-green-500" : ""}`} />
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
                      disabled={goal.currentAmount === 0}
                    >
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Снять
                    </Button>
                  </div>
                )}

                {goal.autoDeduction > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Автопополнение: {formatCurrency(goal.autoDeduction)} ₽/мес
                  </p>
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
                    <Icon className={`w-6 h-6 ${newIcon === item.id ? "text-white" : "text-muted-foreground"}`} />
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
            
            <input
              type="number"
              value={newAutoDeduction}
              onChange={(e) => setNewAutoDeduction(e.target.value)}
              placeholder="Автопополнение в месяц (₽, опционально)"
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
      </div>
    </div>
  );
};

export default SavingsGoalsModal;
