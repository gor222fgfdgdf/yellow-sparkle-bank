import { useState } from "react";
import { X, Plus, Trash2, Edit2, Check, Smartphone, Zap, Droplets, Wifi, Car, Home, CreditCard, type LucideIcon, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAutoPayments, useCreateAutoPayment, useUpdateAutoPayment, useDeleteAutoPayment } from "@/hooks/useAutoPayments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AutoPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePayment: (amount: number, provider: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

const frequencyLabels: Record<string, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  biweekly: "Раз в 2 недели",
  monthly: "Ежемесячно",
  quarterly: "Раз в квартал",
};

const categoryIcons: Record<string, LucideIcon> = {
  "Мобильная связь": Smartphone,
  "Электричество": Zap,
  "Вода": Droplets,
  "Интернет": Wifi,
  "Транспорт": Car,
  "ЖКХ": Home,
  "Кредиты": CreditCard,
};

const categoryColors: Record<string, string> = {
  "Мобильная связь": "bg-primary/10 text-primary",
  "Электричество": "bg-primary/10 text-primary",
  "Вода": "bg-primary/10 text-primary",
  "Интернет": "bg-primary/10 text-primary",
  "Транспорт": "bg-primary/10 text-primary",
  "ЖКХ": "bg-primary/10 text-primary",
  "Кредиты": "bg-destructive/10 text-destructive",
};

const providers: Record<string, string[]> = {
  "Мобильная связь": ["МТС", "Билайн", "Мегафон", "Теле2"],
  "Электричество": ["Мосэнергосбыт", "Петроэлектросбыт", "Энергосбыт Плюс"],
  "Вода": ["Мосводоканал", "Водоканал СПб", "Горводоканал"],
  "Интернет": ["Ростелеком", "Билайн Дом", "МТС Домашний", "Дом.ру"],
  "Транспорт": ["Тройка", "Подорожник", "РЖД"],
  "ЖКХ": ["МосОблЕИРЦ", "ГИС ЖКХ", "Управляющая компания"],
  "Кредиты": ["Сбербанк", "Альфа-Банк", "ВТБ", "Россельхозбанк"],
};

const dayOfWeekLabels = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

const calculateNextPaymentDate = (frequency: string, dayOfMonth?: number, dayOfWeek?: number): string => {
  const now = new Date();
  let nextDate = new Date();

  switch (frequency) {
    case "daily":
      nextDate.setDate(now.getDate() + 1);
      break;
    case "weekly": {
      const target = dayOfWeek ?? 0;
      const current = now.getDay();
      const daysUntil = (target - current + 7) % 7 || 7;
      nextDate.setDate(now.getDate() + daysUntil);
      break;
    }
    case "biweekly":
      nextDate.setDate(now.getDate() + 14);
      break;
    case "monthly": {
      const targetDay = dayOfMonth ?? 1;
      nextDate.setMonth(now.getMonth() + (now.getDate() >= targetDay ? 1 : 0));
      nextDate.setDate(targetDay);
      break;
    }
    case "quarterly":
      nextDate.setMonth(now.getMonth() + 3);
      break;
  }

  return nextDate.toISOString().split("T")[0];
};

const AutoPaymentsModal = ({ isOpen, onClose, onExecutePayment }: AutoPaymentsModalProps) => {
  const { data: autoPayments = [] } = useAutoPayments();
  const createPayment = useCreateAutoPayment();
  const updatePayment = useUpdateAutoPayment();
  const deletePayment = useDeleteAutoPayment();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formCategory, setFormCategory] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formDayOfMonth, setFormDayOfMonth] = useState(1);
  const [formDayOfWeek, setFormDayOfWeek] = useState(0);

  const resetForm = () => {
    setFormCategory("");
    setFormProvider("");
    setFormAccountNumber("");
    setFormAmount("");
    setFormFrequency("monthly");
    setFormDayOfMonth(1);
    setFormDayOfWeek(0);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formCategory || !formProvider || !formAccountNumber || !formAmount) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    try {
      await createPayment.mutateAsync({
        name: `${formProvider} - ${formAccountNumber.slice(-4)}`,
        category: formCategory,
        provider: formProvider,
        account_number: formAccountNumber,
        amount: parseFloat(formAmount),
        frequency: formFrequency,
        day_of_month: formFrequency === "monthly" ? formDayOfMonth : null,
        day_of_week: formFrequency === "weekly" ? formDayOfWeek : null,
        is_active: true,
        next_payment_date: calculateNextPaymentDate(formFrequency, formDayOfMonth, formDayOfWeek),
        icon: "CreditCard",
      });
      toast({ title: "Автоплатёж создан", description: `${formProvider} — ${formatCurrency(parseFloat(formAmount))} ₽` });
      resetForm();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось создать автоплатёж", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formCategory || !formProvider || !formAccountNumber || !formAmount) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    try {
      await updatePayment.mutateAsync({
        id,
        name: `${formProvider} - ${formAccountNumber.slice(-4)}`,
        category: formCategory,
        provider: formProvider,
        account_number: formAccountNumber,
        amount: parseFloat(formAmount),
        frequency: formFrequency,
        day_of_month: formFrequency === "monthly" ? formDayOfMonth : null,
        day_of_week: formFrequency === "weekly" ? formDayOfWeek : null,
        next_payment_date: calculateNextPaymentDate(formFrequency, formDayOfMonth, formDayOfWeek),
      });
      toast({ title: "Автоплатёж обновлён" });
      resetForm();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось обновить", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePayment.mutateAsync(id);
      toast({ title: "Автоплатёж удалён" });
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await updatePayment.mutateAsync({ id, is_active: isActive });
    toast({ title: isActive ? "Автоплатёж включён" : "Автоплатёж приостановлен" });
  };

  const handleEdit = (payment: typeof autoPayments[0]) => {
    setEditingId(payment.id);
    setFormCategory(payment.category);
    setFormProvider(payment.provider);
    setFormAccountNumber(payment.account_number);
    setFormAmount(payment.amount.toString());
    setFormFrequency(payment.frequency);
    setFormDayOfMonth(payment.day_of_month ?? 1);
    setFormDayOfWeek(payment.day_of_week ?? 0);
  };

  const handleExecuteNow = (payment: typeof autoPayments[0]) => {
    onExecutePayment(payment.amount, payment.provider);
    toast({ title: "Платёж выполнен", description: `${payment.provider} — ${formatCurrency(payment.amount)} ₽` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Автоплатежи</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="space-y-4 mb-6 p-4 bg-muted rounded-xl">
            <h3 className="font-semibold text-foreground">
              {editingId ? "Редактировать автоплатёж" : "Новый автоплатёж"}
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Категория</label>
              <Select value={formCategory} onValueChange={(val) => { setFormCategory(val); setFormProvider(""); }}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryIcons).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formCategory && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Поставщик</label>
                <Select value={formProvider} onValueChange={setFormProvider}>
                  <SelectTrigger><SelectValue placeholder="Выберите поставщика" /></SelectTrigger>
                  <SelectContent>
                    {(providers[formCategory] || []).map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Номер лицевого счёта</label>
              <input type="text" value={formAccountNumber} onChange={(e) => setFormAccountNumber(e.target.value)} placeholder="Введите номер" className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Сумма</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-foreground">₽</span>
                <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0" className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Периодичность</label>
              <Select value={formFrequency} onValueChange={setFormFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formFrequency === "monthly" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">День месяца</label>
                <Select value={formDayOfMonth.toString()} onValueChange={(val) => setFormDayOfMonth(parseInt(val))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formFrequency === "weekly" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">День недели</label>
                <Select value={formDayOfWeek.toString()} onValueChange={(val) => setFormDayOfWeek(parseInt(val))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dayOfWeekLabels.map((day, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">Отмена</Button>
              <Button onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} className="flex-1" disabled={createPayment.isPending || updatePayment.isPending}>
                <Check className="w-4 h-4 mr-2" />
                {editingId ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        )}

        {/* Auto Payments List */}
        {!isCreating && !editingId && (
          <>
            <Button onClick={() => setIsCreating(true)} variant="outline" className="w-full mb-4 border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Добавить автоплатёж
            </Button>

            {autoPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет настроенных автоплатежей</p>
                <p className="text-sm">Добавьте первый автоплатёж</p>
              </div>
            ) : (
              <div className="space-y-3">
                {autoPayments.map((payment) => {
                  const IconComponent = categoryIcons[payment.category] || CreditCard;
                  const colorClass = categoryColors[payment.category] || "bg-muted text-muted-foreground";

                  return (
                    <div key={payment.id} className={`p-4 bg-muted rounded-xl ${!payment.is_active ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{payment.provider}</p>
                            <p className="text-sm text-muted-foreground">{payment.category}</p>
                          </div>
                        </div>
                        <Switch checked={payment.is_active ?? false} onCheckedChange={(checked) => handleToggle(payment.id, checked)} />
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-foreground">{formatCurrency(payment.amount)} ₽</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{frequencyLabels[payment.frequency] || payment.frequency}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Следующий платёж</p>
                          <p className="font-medium text-foreground">
                            {new Date(payment.next_payment_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)} className="flex-1">
                          <Edit2 className="w-4 h-4 mr-1" />
                          Изменить
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleExecuteNow(payment)} className="flex-1">
                          Оплатить сейчас
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(payment.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AutoPaymentsModal;
