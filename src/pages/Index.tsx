import { useState } from "react";
import { Car, Coffee, ShoppingBag, Tv, Utensils, Fuel, Music, ArrowUpRight, Home, Smartphone, Zap, Droplets, Briefcase, Heart, Gamepad2, GraduationCap, Dumbbell, CreditCard, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import AccountsList, { type Account } from "@/components/banking/AccountsList";
import QuickActions from "@/components/banking/QuickActions";
import StoriesBanner from "@/components/banking/StoriesBanner";
import TransactionList, { type Transaction } from "@/components/banking/TransactionList";
import TransferModal from "@/components/banking/TransferModal";
import BottomNav from "@/components/banking/BottomNav";
import CardManagement from "@/components/banking/CardManagement";
import TopUpModal from "@/components/banking/TopUpModal";
import MoreActionsSheet from "@/components/banking/MoreActionsSheet";
import AllTransactionsModal from "@/components/banking/AllTransactionsModal";
import PaymentsPage from "@/components/banking/PaymentsPage";
import SupportPage from "@/components/banking/SupportPage";
import MenuPage from "@/components/banking/MenuPage";
import InternalTransferModal from "@/components/banking/InternalTransferModal";

const initialAccounts: Account[] = [
  { id: "1", type: "card", name: "Tinkoff Black", balance: 3670797, cardNumber: "7823", icon: CreditCard, color: "bg-primary text-primary-foreground" },
  { id: "2", type: "savings", name: "Накопительный счёт", balance: 850000, rate: 16, icon: PiggyBank, color: "bg-green-500 text-white" },
  { id: "3", type: "investment", name: "Инвестиции", balance: 1250000, icon: TrendingUp, color: "bg-blue-500 text-white" },
  { id: "4", type: "credit", name: "Кредитная карта", balance: -45000, cardNumber: "4521", icon: Wallet, color: "bg-purple-500 text-white" },
];

const initialTransactions: Transaction[] = [
  { id: "1", name: "Яндекс Такси", category: "Транспорт", amount: 890, date: "Сегодня", icon: Car },
  { id: "2", name: "Кофе Хауз", category: "Кафе", amount: 450, date: "Сегодня", icon: Coffee },
  { id: "3", name: "Зарплата", category: "Доход", amount: 500000, date: "10 дек", icon: Briefcase, isIncoming: true },
  { id: "4", name: "Пятёрочка", category: "Продукты", amount: 3250, date: "Вчера", icon: ShoppingBag },
  { id: "5", name: "Okko подписка", category: "Развлечения", amount: 399, date: "Вчера", icon: Tv },
  { id: "6", name: "Burger King", category: "Кафе", amount: 670, date: "8 дек", icon: Utensils },
  { id: "7", name: "Лукойл АЗС", category: "Транспорт", amount: 3500, date: "7 дек", icon: Fuel },
  { id: "8", name: "Яндекс Музыка", category: "Подписки", amount: 299, date: "5 дек", icon: Music },
  { id: "9", name: "Wildberries", category: "Покупки", amount: 5670, date: "4 дек", icon: ShoppingBag },
  { id: "10", name: "Перекрёсток", category: "Продукты", amount: 4120, date: "3 дек", icon: ShoppingBag },
  { id: "11", name: "МТС связь", category: "Связь", amount: 650, date: "1 дек", icon: Smartphone },
  { id: "12", name: "Аренда квартиры", category: "Жильё", amount: 45000, date: "28 ноя", icon: Home },
  { id: "13", name: "Электричество", category: "ЖКХ", amount: 2340, date: "25 ноя", icon: Zap },
  { id: "14", name: "Зарплата", category: "Доход", amount: 500000, date: "10 ноя", icon: Briefcase, isIncoming: true },
  { id: "15", name: "ВкусВилл", category: "Продукты", amount: 2890, date: "22 ноя", icon: ShoppingBag },
  { id: "16", name: "Steam игры", category: "Развлечения", amount: 1999, date: "20 ноя", icon: Gamepad2 },
  { id: "17", name: "Яндекс Такси", category: "Транспорт", amount: 1250, date: "18 ноя", icon: Car },
  { id: "18", name: "Магнит", category: "Продукты", amount: 1870, date: "15 ноя", icon: ShoppingBag },
  { id: "19", name: "Аптека Горздрав", category: "Здоровье", amount: 1450, date: "12 ноя", icon: Heart },
  { id: "20", name: "World Class", category: "Спорт", amount: 4500, date: "10 ноя", icon: Dumbbell },
  { id: "21", name: "Водоснабжение", category: "ЖКХ", amount: 890, date: "5 ноя", icon: Droplets },
  { id: "22", name: "Ozon", category: "Покупки", amount: 3450, date: "3 ноя", icon: ShoppingBag },
  { id: "23", name: "Аренда квартиры", category: "Жильё", amount: 45000, date: "28 окт", icon: Home },
  { id: "24", name: "Зарплата", category: "Доход", amount: 500000, date: "10 окт", icon: Briefcase, isIncoming: true },
  { id: "25", name: "Лента", category: "Продукты", amount: 6780, date: "25 окт", icon: ShoppingBag },
  { id: "26", name: "Skillbox курсы", category: "Образование", amount: 15000, date: "20 окт", icon: GraduationCap },
  { id: "27", name: "Ситимобил", category: "Транспорт", amount: 780, date: "18 окт", icon: Car },
  { id: "28", name: "DNS электроника", category: "Покупки", amount: 12500, date: "15 окт", icon: ShoppingBag },
  { id: "29", name: "KFC", category: "Кафе", amount: 890, date: "12 окт", icon: Utensils },
  { id: "30", name: "Перевод от Ивана", category: "Переводы", amount: 15000, date: "8 окт", icon: ArrowUpRight, isIncoming: true },
  { id: "31", name: "Интернет Ростелеком", category: "Связь", amount: 750, date: "5 окт", icon: Smartphone },
  { id: "32", name: "Электричество", category: "ЖКХ", amount: 2100, date: "2 окт", icon: Zap },
  { id: "33", name: "Аренда квартиры", category: "Жильё", amount: 45000, date: "28 сен", icon: Home },
  { id: "34", name: "Зарплата", category: "Доход", amount: 500000, date: "10 сен", icon: Briefcase, isIncoming: true },
  { id: "35", name: "Яндекс Такси", category: "Транспорт", amount: 1100, date: "22 сен", icon: Car },
  { id: "36", name: "Ашан", category: "Продукты", amount: 8900, date: "18 сен", icon: ShoppingBag },
];

const Index = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState("home");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isInternalTransferOpen, setIsInternalTransferOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
  const [showCardManagement, setShowCardManagement] = useState(false);

  const mainAccountBalance = accounts.find(a => a.id === "1")?.balance || 0;

  const handleTransfer = (amount: number, recipient: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === "1" ? { ...acc, balance: acc.balance - amount } : acc
    ));
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Перевод: ${recipient}`,
      category: "Переводы",
      amount: amount,
      date: "Сегодня",
      icon: ArrowUpRight,
      isIncoming: false,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleInternalTransfer = (fromId: string, toId: string, amount: number) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
      if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
      return acc;
    }));
    
    const fromAccount = accounts.find(a => a.id === fromId);
    const toAccount = accounts.find(a => a.id === toId);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `${fromAccount?.name} → ${toAccount?.name}`,
      category: "Перевод между счетами",
      amount: amount,
      date: "Сегодня",
      icon: ArrowUpRight,
      isIncoming: false,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleTopUp = (amount: number, method: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === "1" ? { ...acc, balance: acc.balance + amount } : acc
    ));
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Пополнение: ${method}`,
      category: "Пополнение",
      amount: amount,
      date: "Сегодня",
      icon: ArrowUpRight,
      isIncoming: true,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handlePayment = (amount: number, provider: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === "1" ? { ...acc, balance: acc.balance - amount } : acc
    ));
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Оплата: ${provider}`,
      category: "Платежи",
      amount: amount,
      date: "Сегодня",
      icon: ArrowUpRight,
      isIncoming: false,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleAccountClick = (account: Account) => {
    if (account.type === "card") {
      setShowCardManagement(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "payments":
        return <PaymentsPage onPayment={handlePayment} />;
      case "support":
        return <SupportPage />;
      case "menu":
        return <MenuPage onOpenCardManagement={() => setShowCardManagement(true)} />;
      default:
        return (
          <>
            {/* Stories Banner */}
            <StoriesBanner />

            {/* Accounts List */}
            <AccountsList 
              accounts={accounts} 
              onAccountClick={handleAccountClick}
              onCardSettings={() => setShowCardManagement(true)}
            />

            {/* Quick Actions */}
            <QuickActions 
              onTopUpClick={() => setIsTopUpOpen(true)}
              onTransferClick={() => setIsInternalTransferOpen(true)} 
              onHistoryClick={() => setIsAllTransactionsOpen(true)}
              onMoreClick={() => setIsMoreOpen(true)}
            />

            {/* Transaction History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-foreground">Последние операции</h2>
                <button 
                  onClick={() => setIsAllTransactionsOpen(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Все
                </button>
              </div>
              <TransactionList transactions={transactions.slice(0, 5)} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Добрый день</p>
            <h1 className="text-xl font-bold text-foreground">Александр Петров</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">АП</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {renderTabContent()}
      </main>

      {/* Modals */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        balance={mainAccountBalance}
        onTransfer={handleTransfer}
      />

      <InternalTransferModal
        isOpen={isInternalTransferOpen}
        onClose={() => setIsInternalTransferOpen(false)}
        accounts={accounts}
        onTransfer={handleInternalTransfer}
      />

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onTopUp={handleTopUp}
      />

      <MoreActionsSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
      />

      <AllTransactionsModal
        isOpen={isAllTransactionsOpen}
        onClose={() => setIsAllTransactionsOpen(false)}
        transactions={transactions}
      />

      {showCardManagement && (
        <CardManagement onClose={() => setShowCardManagement(false)} />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
