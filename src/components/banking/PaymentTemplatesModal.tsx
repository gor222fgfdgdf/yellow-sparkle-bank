import { useState } from "react";
import { X, Star, Plus, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePaymentTemplates, useCreatePaymentTemplate, useDeletePaymentTemplate } from "@/hooks/usePaymentTemplates";

interface PaymentTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (amount: number, provider: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const categories = [
  "Мобильная связь", "Электричество", "Вода", "Интернет", "Транспорт", "ЖКХ", "Кредиты",
];

const PaymentTemplatesModal = ({ isOpen, onClose, onPayment }: PaymentTemplatesModalProps) => {
  const { data: templates = [] } = usePaymentTemplates();
  const createTemplate = useCreatePaymentTemplate();
  const deleteTemplate = useDeletePaymentTemplate();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", category: "", provider: "", accountNumber: "", amount: "" });
  const { toast } = useToast();

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.category || !newTemplate.provider.trim() || !newTemplate.accountNumber.trim() || !newTemplate.amount || parseFloat(newTemplate.amount) <= 0) {
      toast({ title: "Ошибка", description: "Заполните все поля корректно", variant: "destructive" });
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: newTemplate.name.trim(),
        category: newTemplate.category,
        provider: newTemplate.provider.trim(),
        account_number: newTemplate.accountNumber.trim(),
        amount: parseFloat(newTemplate.amount),
        icon: "CreditCard",
      });
      setNewTemplate({ name: "", category: "", provider: "", accountNumber: "", amount: "" });
      setIsAddingNew(false);
      toast({ title: "Шаблон создан", description: newTemplate.name });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось создать шаблон", variant: "destructive" });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      toast({ title: "Шаблон удалён" });
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const handleExecuteTemplate = (template: typeof templates[0]) => {
    onPayment(template.amount || 0, template.provider);
    toast({ title: "Оплачено!", description: `${formatCurrency(template.amount || 0)} ₽ — ${template.provider}` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Шаблоны платежей</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {templates.length > 0 && !isAddingNew && (
          <div className="space-y-3 mb-6">
            {templates.map((template) => (
              <div key={template.id} className="p-4 bg-muted rounded-xl flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.provider} • {template.account_number}</p>
                  <p className="text-sm font-medium text-primary">{formatCurrency(template.amount || 0)} ₽</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleExecuteTemplate(template)} className="text-primary hover:bg-primary/10">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {templates.length === 0 && !isAddingNew && (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Нет сохранённых шаблонов</p>
            <p className="text-sm">Создайте шаблон для быстрой оплаты</p>
          </div>
        )}

        {isAddingNew && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Название шаблона</label>
              <Input value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="Например: Оплата интернета" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Категория</label>
              <select value={newTemplate.category} onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })} className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                <option value="">Выберите категорию</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Поставщик</label>
              <Input value={newTemplate.provider} onChange={(e) => setNewTemplate({ ...newTemplate, provider: e.target.value })} placeholder="Например: Ростелеком" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Номер счёта</label>
              <Input value={newTemplate.accountNumber} onChange={(e) => setNewTemplate({ ...newTemplate, accountNumber: e.target.value })} placeholder="Введите номер" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Сумма</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-foreground">₽</span>
                <Input type="number" value={newTemplate.amount} onChange={(e) => setNewTemplate({ ...newTemplate, amount: e.target.value })} placeholder="0" className="pl-10 text-lg font-bold" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setIsAddingNew(false); setNewTemplate({ name: "", category: "", provider: "", accountNumber: "", amount: "" }); }} className="flex-1">Отмена</Button>
              <Button onClick={handleAddTemplate} className="flex-1" disabled={createTemplate.isPending}>Сохранить</Button>
            </div>
          </div>
        )}

        {!isAddingNew && (
          <Button onClick={() => setIsAddingNew(true)} className="w-full h-14 text-lg font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Создать шаблон
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentTemplatesModal;
