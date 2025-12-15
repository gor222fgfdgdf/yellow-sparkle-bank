import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import type { Transaction } from "./TransactionList";

interface Budget {
  id: string;
  category: string;
  limit: number;
  color: string;
}

interface BudgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const STORAGE_KEY = "banking_budgets";

const categoryColors: Record<string, string> = {
  "Продукты": "bg-green-500",
  "Кафе": "bg-orange-500",
  "Транспорт": "bg-blue-500",
  "Развлечения": "bg-purple-500",
  "Покупки": "bg-pink-500",
  "ЖКХ": "bg-yellow-500",
  "Связь": "bg-cyan-500",
  "Здоровье": "bg-red-500",
  "Жильё": "bg-indigo-500",
  "Образование": "bg-teal-500",
  "Спорт": "bg-lime-500",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const BudgetsModal = ({ isOpen, onClose, transactions }: BudgetsModalProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBudgets(JSON.parse(saved));
    }
  }, []);

  const saveBudgets = (updated: Budget[]) => {
    setBudgets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getCategorySpending = (category: string): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    return transactions
      .filter(t => {
        if (t.isIncoming) return false;
        if (t.category !== category) return false;
        
        if (t.date === "Сегодня" || t.date === "Вчера") return true;
        
        const monthMap: Record<string, number> = {
          "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
          "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
        };
        const parts = t.date.split(" ");
        if (parts.length < 2) return false;
        const transMonth = monthMap[parts[1].toLowerCase()];
        return transMonth === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const availableCategories = Object.keys(categoryColors).filter(
    cat => !budgets.some(b => b.category === cat)
  );

  const handleCreate = () => {
    if (!newCategory || !newLimit || parseFloat(newLimit) <= 0) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    const newBudget: Budget = {
      id: Date.now().toString(),
      category: newCategory,
      limit: parseFloat(newLimit),
      color: categoryColors[newCategory] || "bg-gray-500",
    };

    saveBudgets([...budgets, newBudget]);
    setNewCategory("");
    setNewLimit("");
    setIsCreating(false);
    toast({ title: "Бюджет создан", description: `${newCategory}: ${formatCurrency(parseFloat(newLimit))} ₽` });
  };

  const handleUpdate = (id: string) => {
    if (!newLimit || parseFloat(newLimit) <= 0) return;
    
    const updated = budgets.map(b => 
      b.id === id ? { ...b, limit: parseFloat(newLimit) } : b
    );
    saveBudgets(updated);
    setEditingId(null);
    setNewLimit("");
    toast({ title: "Бюджет обновлён" });
  };

  const handleDelete = (id: string) => {
    saveBudgets(budgets.filter(b => b.id !== id));
    toast({ title: "Бюджет удалён" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Бюджеты на категории</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Budgets List */}
        <div className="space-y-4 mb-6">
          {budgets.length === 0 && !isCreating && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Нет созданных бюджетов</p>
              <p className="text-sm">Создайте бюджет для контроля расходов</p>
            </div>
          )}

          {budgets.map((budget) => {
            const spent = getCategorySpending(budget.category);
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOver = spent > budget.limit;
            const isNearLimit = percentage >= 80 && !isOver;

            return (
              <div key={budget.id} className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${budget.color}`} />
                    <span className="font-medium text-foreground">{budget.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(budget.id);
                        setNewLimit(budget.limit.toString());
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 hover:bg-muted rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {editingId === budget.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="flex-1 px-3 py-2 bg-background rounded-lg text-foreground"
                      placeholder="Новый лимит"
                    />
                    <Button size="sm" onClick={() => handleUpdate(budget.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={isOver ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {formatCurrency(spent)} ₽
                      </span>
                      <span className="text-muted-foreground">
                        из {formatCurrency(budget.limit)} ₽
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isOver ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
                    />
                    {isOver && (
                      <p className="text-xs text-destructive mt-1">
                        Превышен на {formatCurrency(spent - budget.limit)} ₽
                      </p>
                    )}
                    {isNearLimit && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Осталось {formatCurrency(budget.limit - spent)} ₽
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Form */}
        {isCreating ? (
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-3 bg-background rounded-xl text-foreground"
            >
              <option value="">Выберите категорию</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="Месячный лимит (₽)"
              className="w-full px-4 py-3 bg-background rounded-xl text-foreground"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                Отмена
              </Button>
              <Button className="flex-1" onClick={handleCreate}>
                Создать
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsCreating(true)} 
            className="w-full"
            disabled={availableCategories.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить бюджет
          </Button>
        )}
      </div>
    </div>
  );
};

export default BudgetsModal;
