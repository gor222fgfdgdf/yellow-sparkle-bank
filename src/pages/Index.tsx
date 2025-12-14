import { useState } from "react";
import { Car, Coffee, Apple, ShoppingBag, Tv, Utensils, Fuel, Music } from "lucide-react";
import BalanceCard from "@/components/banking/BalanceCard";
import QuickActions from "@/components/banking/QuickActions";
import StoriesBanner from "@/components/banking/StoriesBanner";
import TransactionList, { type Transaction } from "@/components/banking/TransactionList";
import TransferModal from "@/components/banking/TransferModal";
import BottomNav from "@/components/banking/BottomNav";
import CardManagement from "@/components/banking/CardManagement";

const initialTransactions: Transaction[] = [
  { id: "1", name: "Uber Rides", category: "Transport", amount: 24.50, date: "Today", icon: Car },
  { id: "2", name: "Starbucks", category: "Food & Drinks", amount: 6.75, date: "Today", icon: Coffee },
  { id: "3", name: "Salary Deposit", category: "Income", amount: 2000, date: "Today", icon: ShoppingBag, isIncoming: true },
  { id: "4", name: "Apple Services", category: "Subscription", amount: 14.99, date: "Yesterday", icon: Apple },
  { id: "5", name: "Whole Foods", category: "Groceries", amount: 87.32, date: "Yesterday", icon: ShoppingBag },
  { id: "6", name: "Netflix", category: "Entertainment", amount: 15.99, date: "Yesterday", icon: Tv },
  { id: "7", name: "McDonald's", category: "Food & Drinks", amount: 12.45, date: "Dec 12", icon: Utensils },
  { id: "8", name: "Shell Gas", category: "Transport", amount: 45.00, date: "Dec 12", icon: Fuel },
  { id: "9", name: "Spotify", category: "Subscription", amount: 9.99, date: "Dec 11", icon: Music },
  { id: "10", name: "Amazon", category: "Shopping", amount: 156.78, date: "Dec 11", icon: ShoppingBag },
  { id: "11", name: "Transfer from John", category: "Transfer", amount: 250, date: "Dec 10", icon: ShoppingBag, isIncoming: true },
  { id: "12", name: "Chipotle", category: "Food & Drinks", amount: 18.50, date: "Dec 10", icon: Utensils },
];

const Index = () => {
  const [balance, setBalance] = useState(15420.50);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState("home");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCardManagement, setShowCardManagement] = useState(false);

  const handleTransfer = (amount: number, recipient: string) => {
    setBalance((prev) => prev - amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: `Transfer to ${recipient}`,
      category: "Transfer",
      amount: amount,
      date: "Today",
      icon: ShoppingBag,
      isIncoming: false,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
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
        {/* Stories Banner */}
        <StoriesBanner />

        {/* Balance Card */}
        <BalanceCard balance={balance} onCardSettings={() => setShowCardManagement(true)} />

        {/* Quick Actions */}
        <QuickActions 
          onTransferClick={() => setIsTransferOpen(true)} 
          onHistoryClick={() => setShowHistory(!showHistory)}
        />

        {/* Transaction History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-foreground">Recent Transactions</h2>
            <button className="text-sm font-medium text-primary hover:underline">
              See All
            </button>
          </div>
          <TransactionList transactions={transactions} />
        </div>
      </main>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        balance={balance}
        onTransfer={handleTransfer}
      />

      {/* Card Management */}
      {showCardManagement && (
        <CardManagement onClose={() => setShowCardManagement(false)} />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
