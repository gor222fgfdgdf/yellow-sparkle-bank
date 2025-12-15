import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Check, Smartphone, Zap, Droplets, Wifi, Car, Home, CreditCard, type LucideIcon, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AutoPayment {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  provider: string;
  accountNumber: string;
  amount: number;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly";
  dayOfMonth?: number;
  dayOfWeek?: number;
  isActive: boolean;
  nextPayment: string;
}

interface AutoPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePayment: (amount: number, provider: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const frequencyLabels: Record<AutoPayment["frequency"], string> = {
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
  "Мобильная связь": "bg-blue-500/10 text-blue-600",
  "Электричество": "bg-yellow-500/10 text-yellow-600",
  "Вода": "bg-cyan-500/10 text-cyan-600",
  "Интернет": "bg-purple-500/10 text-purple-600",
  "Транспорт": "bg-green-500/10 text-green-600",
  "ЖКХ": "bg-orange-500/10 text-orange-600",
  "Кредиты": "bg-red-500/10 text-red-600",
};

const providers: Record<string, string[]> = {
  "Мобильная связь": ["МТС", "Билайн", "Мегафон", "Теле2"],
  "Электричество": ["Мосэнергосбыт", "Петроэлектросбыт", "Энергосбыт Плюс"],
  "Вода": ["Мосводоканал", "Водоканал СПб", "Горводоканал"],
  "Интернет": ["Ростелеком", "Билайн Дом", "МТС Домашний", "Дом.ру"],
  "Транспорт": ["Тройка", "Подорожник", "РЖД"],
  "ЖКХ": ["МосОблЕИРЦ", "ГИС ЖКХ", "Управляющая компания"],
  "Кредиты": ["Сбербанк", "Альфа-Банк", "ВТБ", "Тинькофф"],
};

const dayOfWeekLabels = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

const calculateNextPayment = (frequency: AutoPayment["frequency"], dayOfMonth?: number, dayOfWeek?: number): string => {
  const now = new Date();
  let nextDate = new Date();

  switch (frequency) {
    case "daily":
      nextDate.setDate(now.getDate() + 1);
      break;
    case "weekly":
      const targetDay = dayOfWeek ?? 0;
      const currentDay = now.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      nextDate.setDate(now.getDate() + daysUntil);
      break;
    case "biweekly":
      nextDate.setDate(now.getDate() + 14);
      break;
    case "monthly":
      const targetDayOfMonth = dayOfMonth ?? 1;
      nextDate.setMonth(now.getMonth() + (now.getDate() >= targetDayOfMonth ? 1 : 0));
      nextDate.setDate(targetDayOfMonth);
      break;
    case "quarterly":
      nextDate.setMonth(now.getMonth() + 3);
      break;
  }

  return nextDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

const AutoPaymentsModal = ({ isOpen, onClose, onExecutePayment }: AutoPaymentsModalProps) => {
  const [autoPayments, setAutoPayments] = useState<AutoPayment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formCategory, setFormCategory] = useState<string>("");
  const [formProvider, setFormProvider] = useState<string>("");
  const [formAccountNumber, setFormAccountNumber] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formFrequency, setFormFrequency] = useState<AutoPayment["frequency"]>("monthly");
  const [formDayOfMonth, setFormDayOfMonth] = useState<number>(1);
  const [formDayOfWeek, setFormDayOfWeek] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("autoPayments");
    if (saved) {
      setAutoPayments(JSON.parse(saved));
    }
  }, []);

  const saveAutoPayments = (payments: AutoPayment[]) => {
    setAutoPayments(payments);
    localStorage.setItem("autoPayments", JSON.stringify(payments));
  };

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

  const handleCreate = () => {
    if (!formCategory || !formProvider || !formAccountNumber || !formAmount) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    const newPayment: AutoPayment = {
      id: Date.now().toString(),
      name: `${formProvider} - ${formAccountNumber.slice(-4)}`,
      category: formCategory,
      categoryIcon: formCategory,
      provider: formProvider,
      accountNumber: formAccountNumber,
      amount: parseFloat(formAmount),
      frequency: formFrequency,
      dayOfMonth: formDayOfMonth,
      dayOfWeek: formDayOfWeek,
      isActive: true,
      nextPayment: calculateNextPayment(formFrequency, formDayOfMonth, formDayOfWeek),
    };

    saveAutoPayments([...autoPayments, newPayment]);
    toast({ title: "Автоплатёж создан", description: `${formProvider} — ${formatCurrency(parseFloat(formAmount))} ₽` });
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!formCategory || !formProvider || !formAccountNumber || !formAmount) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    const updated = autoPayments.map(p =>
      p.id === id
        ? {
            ...p,
            name: `${formProvider} - ${formAccountNumber.slice(-4)}`,
            category: formCategory,
            categoryIcon: formCategory,
            provider: formProvider,
            accountNumber: formAccountNumber,
            amount: parseFloat(formAmount),
            frequency: formFrequency,
            dayOfMonth: formDayOfMonth,
            dayOfWeek: formDayOfWeek,
            nextPayment: calculateNextPayment(formFrequency, formDayOfMonth, formDayOfWeek),
          }
        : p
    );

    saveAutoPayments(updated);
    toast({ title: "Автоплатёж обновлён" });
    resetForm();
  };

  const handleDelete = (id: string) => {
    const payment = autoPayments.find(p => p.id === id);
    saveAutoPayments(autoPayments.filter(p => p.id !== id));
    toast({ title: "Автоплатёж удалён", description: payment?.name });
  };

  const handleToggle = (id: string, isActive: boolean) => {
    const updated = autoPayments.map(p =>
      p.id === id ? { ...p, isActive } : p
    );
    saveAutoPayments(updated);
    const payment = autoPayments.find(p => p.id === id);
    toast({
      title: isActive ? "Автоплатёж включён" : "Автоплатёж приостановлен",
      description: payment?.name,
    });
  };

  const handleEdit = (payment: AutoPayment) => {
    setEditingId(payment.id);
    setFormCategory(payment.category);
    setFormProvider(payment.provider);
    setFormAccountNumber(payment.accountNumber);
    setFormAmount(payment.amount.toString());
    setFormFrequency(payment.frequency);
    setFormDayOfMonth(payment.dayOfMonth ?? 1);
    setFormDayOfWeek(payment.dayOfWeek ?? 0);
  };

  const handleExecuteNow = (payment: AutoPayment) => {
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

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Категория</label>
              <Select value={formCategory} onValueChange={(val) => { setFormCategory(val); setFormProvider(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryIcons).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider Selection */}
            {formCategory && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Поставщик</label>
                <Select value={formProvider} onValueChange={setFormProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите поставщика" />
                  </SelectTrigger>
                  <SelectContent>
                    {(providers[formCategory] || []).map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Номер лицевого счёта</label>
              <input
                type="text"
                value={formAccountNumber}
                onChange={(e) => setFormAccountNumber(e.target.value)}
                placeholder="Введите номер"
                className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Сумма</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-foreground">₽</span>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Периодичность</label>
              <Select value={formFrequency} onValueChange={(val) => setFormFrequency(val as AutoPayment["frequency"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Day of Month (for monthly) */}
            {formFrequency === "monthly" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">День месяца</label>
                <Select value={formDayOfMonth.toString()} onValueChange={(val) => setFormDayOfMonth(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Day of Week (for weekly) */}
            {formFrequency === "weekly" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">День недели</label>
                <Select value={formDayOfWeek.toString()} onValueChange={(val) => setFormDayOfWeek(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOfWeekLabels.map((day, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Отмена
              </Button>
              <Button onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                {editingId ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        )}

        {/* Auto Payments List */}
        {!isCreating && !editingId && (
          <>
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="w-full mb-4 border-dashed"
            >
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
                    <div
                      key={payment.id}
                      className={`p-4 bg-muted rounded-xl ${!payment.isActive ? "opacity-60" : ""}`}
                    >
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
                        <Switch
                          checked={payment.isActive}
                          onCheckedChange={(checked) => handleToggle(payment.id, checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-foreground">{formatCurrency(payment.amount)} ₽</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{frequencyLabels[payment.frequency]}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Следующий платёж</p>
                          <p className="font-medium text-foreground">{payment.nextPayment}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(payment)}
                          className="flex-1"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Изменить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExecuteNow(payment)}
                          className="flex-1"
                        >
                          Оплатить сейчас
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                          className="text-destructive hover:text-destructive"
                        >
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
