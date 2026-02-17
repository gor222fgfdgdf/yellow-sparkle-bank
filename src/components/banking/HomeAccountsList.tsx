import { ChevronRight } from "lucide-react";
import type { Account } from "@/components/banking/AccountsList";

interface HomeAccountsListProps {
  accounts: Account[];
  onAccountClick: (account: Account) => void;
  onShowAll?: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(value);

const getCardBadge = (account: Account) => {
  const name = account.name.toLowerCase();
  if (name.includes("мир") || name.includes("mir")) {
    return (
      <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">
        <span>**{account.cardNumber}</span>
        <div className="text-[9px] font-bold mt-0.5">МИР</div>
      </div>
    );
  }
  if (name.includes("union") || name.includes("юнион")) {
    return (
      <div className="bg-teal-600 text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">
        <span>**{account.cardNumber}</span>
        <div className="text-[9px] mt-0.5">UnionPay</div>
      </div>
    );
  }
  if (account.cardNumber) {
    return (
      <span className="text-sm text-muted-foreground">**{account.cardNumber}</span>
    );
  }
  return null;
};

const HomeAccountsList = ({ accounts, onAccountClick, onShowAll }: HomeAccountsListProps) => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-foreground">Счета и карты</h2>
        <button onClick={onShowAll} className="text-sm font-medium text-primary">Ещё</button>
      </div>

      <div className="divide-y divide-border">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onAccountClick(account)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(account.balance)} ₽
              </p>
              <p className="text-sm text-muted-foreground truncate">{account.name}</p>
            </div>
            {getCardBadge(account)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeAccountsList;
