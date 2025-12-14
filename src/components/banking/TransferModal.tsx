import { useState } from "react";
import { X, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onTransfer: (amount: number, recipient: string) => void;
}

const TransferModal = ({ isOpen, onClose, balance, onTransfer }: TransferModalProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  const handleTransfer = () => {
    const transferAmount = parseFloat(amount);

    if (!recipient.trim()) {
      toast.error("Введите получателя");
      return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    if (transferAmount > balance) {
      toast.error("Недостаточно средств");
      return;
    }

    onTransfer(transferAmount, recipient);
    toast.success(`Переведено ${formatCurrency(transferAmount)} ₽ — ${recipient}`);
    setRecipient("");
    setAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Перевести</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Получатель</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Номер карты или телефона"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="pl-12 h-14 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Сумма</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₽</span>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 h-14 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground text-xl font-semibold"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Доступно: {formatCurrency(balance)} ₽
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            {[1000, 5000, 10000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-2 px-4 bg-muted rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {formatCurrency(preset)} ₽
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleTransfer}
          className="w-full h-14 mt-6 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors"
        >
          Перевести
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default TransferModal;
