import { useState } from "react";
import { CreditCard, Wallet, PiggyBank, TrendingUp, ChevronRight, Eye, EyeOff, Settings } from "lucide-react";

export interface Account {
  id: string;
  type: "card" | "savings" | "investment" | "credit";
  name: string;
  balance: number;
  cardNumber?: string;
  accountNumber?: string;
  rate?: number;
  icon: any;
  color: string;
}

interface AccountsListProps {
  accounts: Account[];
  onAccountClick: (account: Account) => void;
  onCardSettings?: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const AccountsList = ({ accounts, onAccountClick, onCardSettings }: AccountsListProps) => {
  const [showBalances, setShowBalances] = useState(true);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountIcon = (account: Account) => {
    switch (account.type) {
      case "card":
        return CreditCard;
      case "savings":
        return PiggyBank;
      case "investment":
        return TrendingUp;
      case "credit":
        return Wallet;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-4">
      {/* Total Balance Header */}
      <div className="bg-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">Общий баланс</p>
          <div className="flex items-center gap-1">
            {onCardSettings && (
              <button
                onClick={onCardSettings}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              {showBalances ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground">
          {showBalances ? `${formatCurrency(totalBalance)} ₽` : "••••••"}
        </p>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.map((account) => {
          const IconComponent = getAccountIcon(account);
          return (
            <button
              key={account.id}
              onClick={() => onAccountClick(account)}
              className="w-full bg-card rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className={`w-12 h-12 rounded-xl ${account.color} flex items-center justify-center`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{account.name}</p>
                {account.cardNumber && (
                  <p className="text-sm text-muted-foreground">•••• {account.cardNumber}</p>
                )}
                {account.rate && (
                  <p className="text-sm text-success">+{account.rate}% годовых</p>
                )}
              </div>
              <div className="text-right">
                <p className={`font-semibold ${account.balance < 0 ? "text-destructive" : "text-foreground"}`}>
                  {showBalances ? `${formatCurrency(account.balance)} ₽` : "••••••"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AccountsList;
