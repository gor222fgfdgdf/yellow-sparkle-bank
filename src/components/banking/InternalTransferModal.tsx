import { useState } from "react";
import { X, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type Account } from "./AccountsList";

interface InternalTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const InternalTransferModal = ({ isOpen, onClose, accounts, onTransfer }: InternalTransferModalProps) => {
  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);

  const availableToAccounts = accounts.filter(a => a.id !== fromAccountId);

  const handleTransfer = () => {
    const transferAmount = parseFloat(amount);

    if (!fromAccountId || !toAccountId) {
      toast.error("Выберите счета для перевода");
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error("Выберите разные счета");
      return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    if (fromAccount && transferAmount > fromAccount.balance) {
      toast.error("Недостаточно средств");
      return;
    }

    onTransfer(fromAccountId, toAccountId, transferAmount);
    toast.success(`Переведено ${formatCurrency(transferAmount)} ₽`);
    setAmount("");
    onClose();
  };

  const swapAccounts = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Перевод между счетами</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* From Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Откуда</label>
            <div className="relative">
              <button
                onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
                className="w-full p-4 bg-muted rounded-xl flex items-center justify-between text-left"
              >
                {fromAccount ? (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${fromAccount.color} flex items-center justify-center`}>
                      <fromAccount.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{fromAccount.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(fromAccount.balance)} ₽</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Выберите счёт</span>
                )}
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showFromDropdown ? "rotate-180" : ""}`} />
              </button>
              
              {showFromDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        setFromAccountId(account.id);
                        if (account.id === toAccountId) {
                          setToAccountId(availableToAccounts.find(a => a.id !== account.id)?.id || "");
                        }
                        setShowFromDropdown(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${account.color} flex items-center justify-center`}>
                        <account.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(account.balance)} ₽</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapAccounts}
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-90" />
            </button>
          </div>

          {/* To Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Куда</label>
            <div className="relative">
              <button
                onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
                className="w-full p-4 bg-muted rounded-xl flex items-center justify-between text-left"
              >
                {toAccount ? (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${toAccount.color} flex items-center justify-center`}>
                      <toAccount.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{toAccount.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(toAccount.balance)} ₽</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Выберите счёт</span>
                )}
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showToDropdown ? "rotate-180" : ""}`} />
              </button>
              
              {showToDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {availableToAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        setToAccountId(account.id);
                        setShowToDropdown(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${account.color} flex items-center justify-center`}>
                        <account.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(account.balance)} ₽</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Сумма</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">₽</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-xl font-bold bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {fromAccount && (
              <p className="text-sm text-muted-foreground">
                Доступно: {formatCurrency(fromAccount.balance)} ₽
              </p>
            )}
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[10000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-2 px-3 bg-muted rounded-xl text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {formatCurrency(preset)} ₽
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleTransfer}
          className="w-full h-14 mt-6 rounded-xl font-semibold text-lg"
        >
          Перевести
        </Button>
      </div>
    </div>
  );
};

export default InternalTransferModal;
