import { useState, useMemo } from "react";
import { X, Search, Filter } from "lucide-react";
import { type Transaction } from "./TransactionList";
import TransactionDetailModal from "./TransactionDetailModal";
import type { Account } from "./AccountsList";

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts?: Account[];
}

const formatCurrency = (value: number) => {
  const abs = Math.abs(value);
  const intPart = new Intl.NumberFormat("ru-RU").format(Math.trunc(abs));
  const frac = Math.round((abs - Math.trunc(abs)) * 100).toString().padStart(2, '0');
  return `${intPart}.${frac}`;
};

const AllTransactionsModal = ({ isOpen, onClose, transactions, accounts }: AllTransactionsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t =>
      t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-background border-b border-border p-4" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 44px)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Все операции</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск операций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Ничего не найдено</p>
              <p className="text-sm mt-1">Попробуйте другой запрос</p>
            </div>
          ) : (
            filtered.map((transaction) => {
              const IconComponent = transaction.icon;
              return (
                <button
                  key={transaction.id}
                  onClick={() => setSelectedTx(transaction)}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.isIncoming ? "bg-success/10" : "bg-muted"
                  }`}>
                    <IconComponent className={`w-6 h-6 ${transaction.isIncoming ? "text-success" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{transaction.name}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                  </div>
                  <span className={`font-semibold whitespace-nowrap ${
                    transaction.isIncoming ? "text-success" : "text-foreground"
                  }`}>
                    {transaction.isIncoming ? "+" : "-"}
                    {transaction.currency && transaction.currency !== 'RUB' && transaction.originalAmount != null
                      ? `${formatCurrency(transaction.originalAmount)} ${transaction.currency}`
                      : `${formatCurrency(transaction.amount)} ₽`
                    }
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedTx && (
        <TransactionDetailModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          transaction={{
            ...selectedTx,
            isIncoming: selectedTx.isIncoming || false,
            accountName: accounts?.find(a => a.id === selectedTx.accountId)?.name,
            accountCardNumber: accounts?.find(a => a.id === selectedTx.accountId)?.cardNumber,
            currency: selectedTx.currency,
            originalAmount: selectedTx.originalAmount,
            commission: selectedTx.commission,
            createdAt: selectedTx.createdAt,
          }}
        />
      )}
    </div>
  );
};

export default AllTransactionsModal;
