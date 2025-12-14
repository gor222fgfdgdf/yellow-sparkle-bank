import { X, Search, Filter } from "lucide-react";
import { type Transaction } from "./TransactionList";

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const AllTransactionsModal = ({ isOpen, onClose, transactions }: AllTransactionsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">All Transactions</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transactions.map((transaction) => {
            const IconComponent = transaction.icon;
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 bg-card rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                </div>
                <span className={`font-semibold whitespace-nowrap ${
                  transaction.isIncoming ? "text-green-600" : "text-foreground"
                }`}>
                  {transaction.isIncoming ? "+" : "-"}${transaction.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AllTransactionsModal;
