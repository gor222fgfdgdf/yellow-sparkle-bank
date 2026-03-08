import { useState } from "react";
import { ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FullScreenModal from "./FullScreenModal";

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

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Перевести">
      <div className="space-y-6">
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

        <div className="flex gap-2">
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

        <Button
          onClick={handleTransfer}
          className="w-full h-14 rounded-xl font-semibold text-lg"
        >
          Перевести
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </FullScreenModal>
  );
};

export default TransferModal;
