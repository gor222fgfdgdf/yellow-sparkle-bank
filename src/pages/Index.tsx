import { useState } from "react";
import { Car, Coffee, Apple, ShoppingBag, Tv, Utensils, Fuel, Music, ArrowUpRight } from "lucide-react";
import BalanceCard from "@/components/banking/BalanceCard";
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

const initialTransactions: Transaction[] = [
  { id: "1", name: "Uber Rides", category: "Transport", amount: 24.50, date: "Today", icon: Car },
  { id: "2", name: "Starbucks", category: "Food & Drinks", amount: 6.75, date: "Today", icon: Coffee },
  { id: "3", name: "Salary Deposit", category: "Income", amount: 2000, date: "Today", icon: ArrowUpRight, isIncoming: true },
  { id: "4", name: "Apple Services", category: "Subscription", amount: 14.99, date: "Yesterday", icon: Apple },
  { id: "5", name: "Whole Foods", category: "Groceries", amount: 87.32, date: "Yesterday", icon: ShoppingBag },
  { id: "6", name: "Netflix", category: "Entertainment", amount: 15.99, date: "Yesterday", icon: Tv },
  { id: "7", name: "McDonald's", category: "Food & Drinks", amount: 12.45, date: "Dec 12", icon: Utensils },
  { id: "8", name: "Shell Gas", category: "Transport", amount: 45.00, date: "Dec 12", icon: Fuel },
  { id: "9", name: "Spotify", category: "Subscription", amount: 9.99, date: "Dec 11", icon: Music },
  { id: "10", name: "Amazon", category: "Shopping", amount: 156.78, date: "Dec 11", icon: ShoppingBag },
  { id: "11", name: "Transfer from John", category: "Transfer", amount: 250, date: "Dec 10", icon: ArrowUpRight, isIncoming: true },
  { id: "12", name: "Chipotle", category: "Food & Drinks", amount: 18.50, date: "Dec 10", icon: Utensils },
];

const Index = () => {
  const [balance, setBalance] = useState(15420.50);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState("home");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
  const [showCardManagement, setShowCardManagement] = useState(false);

  const handleTransfer = (amount: number, recipient: string) => {
    setBalance((prev) => prev - amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Transfer to ${recipient}`,
      category: "Transfer",
      amount: amount,
      date: "Today",
      icon: ArrowUpRight,
      isIncoming: false,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleTopUp = (amount: number, method: string) => {
    setBalance((prev) => prev + amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Top Up via ${method}`,
      category: "Top Up",
      amount: amount,
      date: "Today",
      icon: ArrowUpRight,
      isIncoming: true,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };
  const handlePayment = (amount: number, provider: string) => {
    setBalance((prev) => prev - amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Payment to ${provider}`,
      category: "Payment",
      amount: amount,
      date: "Today",
      icon: ArrowUpRight,
      isIncoming: false,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
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

            {/* Balance Card */}
            <BalanceCard balance={balance} onCardSettings={() => setShowCardManagement(true)} />

            {/* Quick Actions */}
            <QuickActions 
              onTopUpClick={() => setIsTopUpOpen(true)}
              onTransferClick={() => setIsTransferOpen(true)} 
              onHistoryClick={() => setIsAllTransactionsOpen(true)}
              onMoreClick={() => setIsMoreOpen(true)}
            />

            {/* Transaction History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-foreground">Recent Transactions</h2>
                <button 
                  onClick={() => setIsAllTransactionsOpen(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See All
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
            <p className="text-sm text-muted-foreground">Good morning</p>
            <h1 className="text-xl font-bold text-foreground">Alex Johnson</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">AJ</span>
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
        balance={balance}
        onTransfer={handleTransfer}
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
