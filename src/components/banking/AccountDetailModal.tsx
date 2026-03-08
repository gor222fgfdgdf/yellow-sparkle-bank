import { useState, useCallback } from "react";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { ArrowLeft, ArrowRight, Plus, Settings, Eye, EyeOff, ChevronRight, QrCode, FileText, Link2, RefreshCw, Info, CreditCard, PiggyBank, TrendingUp, Wallet, Minus, Percent, Calendar, Clock, DollarSign, PieChart, BarChart3, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Account } from "./AccountsList";
import type { Transaction } from "./TransactionList";
import UnionPayLogo from "./UnionPayLogo";
import TransactionDetailModal from "./TransactionDetailModal";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  transactions: Transaction[];
  onTransfer?: () => void;
  onTopUp: () => void;
  onCardSettings?: () => void;
  cardHolderName?: string;
  onOpenStatementExport?: () => void;
  onOpenAccountCertificate?: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(value);
};

const formatCurrencyShort = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};


const AccountDetailModal = ({ 
  isOpen, 
  onClose, 
  account, 
  transactions, 
  onTransfer, 
  onTopUp,
  onCardSettings,
  cardHolderName = "CARDHOLDER",
  onOpenStatementExport,
  onOpenAccountCertificate
}: AccountDetailModalProps) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useSwipeBack({ onBack: onClose, enabled: isOpen });

  if (!isOpen) return null;

  const accountTransactions = transactions.slice(0, showAllTransactions ? 20 : 5);

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  accountTransactions.forEach(tx => {
    const key = tx.date;
    if (!groupedTransactions[key]) groupedTransactions[key] = [];
    groupedTransactions[key].push(tx);
  });

  const renderCardView = () => (
    <>
      {/* Balance + Card Name */}
      <div className="text-center pt-2 pb-4">
        <p className="text-3xl font-bold text-foreground">{formatCurrency(account.balance)} ₽</p>
        <p className="text-sm text-muted-foreground mt-1">{account.name}</p>
      </div>

      {/* Card Visual */}
      <div className="mx-auto w-[280px] h-[170px] rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-primary-foreground/5" />
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-primary-foreground font-bold text-lg tracking-wider">РСХБ</p>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor" opacity="0.5"/>
                <path d="M15 8.5c0 1.38-1.12 2.5-2.5 2.5S10 9.88 10 8.5 11.12 6 12.5 6 15 7.12 15 8.5z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div>
            <p className="text-primary-foreground/80 text-sm">Дебетовая</p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <span className="text-primary-foreground font-medium">**{account.cardNumber}</span>
                <button onClick={() => setShowCardNumber(!showCardNumber)} className="opacity-70">
                  {showCardNumber ? <EyeOff className="w-4 h-4 text-primary-foreground" /> : <Eye className="w-4 h-4 text-primary-foreground" />}
                </button>
              </div>
              <UnionPayLogo className="w-12 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Action Buttons */}
      <div className="flex justify-center gap-8 py-5">
        <button onClick={() => { onClose(); onTransfer(); }} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Оплатить</span>
        </button>
        <button onClick={() => { onClose(); onTopUp(); }} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Пополнить</span>
        </button>
        <button onClick={onCardSettings} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Настроить</span>
        </button>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-primary/90 to-primary/60 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-primary-foreground font-semibold text-sm">Путешествуйте с UnionPay</p>
          <p className="text-primary-foreground/80 text-xs mt-1">Выгодный курс без скрытых комиссий</p>
        </div>
        <div className="w-16 h-16 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
          <span className="text-2xl">🏯</span>
        </div>
      </div>

      {/* Последние операции */}
      <div className="bg-card rounded-2xl overflow-hidden mt-2">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-foreground">Последние операции</h2>
          <button className="text-sm font-medium text-primary">Ещё</button>
        </div>

        <div className="px-4 pb-2">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs text-muted-foreground py-2 font-medium">{date}</p>
              {txs.map((tx) => {
                const Icon = tx.icon;
                return (
                  <button key={tx.id} onClick={() => setSelectedTx(tx)} className="flex items-center gap-3 py-3 w-full text-left hover:bg-muted/50 transition-colors rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.category}</p>
                    </div>
                    <p className={`font-semibold text-sm ${tx.isIncoming ? 'text-primary' : 'text-foreground'}`}>
                      {tx.isIncoming ? '+' : '-'}{tx.currency && tx.currency !== 'RUB' && tx.originalAmount != null
                        ? `${formatCurrencyShort(tx.originalAmount)} ${tx.currency}`
                        : `${formatCurrencyShort(tx.amount)} ₽`
                      }
                    </p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {!showAllTransactions && transactions.length > 5 && (
          <button
            onClick={() => setShowAllTransactions(true)}
            className="w-full py-3 text-sm text-muted-foreground font-medium border-t border-border"
          >
            Показать больше
          </button>
        )}
      </div>

      {/* Услуги */}
      <div className="bg-card rounded-2xl overflow-hidden mt-2">
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-lg font-bold text-foreground">Услуги</h2>
        </div>
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <button 
            onClick={() => toast.info("Снятие наличных по QR-коду доступно в банкоматах РСХБ. Поднесите QR-код к сканеру банкомата.")}
            className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left"
          >
            <p className="text-sm font-medium text-foreground leading-tight">Снять наличные<br/>по QR-коду</p>
            <QrCode className="w-6 h-6 text-primary self-end" />
          </button>
          <button 
            onClick={() => { if (onOpenAccountCertificate) { onClose(); onOpenAccountCertificate(); } }}
            className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left"
          >
            <p className="text-sm font-medium text-foreground leading-tight">Сформировать<br/>справку</p>
            <FileText className="w-6 h-6 text-primary self-end" />
          </button>
          <button 
            onClick={() => { if (onOpenStatementExport) { onClose(); onOpenStatementExport(); } }}
            className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left"
          >
            <p className="text-sm font-medium text-foreground leading-tight">Сформировать<br/>выписку</p>
            <FileText className="w-6 h-6 text-primary self-end" />
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`https://pay.rshb.ru/top-up/${account.accountNumber || account.cardNumber}`);
              toast.success("Ссылка для пополнения скопирована в буфер обмена");
            }}
            className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left"
          >
            <p className="text-sm font-medium text-foreground leading-tight">Ссылка<br/>для пополнения</p>
            <Link2 className="w-6 h-6 text-primary self-end" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <button 
            onClick={() => toast.info("Автопополнение настраивается через раздел «Платежи» → «Автоплатежи». Выберите источник и сумму пополнения.")}
            className="w-full bg-muted/50 rounded-2xl p-4 h-[80px] flex items-center justify-between text-left"
          >
            <p className="text-sm font-medium text-foreground leading-tight">Подключить<br/>автопополнение</p>
            <RefreshCw className="w-6 h-6 text-primary" />
          </button>
        </div>
      </div>

      {/* Детали карты */}
      <div className="bg-card rounded-2xl overflow-hidden mt-2">
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-lg font-bold text-foreground">Детали карты</h2>
        </div>
        <div className="divide-y divide-border">
          <button 
            onClick={() => toast.info("UnionPay Classic QuickPass — дебетовая карта для оплаты в 180+ странах, бесконтактные платежи, бесплатное обслуживание.")}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">О продукте</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Привязана к счёту</p>
              <p className="text-sm font-medium text-foreground">**{account.accountNumber?.slice(-4) || account.cardNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => renderCardView();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background flex items-center px-4 py-3 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 44px)' }}>
        <button onClick={onClose} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <p className="font-bold text-foreground">{formatCurrency(account.balance)} ₽</p>
        </div>
        <div className="w-6" /> {/* spacer */}
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pb-8 space-y-4">
        {renderContent()}
      </div>
      {selectedTx && (
        <TransactionDetailModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          transaction={{ ...selectedTx, isIncoming: selectedTx.isIncoming || false, accountName: account.name, accountCardNumber: account.cardNumber }}
        />
      )}
    </div>
  );
};

export default AccountDetailModal;
