import { useState } from "react";
import { X, ChevronRight, ArrowUpRight, ArrowDownLeft, Settings, Copy, Share2, CreditCard, PiggyBank, TrendingUp, Wallet, Plus, Minus, ArrowRightLeft, Percent, Calendar, Clock, DollarSign, PieChart, BarChart3, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Account } from "./AccountsList";
import type { Transaction } from "./TransactionList";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  transactions: Transaction[];
  onTransfer: () => void;
  onTopUp: () => void;
  onCardSettings?: () => void;
  cardHolderName?: string;
}

const formatCurrency = (value: number) => {
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
  cardHolderName = "CARDHOLDER"
}: AccountDetailModalProps) => {
  const [activeSection, setActiveSection] = useState<"main" | "history" | "details">("main");

  if (!isOpen) return null;

  // Filter transactions for this account (simplified - in real app would use account ID)
  const accountTransactions = transactions.slice(0, 10);

  const getAccountIcon = () => {
    switch (account.type) {
      case "card": return CreditCard;
      case "savings": return PiggyBank;
      case "investment": return TrendingUp;
      case "credit": return Wallet;
      default: return CreditCard;
    }
  };

  const handleCopyNumber = () => {
    const number = account.cardNumber || account.id;
    navigator.clipboard.writeText(number);
    toast.success("Номер скопирован");
  };

  const IconComponent = getAccountIcon();

  const renderCardDetails = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
        <div className="flex justify-between items-start mb-8">
          <p className="text-sm opacity-80">Дебетовая карта</p>
          <span className="text-xl font-bold">UnionPay</span>
        </div>
        <p className="text-lg tracking-widest mb-4">•••• •••• •••• {account.cardNumber}</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-80">Владелец</p>
            <p className="font-medium">{cardHolderName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Срок</p>
            <p className="font-medium">12/27</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => { onClose(); onTransfer(); }}
          className="bg-muted rounded-xl p-4 flex flex-col items-center gap-2"
        >
          <ArrowUpRight className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium text-foreground">Перевести</span>
        </button>
        <button 
          onClick={() => { onClose(); onTopUp(); }}
          className="bg-muted rounded-xl p-4 flex flex-col items-center gap-2"
        >
          <Plus className="w-5 h-5 text-success" />
          <span className="text-xs font-medium text-foreground">Пополнить</span>
        </button>
        <button 
          onClick={onCardSettings}
          className="bg-muted rounded-xl p-4 flex flex-col items-center gap-2"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Настройки</span>
        </button>
      </div>

      <div className="bg-card rounded-xl divide-y divide-border">
        <button 
          onClick={handleCopyNumber}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Copy className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">Реквизиты карты</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">Поделиться номером</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );

  const renderSavingsDetails = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm opacity-80">Накопительный счёт</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(account.balance)} ₽</p>
          </div>
          <PiggyBank className="w-8 h-8 opacity-80" />
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 w-fit">
          <Percent className="w-4 h-4" />
          <span className="text-sm font-medium">{account.rate}% годовых</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Открыт</span>
          </div>
          <p className="font-semibold text-foreground">15 марта 2024</p>
        </div>
        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Начислено %</span>
          </div>
          <p className="font-semibold text-success">+{formatCurrency(Math.round(account.balance * (account.rate || 0) / 100 / 12 * 3))} ₽</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => { onClose(); onTopUp(); }}
          className="bg-success text-white rounded-xl p-4 flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Пополнить
        </button>
        <button 
          onClick={() => { onClose(); onTransfer(); }}
          className="bg-muted rounded-xl p-4 flex items-center justify-center gap-2 font-medium text-foreground"
        >
          <Minus className="w-5 h-5" />
          Снять
        </button>
      </div>

      <div className="bg-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Условия</span>
        </div>
        <ul className="space-y-2 text-sm text-foreground">
          <li>• Начисление % — ежедневно</li>
          <li>• Выплата % — ежемесячно</li>
          <li>• Снятие — без ограничений</li>
          <li>• Пополнение — без ограничений</li>
        </ul>
      </div>
    </div>
  );

  const renderInvestmentDetails = () => {
    const totalValue = investmentPortfolio.reduce((sum, stock) => sum + stock.shares * stock.price, 0);
    const totalChange = investmentPortfolio.reduce((sum, stock) => sum + (stock.shares * stock.price * stock.change / 100), 0);
    const changePercent = (totalChange / totalValue) * 100;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-80">Брокерский счёт</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(account.balance)} ₽</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className={`flex items-center gap-2 ${changePercent >= 0 ? 'bg-green-400/30' : 'bg-red-400/30'} rounded-lg px-3 py-2 w-fit`}>
            {changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {changePercent >= 0 ? '+' : ''}{formatCurrency(Math.round(totalChange))} ₽ ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PieChart className="w-4 h-4" />
              <span className="text-xs">Акций</span>
            </div>
            <p className="font-semibold text-foreground">{investmentPortfolio.length} позиций</p>
          </div>
          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Доходность</span>
            </div>
            <p className="font-semibold text-success">+18.5%</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Портфель</h3>
          <div className="space-y-3">
            {investmentPortfolio.map((stock, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{stock.name}</p>
                  <p className="text-sm text-muted-foreground">{stock.ticker} • {stock.shares} шт.</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(stock.shares * stock.price)} ₽</p>
                  <p className={`text-sm ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-center gap-2 font-medium">
            <Plus className="w-5 h-5" />
            Купить
          </button>
          <button className="bg-muted rounded-xl p-4 flex items-center justify-center gap-2 font-medium text-foreground">
            <Minus className="w-5 h-5" />
            Продать
          </button>
        </div>
      </div>
    );
  };

  const renderCreditDetails = () => {
    const creditLimit = 100000;
    const usedCredit = Math.abs(account.balance);
    const availableCredit = creditLimit - usedCredit;
    const usagePercent = (usedCredit / creditLimit) * 100;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-80">Кредитная карта</p>
              <p className="text-lg tracking-widest mt-1">•••• {account.cardNumber}</p>
            </div>
            <span className="text-xl font-bold">UnionPay</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-80">Использовано</span>
              <span className="font-medium">{formatCurrency(usedCredit)} ₽</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Лимит</p>
            <p className="font-semibold text-foreground">{formatCurrency(creditLimit)} ₽</p>
          </div>
          <div className="bg-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Доступно</p>
            <p className="font-semibold text-success">{formatCurrency(availableCredit)} ₽</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Задолженность</span>
            <span className="font-semibold text-destructive">{formatCurrency(usedCredit)} ₽</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">Минимальный платёж</span>
            <span className="font-semibold text-foreground">{formatCurrency(Math.round(usedCredit * 0.05))} ₽</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Дата платежа</span>
            <span className="font-semibold text-foreground">25 декабря</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2">Грейс-период</h4>
          <p className="text-sm text-muted-foreground">До 55 дней без процентов на покупки</p>
          <div className="mt-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Осталось 23 дня</span>
          </div>
        </div>

        <Button 
          onClick={() => { onClose(); onTransfer(); }}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          Погасить задолженность
        </Button>
      </div>
    );
  };

  const renderTransactionHistory = () => (
    <div className="space-y-3">
      {accountTransactions.map((transaction) => {
        const Icon = transaction.icon;
        return (
          <div key={transaction.id} className="bg-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{transaction.name}</p>
              <p className="text-sm text-muted-foreground">{transaction.date}</p>
            </div>
            <p className={`font-semibold ${transaction.isIncoming ? 'text-success' : 'text-foreground'}`}>
              {transaction.isIncoming ? '+' : '-'}{formatCurrency(transaction.amount)} ₽
            </p>
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (activeSection === "history") {
      return renderTransactionHistory();
    }

    switch (account.type) {
      case "card": return renderCardDetails();
      case "savings": return renderSavingsDetails();
      case "investment": return renderInvestmentDetails();
      case "credit": return renderCreditDetails();
      default: return renderCardDetails();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background w-full sm:max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${account.color} flex items-center justify-center`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{account.name}</h2>
              <p className={`text-lg font-semibold ${account.balance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(account.balance)} ₽
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-border">
          <button
            onClick={() => setActiveSection("main")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === "main" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            Главное
          </button>
          <button
            onClick={() => setActiveSection("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === "history" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            История
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountDetailModal;
