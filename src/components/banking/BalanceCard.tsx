import { CreditCard, Eye, EyeOff, Settings } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  balance: number;
  onCardSettings?: () => void;
}

const BalanceCard = ({ balance, onCardSettings }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-primary rounded-md flex items-center justify-center">
            <CreditCard className="w-6 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Тинькофф Black</p>
            <p className="text-sm font-medium text-foreground">•••• •••• •••• 7823</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onCardSettings && (
            <button
              onClick={onCardSettings}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Настройки карты"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Eye className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Общий баланс</p>
        <p className="text-4xl font-bold text-foreground tracking-tight">
          {showBalance ? formatBalance(balance) : "••••••"}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 bg-primary/10 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Доход</p>
          <p className="text-lg font-semibold text-success">+500 000 ₽</p>
        </div>
        <div className="flex-1 bg-primary/10 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Расходы</p>
          <p className="text-lg font-semibold text-foreground">-87 450 ₽</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
