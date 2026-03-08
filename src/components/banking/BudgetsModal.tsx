import { useState } from "react";
import { Plus, Edit2, Trash2, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import type { Transaction } from "./TransactionList";
import FullScreenModal from "./FullScreenModal";

interface BudgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const categoryColors: Record<string, string> = {
  "Продукты": "bg-primary",
  "Кафе": "bg-accent-foreground",
  "Рестораны": "bg-accent-foreground",
  "Транспорт": "bg-primary/70",
  "Развлечения": "bg-destructive",
  "Покупки": "bg-secondary-foreground",
  "ЖКХ": "bg-muted-foreground",
  "Связь": "bg-primary/50",
  "Здоровье": "bg-destructive/70",
  "Жильё": "bg-foreground",
  "Образование": "bg-primary/60",
  "Спорт": "bg-primary/80",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const BudgetsModal = ({ isOpen, onClose, transactions }: BudgetsModalProps) => {
  const { data: dbBudgets = [] } = useBudgets();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const { toast } = useToast();

  const getCategorySpending = (category: string): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        if (t.isIncoming) return false;
        if (t.category !== category) return false;
        if (!t.rawDate) return false;
        const txDate = new Date(t.rawDate);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const allCategories = Object.keys(categoryColors);
  const availableCategories = allCategories.filter(
    cat => !dbBudgets.some(b => b.category === cat)
  );

  const handleCreate = () => {
    if (!newCategory || !newLimit || parseFloat(newLimit) <= 0) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    createBudget.mutate({
      category: newCategory,
      limit_amount: parseFloat(newLimit),
      color: categoryColors[newCategory] || "bg-muted-foreground",
    });
    setNewCategory("");
    setNewLimit("");
    setIsCreating(false);
    toast({ title: "Бюджет создан", description: `${newCategory}: ${formatCurrency(parseFloat(newLimit))} ₽` });
  };

  const handleUpdate = (id: string) => {
    if (!newLimit || parseFloat(newLimit) <= 0) return;
    updateBudget.mutate({ id, limit_amount: parseFloat(newLimit) });
    setEditingId(null);
    setNewLimit("");
    toast({ title: "Бюджет обновлён" });
  };

  const handleDelete = (id: string) => {
    deleteBudget.mutate(id);
    toast({ title: "Бюджет удалён" });
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Бюджеты на категории">
      {/* Budgets List */}
      <div className="space-y-4 mb-6">
        {dbBudgets.length === 0 && !isCreating && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет созданных бюджетов</p>
            <p className="text-sm">Создайте бюджет для контроля расходов</p>
          </div>
        )}

        {dbBudgets.map((budget) => {
          const spent = getCategorySpending(budget.category);
          const limit = Number(budget.limit_amount);
          const percentage = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;
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
                      setNewLimit(limit.toString());
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
                      из {formatCurrency(limit)} ₽
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${isOver ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-accent-foreground" : ""}`}
                  />
                  {isOver && (
                    <p className="text-xs text-destructive mt-1">
                      Превышен на {formatCurrency(spent - limit)} ₽
                    </p>
                  )}
                  {isNearLimit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Осталось {formatCurrency(limit - spent)} ₽
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
    </FullScreenModal>
  );
};

export default BudgetsModal;
