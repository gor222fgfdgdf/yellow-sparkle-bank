import { ArrowDownLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  icon: LucideIcon;
  isIncoming?: boolean;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const TransactionList = ({ transactions }: TransactionListProps) => {
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    transactions.forEach((transaction) => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
    });
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
        <div key={date}>
          <p className="text-sm font-medium text-muted-foreground mb-3 px-1">{date}</p>
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
            {dateTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`flex items-center gap-4 p-4 ${
                  index !== dateTransactions.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transaction.isIncoming ? "bg-success/10" : "bg-muted"
                }`}>
                  {transaction.isIncoming ? (
                    <ArrowDownLeft className="w-5 h-5 text-success" />
                  ) : (
                    <transaction.icon className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <p className={`font-semibold ${
                  transaction.isIncoming ? "text-success" : "text-foreground"
                }`}>
                  {transaction.isIncoming ? "+" : "-"}{formatCurrency(transaction.amount)} ₽
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
