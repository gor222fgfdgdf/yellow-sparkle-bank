import { useState } from "react";
import { X, Smartphone, Zap, Droplets, Wifi, Car, Home, CreditCard, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { icon: any; label: string; color: string } | null;
  onPayment: (amount: number, provider: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const PaymentModal = ({ isOpen, onClose, category, onPayment }: PaymentModalProps) => {
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const providers: Record<string, string[]> = {
    "Мобильная связь": ["МТС", "Билайн", "Мегафон", "Теле2"],
    "Электричество": ["Мосэнергосбыт", "Петроэлектросбыт", "Энергосбыт Плюс"],
    "Вода": ["Мосводоканал", "Водоканал СПб", "Горводоканал"],
    "Интернет": ["Ростелеком", "Билайн Дом", "МТС Домашний", "Дом.ру"],
    "Транспорт": ["Тройка", "Подорожник", "РЖД", "Аэроэкспресс"],
    "ЖКХ": ["МосОблЕИРЦ", "ГИС ЖКХ", "Управляющая компания"],
    "Кредиты": ["Сбербанк", "Альфа-Банк", "ВТБ", "Тинькофф"],
  };

  const handlePay = () => {
    if (!provider) {
      toast({ title: "Ошибка", description: "Выберите поставщика услуг", variant: "destructive" });
      return;
    }
    if (!accountNumber) {
      toast({ title: "Ошибка", description: "Введите номер счёта/лицевого счёта", variant: "destructive" });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Ошибка", description: "Введите корректную сумму", variant: "destructive" });
      return;
    }

    onPayment(parseFloat(amount), provider);
    toast({ title: "Оплачено!", description: `${formatCurrency(parseFloat(amount))} ₽ — ${provider}` });
    setProvider("");
    setAccountNumber("");
    setAmount("");
    onClose();
  };

  if (!isOpen || !category) return null;

  const IconComponent = category.icon;
  const categoryProviders = providers[category.label] || ["Поставщик 1", "Поставщик 2", "Поставщик 3"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{category.label}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Выберите поставщика</p>
          <div className="grid grid-cols-2 gap-2">
            {categoryProviders.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === p ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium text-foreground">{p}</span>
                {provider === p && <Check className="inline-block ml-2 w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Номер лицевого счёта</p>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Введите номер"
            className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Amount */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Сумма</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">₽</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button onClick={handlePay} className="w-full h-14 text-lg font-semibold">
          Оплатить
        </Button>
      </div>
    </div>
  );
};

interface PaymentsPageProps {
  onPayment: (amount: number, provider: string) => void;
}

const PaymentsPage = ({ onPayment }: PaymentsPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{ icon: any; label: string; color: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const categories = [
    { icon: Smartphone, label: "Мобильная связь", color: "bg-blue-500/10 text-blue-600" },
    { icon: Zap, label: "Электричество", color: "bg-yellow-500/10 text-yellow-600" },
    { icon: Droplets, label: "Вода", color: "bg-cyan-500/10 text-cyan-600" },
    { icon: Wifi, label: "Интернет", color: "bg-purple-500/10 text-purple-600" },
    { icon: Car, label: "Транспорт", color: "bg-green-500/10 text-green-600" },
    { icon: Home, label: "ЖКХ", color: "bg-orange-500/10 text-orange-600" },
    { icon: CreditCard, label: "Кредиты", color: "bg-red-500/10 text-red-600" },
    { icon: Plus, label: "Ещё", color: "bg-muted text-muted-foreground" },
  ];

  const recentPayments = [
    { name: "МТС", amount: 650, date: "10 дек", category: "Мобильная связь" },
    { name: "Мосэнергосбыт", amount: 2340, date: "8 дек", category: "Электричество" },
    { name: "Ростелеком", amount: 750, date: "5 дек", category: "Интернет" },
  ];

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground px-1">Оплата услуг</h2>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleCategoryClick(cat)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground px-1">Последние платежи</h3>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {recentPayments.map((payment, idx) => (
            <button
              key={idx}
              onClick={() => {
                const cat = categories.find(c => c.label === payment.category);
                if (cat) handleCategoryClick(cat);
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
            >
              <div>
                <p className="font-medium text-foreground">{payment.name}</p>
                <p className="text-sm text-muted-foreground">{payment.date}</p>
              </div>
              <span className="font-semibold text-foreground">{formatCurrency(payment.amount)} ₽</span>
            </button>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        category={selectedCategory}
        onPayment={onPayment}
      />
    </div>
  );
};

export default PaymentsPage;
