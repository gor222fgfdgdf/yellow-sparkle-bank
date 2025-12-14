import { useState } from "react";
import { X, CreditCard, Building, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number, method: string) => void;
}

const TopUpModal = ({ isOpen, onClose, onTopUp }: TopUpModalProps) => {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  const methods = [
    { id: "card", icon: CreditCard, label: "С карты" },
    { id: "bank", icon: Building, label: "Со счёта" },
    { id: "sbp", icon: Smartphone, label: "Через СБП" },
  ];

  const presets = [1000, 5000, 10000, 25000, 50000];

  const handleTopUp = () => {
    const topUpAmount = parseFloat(amount);
    if (!selectedMethod) {
      toast({
        title: "Выберите способ",
        description: "Выберите способ пополнения",
        variant: "destructive",
      });
      return;
    }
    if (!amount || topUpAmount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive",
      });
      return;
    }

    onTopUp(topUpAmount, selectedMethod);
    toast({
      title: "Успешно!",
      description: `${formatCurrency(topUpAmount)} ₽ зачислено на счёт`,
    });
    setAmount("");
    setSelectedMethod(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Пополнить счёт</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Methods */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Способ пополнения</p>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <method.icon className={`w-6 h-6 ${
                  selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                }`} />
                <span className="text-xs font-medium text-foreground">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Сумма</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">₽</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium text-foreground whitespace-nowrap"
            >
              {formatCurrency(preset)} ₽
            </button>
          ))}
        </div>

        <Button
          onClick={handleTopUp}
          className="w-full h-14 text-lg font-semibold"
        >
          Пополнить
        </Button>
      </div>
    </div>
  );
};

export default TopUpModal;
