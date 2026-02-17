import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Settings, Eye, EyeOff, ChevronRight, QrCode, FileText, Link2, RefreshCw, Info, CreditCard, PiggyBank, TrendingUp, Wallet, Minus, Percent, Calendar, Clock, DollarSign, PieChart, BarChart3, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Account } from "./AccountsList";
import type { Transaction } from "./TransactionList";
import UnionPayLogo from "./UnionPayLogo";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  transactions: Transaction[];
  onTransfer: () => void;
  onTopUp: () => void;
  onCardSettings?: () => void;
  cardHolderName?: string;
  onOpenStatementExport?: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(value);
};

const formatCurrencyShort = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

// Investment portfolio data
const investmentPortfolio = [
  { name: "Сбербанк", ticker: "SBER", shares: 150, price: 268.50, change: 2.3 },
  { name: "Газпром", ticker: "GAZP", shares: 200, price: 165.20, change: -1.2 },
  { name: "Яндекс", ticker: "YNDX", shares: 25, price: 2850.00, change: 4.1 },
  { name: "Лукойл", ticker: "LKOH", shares: 10, price: 7120.00, change: 0.8 },
  { name: "МТС", ticker: "MTSS", shares: 100, price: 275.60, change: -0.5 },
];

const AccountDetailModal = ({ 
  isOpen, 
  onClose, 
  account, 
  transactions, 
  onTransfer, 
  onTopUp,
  onCardSettings,
  cardHolderName = "CARDHOLDER",
  onOpenStatementExport
}: AccountDetailModalProps) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

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
                  <div key={tx.id} className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">{tx.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.category}</p>
                    </div>
                    <p className={`font-semibold text-sm ${tx.isIncoming ? 'text-primary' : 'text-foreground'}`}>
                      {tx.isIncoming ? '+' : '-'} {formatCurrencyShort(tx.amount)} ₽
                    </p>
                  </div>
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
          <button className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left">
            <p className="text-sm font-medium text-foreground leading-tight">Снять наличные<br/>по QR-коду</p>
            <QrCode className="w-6 h-6 text-primary self-end" />
          </button>
          <button className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left">
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
          <button className="bg-muted/50 rounded-2xl p-4 h-[100px] flex flex-col justify-between text-left">
            <p className="text-sm font-medium text-foreground leading-tight">Ссылка<br/>для пополнения</p>
            <Link2 className="w-6 h-6 text-primary self-end" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <button className="w-full bg-muted/50 rounded-2xl p-4 h-[80px] flex items-center justify-between text-left">
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
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
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
              <p className="text-sm font-medium text-foreground">**{account.cardNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSavingsView = () => (
    <>
      <div className="text-center pt-2 pb-4">
        <p className="text-3xl font-bold text-foreground">{formatCurrency(account.balance)} ₽</p>
        <p className="text-sm text-muted-foreground mt-1">{account.name}</p>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-2xl p-5">
        <div className="flex items-center gap-2 bg-primary-foreground/20 rounded-lg px-3 py-2 w-fit">
          <Percent className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">{account.rate}% годовых</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-primary-foreground/70">Открыт</p>
            <p className="text-sm font-medium text-primary-foreground">15 марта 2024</p>
          </div>
          <div>
            <p className="text-xs text-primary-foreground/70">Начислено %</p>
            <p className="text-sm font-medium text-primary-foreground">+{formatCurrencyShort(Math.round(account.balance * (account.rate || 0) / 100 / 12 * 3))} ₽</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8 py-5">
        <button onClick={() => { onClose(); onTopUp(); }} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Пополнить</span>
        </button>
        <button onClick={() => { onClose(); onTransfer(); }} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Minus className="w-6 h-6 text-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Снять</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl p-4">
        <h4 className="font-medium text-foreground mb-2">Условия</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Начисление % — ежедневно</li>
          <li>• Выплата % — ежемесячно</li>
          <li>• Снятие — без ограничений</li>
          <li>• Пополнение — без ограничений</li>
        </ul>
      </div>
    </>
  );

  const renderInvestmentView = () => {
    const totalValue = investmentPortfolio.reduce((sum, stock) => sum + stock.shares * stock.price, 0);
    const totalChange = investmentPortfolio.reduce((sum, stock) => sum + (stock.shares * stock.price * stock.change / 100), 0);
    const changePercent = (totalChange / totalValue) * 100;

    return (
      <>
        <div className="text-center pt-2 pb-4">
          <p className="text-3xl font-bold text-foreground">{formatCurrency(account.balance)} ₽</p>
          <p className="text-sm text-muted-foreground mt-1">{account.name}</p>
          <p className={`text-sm mt-1 ${changePercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {changePercent >= 0 ? '+' : ''}{formatCurrencyShort(Math.round(totalChange))} ₽ ({changePercent.toFixed(2)}%)
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Портфель</h3>
          <div className="space-y-3">
            {investmentPortfolio.map((stock, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground text-sm">{stock.name}</p>
                  <p className="text-xs text-muted-foreground">{stock.ticker} • {stock.shares} шт.</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground text-sm">{formatCurrencyShort(stock.shares * stock.price)} ₽</p>
                  <p className={`text-xs ${stock.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 h-12 rounded-2xl">
            <Plus className="w-5 h-5 mr-2" />
            Купить
          </Button>
          <Button variant="secondary" className="flex-1 h-12 rounded-2xl">
            <Minus className="w-5 h-5 mr-2" />
            Продать
          </Button>
        </div>
      </>
    );
  };

  const renderCreditView = () => {
    const creditLimit = 100000;
    const usedCredit = Math.abs(account.balance);
    const availableCredit = creditLimit - usedCredit;
    const usagePercent = (usedCredit / creditLimit) * 100;

    return (
      <>
        <div className="text-center pt-2 pb-4">
          <p className="text-3xl font-bold text-foreground">{formatCurrency(account.balance)} ₽</p>
          <p className="text-sm text-muted-foreground mt-1">{account.name}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <p className="text-primary-foreground/80 text-sm">Кредитная карта</p>
            <UnionPayLogo className="w-12 h-8" />
          </div>
          <p className="text-primary-foreground font-medium">•••• {account.cardNumber}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2 text-primary-foreground/80">
              <span>Использовано</span>
              <span className="font-medium text-primary-foreground">{formatCurrencyShort(usedCredit)} ₽</span>
            </div>
            <div className="h-2 bg-primary-foreground/30 rounded-full overflow-hidden">
              <div className="h-full bg-primary-foreground rounded-full" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Лимит</span>
            <span className="font-semibold text-foreground">{formatCurrencyShort(creditLimit)} ₽</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Доступно</span>
            <span className="font-semibold text-primary">{formatCurrencyShort(availableCredit)} ₽</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Мин. платёж</span>
            <span className="font-semibold text-foreground">{formatCurrencyShort(Math.round(usedCredit * 0.05))} ₽</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Дата платежа</span>
            <span className="font-semibold text-foreground">25 декабря</span>
          </div>
        </div>

        <Button onClick={() => { onClose(); onTransfer(); }} className="w-full h-12 rounded-2xl">
          Погасить задолженность
        </Button>
      </>
    );
  };

  const renderContent = () => {
    switch (account.type) {
      case "card": return renderCardView();
      case "savings": return renderSavingsView();
      case "investment": return renderInvestmentView();
      case "credit": return renderCreditView();
      default: return renderCardView();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="flex items-center px-4 py-3 border-b border-border">
        <button onClick={onClose} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <p className="font-bold text-foreground">{formatCurrency(account.balance)} ₽</p>
        </div>
        <div className="w-6" /> {/* spacer */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pb-8 space-y-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountDetailModal;
