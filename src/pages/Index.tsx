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
import AccountDetailModal from "@/components/banking/AccountDetailModal";

const initialAccounts: Account[] = [
  { id: "1", type: "card", name: "Tinkoff Black", balance: 3670797, cardNumber: "7823", icon: CreditCard, color: "bg-primary text-primary-foreground" },
  { id: "2", type: "savings", name: "Накопительный счёт", balance: 850000, rate: 16, icon: PiggyBank, color: "bg-green-500 text-white" },
  { id: "3", type: "investment", name: "Инвестиции", balance: 1250000, icon: TrendingUp, color: "bg-blue-500 text-white" },
  { id: "4", type: "credit", name: "Кредитная карта", balance: -45000, cardNumber: "4521", icon: Wallet, color: "bg-purple-500 text-white" },
];

const initialTransactions: Transaction[] = [
  // Декабрь
  { id: "1", name: "Яндекс Такси", category: "Транспорт", amount: 890, date: "Сегодня", icon: Car },
  { id: "2", name: "Кофе Хауз", category: "Кафе", amount: 450, date: "Сегодня", icon: Coffee },
  { id: "3", name: "Пятёрочка", category: "Продукты", amount: 1250, date: "Сегодня", icon: ShoppingBag },
  { id: "4", name: "Burger King", category: "Кафе", amount: 520, date: "Вчера", icon: Utensils },
  { id: "5", name: "Магнит", category: "Продукты", amount: 890, date: "Вчера", icon: ShoppingBag },
  { id: "6", name: "Яндекс Такси", category: "Транспорт", amount: 340, date: "Вчера", icon: Car },
  { id: "7", name: "Зарплата", category: "Доход", amount: 500000, date: "10 дек", icon: Briefcase, isIncoming: true },
  { id: "8", name: "Starbucks", category: "Кафе", amount: 590, date: "12 дек", icon: Coffee },
  { id: "9", name: "ВкусВилл", category: "Продукты", amount: 1670, date: "12 дек", icon: ShoppingBag },
  { id: "10", name: "Okko подписка", category: "Развлечения", amount: 399, date: "11 дек", icon: Tv },
  { id: "11", name: "Перекрёсток", category: "Продукты", amount: 2340, date: "11 дек", icon: ShoppingBag },
  { id: "12", name: "Яндекс Такси", category: "Транспорт", amount: 560, date: "11 дек", icon: Car },
  { id: "13", name: "Шоколадница", category: "Кафе", amount: 380, date: "10 дек", icon: Coffee },
  { id: "14", name: "Пятёрочка", category: "Продукты", amount: 1120, date: "10 дек", icon: ShoppingBag },
  { id: "15", name: "McDonald's", category: "Кафе", amount: 670, date: "9 дек", icon: Utensils },
  { id: "16", name: "Лента", category: "Продукты", amount: 3450, date: "9 дек", icon: ShoppingBag },
  { id: "17", name: "Ситимобил", category: "Транспорт", amount: 420, date: "9 дек", icon: Car },
  { id: "18", name: "Кофемания", category: "Кафе", amount: 720, date: "8 дек", icon: Coffee },
  { id: "19", name: "Магнит", category: "Продукты", amount: 980, date: "8 дек", icon: ShoppingBag },
  { id: "20", name: "Лукойл АЗС", category: "Транспорт", amount: 3500, date: "7 дек", icon: Fuel },
  { id: "21", name: "KFC", category: "Кафе", amount: 450, date: "7 дек", icon: Utensils },
  { id: "22", name: "Азбука Вкуса", category: "Продукты", amount: 2890, date: "7 дек", icon: ShoppingBag },
  { id: "23", name: "Яндекс Такси", category: "Транспорт", amount: 780, date: "6 дек", icon: Car },
  { id: "24", name: "Coffeeshop", category: "Кафе", amount: 320, date: "6 дек", icon: Coffee },
  { id: "25", name: "Перекрёсток", category: "Продукты", amount: 1560, date: "6 дек", icon: ShoppingBag },
  { id: "26", name: "Яндекс Музыка", category: "Подписки", amount: 299, date: "5 дек", icon: Music },
  { id: "27", name: "Subway", category: "Кафе", amount: 490, date: "5 дек", icon: Utensils },
  { id: "28", name: "ВкусВилл", category: "Продукты", amount: 1340, date: "5 дек", icon: ShoppingBag },
  { id: "29", name: "Wildberries", category: "Покупки", amount: 5670, date: "4 дек", icon: ShoppingBag },
  { id: "30", name: "Додо Пицца", category: "Кафе", amount: 890, date: "4 дек", icon: Utensils },
  { id: "31", name: "Пятёрочка", category: "Продукты", amount: 760, date: "4 дек", icon: ShoppingBag },
  { id: "32", name: "Яндекс Такси", category: "Транспорт", amount: 510, date: "3 дек", icon: Car },
  { id: "33", name: "Starbucks", category: "Кафе", amount: 650, date: "3 дек", icon: Coffee },
  { id: "34", name: "Магнит", category: "Продукты", amount: 1890, date: "3 дек", icon: ShoppingBag },
  { id: "35", name: "Теремок", category: "Кафе", amount: 380, date: "2 дек", icon: Utensils },
  { id: "36", name: "Лента", category: "Продукты", amount: 2670, date: "2 дек", icon: ShoppingBag },
  { id: "37", name: "МТС связь", category: "Связь", amount: 650, date: "1 дек", icon: Smartphone },
  { id: "38", name: "Кофе Хауз", category: "Кафе", amount: 410, date: "1 дек", icon: Coffee },
  { id: "39", name: "Перекрёсток", category: "Продукты", amount: 1450, date: "1 дек", icon: ShoppingBag },
  // Ноябрь
  { id: "40", name: "Аренда квартиры", category: "Жильё", amount: 45000, date: "28 ноя", icon: Home },
  { id: "41", name: "Burger King", category: "Кафе", amount: 540, date: "28 ноя", icon: Utensils },
  { id: "42", name: "ВкусВилл", category: "Продукты", amount: 1230, date: "28 ноя", icon: ShoppingBag },
  { id: "43", name: "Яндекс Такси", category: "Транспорт", amount: 670, date: "27 ноя", icon: Car },
  { id: "44", name: "Шоколадница", category: "Кафе", amount: 350, date: "27 ноя", icon: Coffee },
  { id: "45", name: "Пятёрочка", category: "Продукты", amount: 980, date: "27 ноя", icon: ShoppingBag },
  { id: "46", name: "Электричество", category: "ЖКХ", amount: 2340, date: "25 ноя", icon: Zap },
  { id: "47", name: "McDonald's", category: "Кафе", amount: 590, date: "25 ноя", icon: Utensils },
  { id: "48", name: "Магнит", category: "Продукты", amount: 1560, date: "25 ноя", icon: ShoppingBag },
  { id: "49", name: "Coffeeshop", category: "Кафе", amount: 280, date: "24 ноя", icon: Coffee },
  { id: "50", name: "Азбука Вкуса", category: "Продукты", amount: 2100, date: "24 ноя", icon: ShoppingBag },
  { id: "51", name: "Ситимобил", category: "Транспорт", amount: 390, date: "23 ноя", icon: Car },
  { id: "52", name: "KFC", category: "Кафе", amount: 480, date: "23 ноя", icon: Utensils },
  { id: "53", name: "Перекрёсток", category: "Продукты", amount: 1780, date: "23 ноя", icon: ShoppingBag },
  { id: "54", name: "Steam игры", category: "Развлечения", amount: 1999, date: "20 ноя", icon: Gamepad2 },
  { id: "55", name: "Starbucks", category: "Кафе", amount: 620, date: "20 ноя", icon: Coffee },
  { id: "56", name: "ВкусВилл", category: "Продукты", amount: 1340, date: "20 ноя", icon: ShoppingBag },
  { id: "57", name: "Яндекс Такси", category: "Транспорт", amount: 890, date: "19 ноя", icon: Car },
  { id: "58", name: "Теремок", category: "Кафе", amount: 420, date: "19 ноя", icon: Utensils },
  { id: "59", name: "Пятёрочка", category: "Продукты", amount: 1120, date: "19 ноя", icon: ShoppingBag },
  { id: "60", name: "Аптека Горздрав", category: "Здоровье", amount: 1450, date: "12 ноя", icon: Heart },
  { id: "61", name: "Кофемания", category: "Кафе", amount: 780, date: "12 ноя", icon: Coffee },
  { id: "62", name: "Магнит", category: "Продукты", amount: 1670, date: "12 ноя", icon: ShoppingBag },
  { id: "63", name: "World Class", category: "Спорт", amount: 4500, date: "10 ноя", icon: Dumbbell },
  { id: "64", name: "Зарплата", category: "Доход", amount: 500000, date: "10 ноя", icon: Briefcase, isIncoming: true },
  { id: "65", name: "Додо Пицца", category: "Кафе", amount: 950, date: "10 ноя", icon: Utensils },
  { id: "66", name: "Лента", category: "Продукты", amount: 3120, date: "10 ноя", icon: ShoppingBag },
  { id: "67", name: "Водоснабжение", category: "ЖКХ", amount: 890, date: "5 ноя", icon: Droplets },
  { id: "68", name: "Subway", category: "Кафе", amount: 470, date: "5 ноя", icon: Utensils },
  { id: "69", name: "Перекрёсток", category: "Продукты", amount: 1890, date: "5 ноя", icon: ShoppingBag },
  { id: "70", name: "Ozon", category: "Покупки", amount: 3450, date: "3 ноя", icon: ShoppingBag },
  { id: "71", name: "Кофе Хауз", category: "Кафе", amount: 390, date: "3 ноя", icon: Coffee },
  { id: "72", name: "ВкусВилл", category: "Продукты", amount: 1560, date: "3 ноя", icon: ShoppingBag },
  // Октябрь
  { id: "73", name: "Аренда квартиры", category: "Жильё", amount: 45000, date: "28 окт", icon: Home },
  { id: "74", name: "Burger King", category: "Кафе", amount: 610, date: "28 окт", icon: Utensils },
  { id: "75", name: "Пятёрочка", category: "Продукты", amount: 1340, date: "28 окт", icon: ShoppingBag },
  { id: "76", name: "Яндекс Такси", category: "Транспорт", amount: 720, date: "27 окт", icon: Car },
  { id: "77", name: "Starbucks", category: "Кафе", amount: 580, date: "27 окт", icon: Coffee },
  { id: "78", name: "Магнит", category: "Продукты", amount: 2010, date: "27 окт", icon: ShoppingBag },
  { id: "79", name: "Skillbox курсы", category: "Образование", amount: 15000, date: "20 окт", icon: GraduationCap },
  { id: "80", name: "Шоколадница", category: "Кафе", amount: 340, date: "20 окт", icon: Coffee },
  { id: "81", name: "Азбука Вкуса", category: "Продукты", amount: 2560, date: "20 окт", icon: ShoppingBag },
  { id: "82", name: "Ситимобил", category: "Транспорт", amount: 450, date: "19 окт", icon: Car },
  { id: "83", name: "KFC", category: "Кафе", amount: 520, date: "19 окт", icon: Utensils },
  { id: "84", name: "Перекрёсток", category: "Продукты", amount: 1890, date: "19 окт", icon: ShoppingBag },
  { id: "85", name: "DNS электроника", category: "Покупки", amount: 12500, date: "15 окт", icon: ShoppingBag },
  { id: "86", name: "Coffeeshop", category: "Кафе", amount: 310, date: "15 окт", icon: Coffee },
  { id: "87", name: "ВкусВилл", category: "Продукты", amount: 1450, date: "15 окт", icon: ShoppingBag },
  { id: "88", name: "Яндекс Такси", category: "Транспорт", amount: 640, date: "14 окт", icon: Car },
  { id: "89", name: "Теремок", category: "Кафе", amount: 390, date: "14 окт", icon: Utensils },
  { id: "90", name: "Пятёрочка", category: "Продукты", amount: 1120, date: "14 окт", icon: ShoppingBag },
  { id: "91", name: "Зарплата", category: "Доход", amount: 500000, date: "10 окт", icon: Briefcase, isIncoming: true },
  { id: "92", name: "Додо Пицца", category: "Кафе", amount: 870, date: "10 окт", icon: Utensils },
  { id: "93", name: "Лента", category: "Продукты", amount: 2890, date: "10 окт", icon: ShoppingBag },
  { id: "94", name: "Перевод от Ивана", category: "Переводы", amount: 15000, date: "8 окт", icon: ArrowUpRight, isIncoming: true },
  { id: "95", name: "Кофемания", category: "Кафе", amount: 690, date: "8 окт", icon: Coffee },
  { id: "96", name: "Магнит", category: "Продукты", amount: 1780, date: "8 окт", icon: ShoppingBag },
  { id: "97", name: "Интернет Ростелеком", category: "Связь", amount: 750, date: "5 окт", icon: Smartphone },
  { id: "98", name: "McDonald's", category: "Кафе", amount: 560, date: "5 окт", icon: Utensils },
  { id: "99", name: "Перекрёсток", category: "Продукты", amount: 2340, date: "5 окт", icon: ShoppingBag },
  { id: "100", name: "Электричество", category: "ЖКХ", amount: 2100, date: "2 окт", icon: Zap },
  { id: "101", name: "Starbucks", category: "Кафе", amount: 610, date: "2 окт", icon: Coffee },
  { id: "102", name: "ВкусВилл", category: "Продукты", amount: 1560, date: "2 окт", icon: ShoppingBag },
  // Сентябрь
  { id: "103", name: "Аренда квартиры", category: "Жильё", amount: 45000, date: "28 сен", icon: Home },
  { id: "104", name: "Subway", category: "Кафе", amount: 440, date: "28 сен", icon: Utensils },
  { id: "105", name: "Пятёрочка", category: "Продукты", amount: 1230, date: "28 сен", icon: ShoppingBag },
  { id: "106", name: "Яндекс Такси", category: "Транспорт", amount: 780, date: "25 сен", icon: Car },
  { id: "107", name: "Кофе Хауз", category: "Кафе", amount: 360, date: "25 сен", icon: Coffee },
  { id: "108", name: "Лента", category: "Продукты", amount: 3450, date: "25 сен", icon: ShoppingBag },
  { id: "109", name: "Ситимобил", category: "Транспорт", amount: 490, date: "22 сен", icon: Car },
  { id: "110", name: "Шоколадница", category: "Кафе", amount: 320, date: "22 сен", icon: Coffee },
  { id: "111", name: "Азбука Вкуса", category: "Продукты", amount: 2780, date: "22 сен", icon: ShoppingBag },
  { id: "112", name: "Зарплата", category: "Доход", amount: 500000, date: "10 сен", icon: Briefcase, isIncoming: true },
  { id: "113", name: "Burger King", category: "Кафе", amount: 590, date: "10 сен", icon: Utensils },
  { id: "114", name: "Магнит", category: "Продукты", amount: 1890, date: "10 сен", icon: ShoppingBag },
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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

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
    setSelectedAccount(account);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "payments":
        return <PaymentsPage onPayment={handlePayment} transactions={transactions} />;
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
              onHistoryClick={() => setActiveTab("payments")}
              onMoreClick={() => setIsMoreOpen(true)}
            />
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

      {selectedAccount && (
        <AccountDetailModal
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          account={selectedAccount}
          transactions={transactions}
          onTransfer={() => setIsInternalTransferOpen(true)}
          onTopUp={() => setIsTopUpOpen(true)}
          onCardSettings={() => {
            setSelectedAccount(null);
            setShowCardManagement(true);
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
