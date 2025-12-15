import { useState } from "react";
import { Car, Coffee, ShoppingBag, Tv, Utensils, Fuel, Music, ArrowUpRight, Home, Smartphone, Zap, Droplets, Briefcase, Heart, Gamepad2, GraduationCap, Dumbbell, CreditCard, PiggyBank, TrendingUp, Wallet, Target, QrCode, Send, Bell, Diamond, DollarSign, CalendarCheck, FileText, Percent, Shield, Users, Scan, Globe, Coffee as TipsIcon } from "lucide-react";
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
import BudgetsModal from "@/components/banking/BudgetsModal";
import SavingsGoalsModal from "@/components/banking/SavingsGoalsModal";
import QRCodeModal from "@/components/banking/QRCodeModal";
import SBPTransferModal from "@/components/banking/SBPTransferModal";
import NotificationsCenter from "@/components/banking/NotificationsCenter";
import CashbackModal from "@/components/banking/CashbackModal";
import CurrencyExchangeModal from "@/components/banking/CurrencyExchangeModal";
import SubscriptionsModal from "@/components/banking/SubscriptionsModal";
import PinLockScreen from "@/components/banking/PinLockScreen";
import StatementExportModal from "@/components/banking/StatementExportModal";
import ThemeToggle from "@/components/banking/ThemeToggle";
import LoansModal from "@/components/banking/LoansModal";
import InsuranceModal from "@/components/banking/InsuranceModal";
import InvestmentPortfolioModal from "@/components/banking/InvestmentPortfolioModal";
import ReferralProgramModal from "@/components/banking/ReferralProgramModal";
import BarcodeScannerModal from "@/components/banking/BarcodeScannerModal";
import MultiCurrencyModal from "@/components/banking/MultiCurrencyModal";
import TipsModal from "@/components/banking/TipsModal";
import FamilyAccessModal from "@/components/banking/FamilyAccessModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts, useUpdateAccountBalance } from "@/hooks/useAccounts";
import { useTransactions, useCreateTransaction } from "@/hooks/useTransactions";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  Car, Coffee, ShoppingBag, Tv, Utensils, Fuel, Music, ArrowUpRight, Home, 
  Smartphone, Zap, Droplets, Briefcase, Heart, Gamepad2, GraduationCap, 
  Dumbbell, CreditCard, PiggyBank, TrendingUp, Wallet, Target
};

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: dbAccounts, isLoading: accountsLoading } = useAccounts();
  const { data: dbTransactions, isLoading: transactionsLoading } = useTransactions();
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications();
  const updateBalance = useUpdateAccountBalance();
  const createTransaction = useCreateTransaction();

  const [activeTab, setActiveTab] = useState("home");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isInternalTransferOpen, setIsInternalTransferOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
  const [showCardManagement, setShowCardManagement] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  const [isBudgetsOpen, setIsBudgetsOpen] = useState(false);
  const [isSavingsGoalsOpen, setIsSavingsGoalsOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isSBPTransferOpen, setIsSBPTransferOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCashbackOpen, setIsCashbackOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem("banking_pin"));
  const [isSettingUpPin, setIsSettingUpPin] = useState(false);
  
  const [isStatementExportOpen, setIsStatementExportOpen] = useState(false);
  const [isLoansOpen, setIsLoansOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const [isInvestmentPortfolioOpen, setIsInvestmentPortfolioOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isMultiCurrencyOpen, setIsMultiCurrencyOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isFamilyAccessOpen, setIsFamilyAccessOpen] = useState(false);

  // Transform DB accounts to UI format
  const accounts: Account[] = (dbAccounts || []).map(acc => ({
    id: acc.id,
    type: acc.type as "card" | "savings" | "investment" | "credit",
    name: acc.name,
    balance: Number(acc.balance),
    cardNumber: acc.card_number || undefined,
    rate: acc.rate ? Number(acc.rate) : undefined,
    icon: acc.type === "card" ? CreditCard : acc.type === "savings" ? PiggyBank : acc.type === "investment" ? TrendingUp : Wallet,
    color: acc.color,
  }));

  // Transform DB transactions to UI format
  const transactions: Transaction[] = (dbTransactions || []).map(tx => {
    const txDate = new Date(tx.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateStr = txDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    if (txDate.toDateString() === today.toDateString()) dateStr = "Сегодня";
    else if (txDate.toDateString() === yesterday.toDateString()) dateStr = "Вчера";

    return {
      id: tx.id,
      name: tx.name,
      category: tx.category,
      amount: Math.abs(Number(tx.amount)),
      date: dateStr,
      icon: iconMap[tx.icon] || CreditCard,
      isIncoming: tx.is_income,
    };
  });

  const mainAccount = accounts.find(a => a.type === "card");
  const mainAccountBalance = mainAccount?.balance || 0;
  const investmentAccount = accounts.find(a => a.type === "investment");

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const userName = profile?.full_name || "Пользователь";
  const cardHolderName = profile?.full_name?.toUpperCase() || "CARDHOLDER";
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleTransfer = async (amount: number, recipient: string) => {
    if (!mainAccount) return;
    await updateBalance.mutateAsync({ accountId: mainAccount.id, newBalance: mainAccountBalance - amount });
    await createTransaction.mutateAsync({
      account_id: mainAccount.id,
      name: `Перевод: ${recipient}`,
      category: "Переводы",
      amount: -amount,
      is_income: false,
      icon: "ArrowUpRight",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleInternalTransfer = async (fromId: string, toId: string, amount: number) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);
    if (!fromAcc || !toAcc) return;
    
    await updateBalance.mutateAsync({ accountId: fromId, newBalance: fromAcc.balance - amount });
    await updateBalance.mutateAsync({ accountId: toId, newBalance: toAcc.balance + amount });
    await createTransaction.mutateAsync({
      account_id: fromId,
      name: `${fromAcc.name} → ${toAcc.name}`,
      category: "Перевод между счетами",
      amount: -amount,
      is_income: false,
      icon: "ArrowUpRight",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleTopUp = async (amount: number, method: string) => {
    if (!mainAccount) return;
    await updateBalance.mutateAsync({ accountId: mainAccount.id, newBalance: mainAccountBalance + amount });
    await createTransaction.mutateAsync({
      account_id: mainAccount.id,
      name: `Пополнение: ${method}`,
      category: "Пополнение",
      amount: amount,
      is_income: true,
      icon: "ArrowUpRight",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handlePayment = async (amount: number, provider: string) => {
    if (!mainAccount) return;
    await updateBalance.mutateAsync({ accountId: mainAccount.id, newBalance: mainAccountBalance - amount });
    await createTransaction.mutateAsync({
      account_id: mainAccount.id,
      name: `Оплата: ${provider}`,
      category: "Платежи",
      amount: -amount,
      is_income: false,
      icon: "CreditCard",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleAccountClick = (account: Account) => setSelectedAccount(account);
  const handleSBPTransfer = (amount: number, recipient: string) => handleTransfer(amount, `СБП: ${recipient}`);
  const handleQRReceive = (amount: number, sender: string) => handleTopUp(amount, `QR от ${sender}`);
  const handleCashbackWithdraw = (amount: number) => handleTopUp(amount, "Кэшбэк");
  const handleSavingsDeduct = async (amount: number) => {
    if (!mainAccount) return;
    await updateBalance.mutateAsync({ accountId: mainAccount.id, newBalance: mainAccountBalance - amount });
  };
  const handleCurrencyExchange = () => {};

  if (isLocked) return <PinLockScreen onUnlock={() => setIsLocked(false)} />;
  if (isSettingUpPin) return <PinLockScreen isSettingUp onUnlock={() => {}} onSetupComplete={() => setIsSettingUpPin(false)} />;

  const isLoading = accountsLoading || transactionsLoading;

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      );
    }

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
            <StoriesBanner />
            <AccountsList accounts={accounts} onAccountClick={handleAccountClick} onCardSettings={() => setShowCardManagement(true)} />
            <QuickActions onTopUpClick={() => setIsTopUpOpen(true)} onTransferClick={() => setIsInternalTransferOpen(true)} onHistoryClick={() => setActiveTab("payments")} onMoreClick={() => setIsMoreOpen(true)} />

            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setIsSBPTransferOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center"><Send className="w-5 h-5 text-blue-600" /></div>
                <span className="text-xs font-medium text-foreground">СБП</span>
              </button>
              <button onClick={() => setIsQRCodeOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center"><QrCode className="w-5 h-5 text-purple-600" /></div>
                <span className="text-xs font-medium text-foreground">QR-код</span>
              </button>
              <button onClick={() => setIsCashbackOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center"><Diamond className="w-5 h-5 text-yellow-600" /></div>
                <span className="text-xs font-medium text-foreground">Кэшбэк</span>
              </button>
              <button onClick={() => setIsCurrencyOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>
                <span className="text-xs font-medium text-foreground">Валюта</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setIsBudgetsOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center"><PiggyBank className="w-5 h-5 text-orange-600" /></div>
                <span className="text-xs font-medium text-foreground">Бюджеты</span>
              </button>
              <button onClick={() => setIsSavingsGoalsOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center"><Target className="w-5 h-5 text-teal-600" /></div>
                <span className="text-xs font-medium text-foreground">Цели</span>
              </button>
              <button onClick={() => setIsSubscriptionsOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-pink-600" /></div>
                <span className="text-xs font-medium text-foreground">Подписки</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setIsStatementExportOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-slate-600" /></div>
                <span className="text-xs font-medium text-foreground">Выписка</span>
              </button>
              <button onClick={() => setIsLoansOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><Percent className="w-5 h-5 text-red-600" /></div>
                <span className="text-xs font-medium text-foreground">Кредиты</span>
              </button>
              <button onClick={() => setIsInsuranceOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-600" /></div>
                <span className="text-xs font-medium text-foreground">Страховки</span>
              </button>
              <button onClick={() => setIsInvestmentPortfolioOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-indigo-600" /></div>
                <span className="text-xs font-medium text-foreground">Портфель</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setIsReferralOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-violet-600" /></div>
                <span className="text-xs font-medium text-foreground">Друзья</span>
              </button>
              <button onClick={() => setIsBarcodeScannerOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center"><Scan className="w-5 h-5 text-cyan-600" /></div>
                <span className="text-xs font-medium text-foreground">Сканер</span>
              </button>
              <button onClick={() => setIsMultiCurrencyOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center"><Globe className="w-5 h-5 text-amber-600" /></div>
                <span className="text-xs font-medium text-foreground">Валюты</span>
              </button>
              <button onClick={() => setIsTipsOpen(true)} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center"><Coffee className="w-5 h-5 text-rose-600" /></div>
                <span className="text-xs font-medium text-foreground">Чаевые</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => setIsFamilyAccessOpen(true)} className="flex items-center gap-4 p-4 bg-card rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Семейный доступ</p>
                  <p className="text-sm text-muted-foreground">Карты для семьи с контролем расходов</p>
                </div>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Добрый день</p>
            <h1 className="text-xl font-bold text-foreground">{userName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={signOut} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" title="Выйти">
              <LogOut className="w-5 h-5 text-foreground" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">{userInitials}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">{renderTabContent()}</main>

      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} balance={mainAccountBalance} onTransfer={handleTransfer} />
      <InternalTransferModal isOpen={isInternalTransferOpen} onClose={() => setIsInternalTransferOpen(false)} accounts={accounts} onTransfer={handleInternalTransfer} />
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} onTopUp={handleTopUp} />
      <MoreActionsSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
      <AllTransactionsModal isOpen={isAllTransactionsOpen} onClose={() => setIsAllTransactionsOpen(false)} transactions={transactions} />
      {showCardManagement && <CardManagement onClose={() => setShowCardManagement(false)} cardHolderName={cardHolderName} />}
      {selectedAccount && (
        <AccountDetailModal isOpen={!!selectedAccount} onClose={() => setSelectedAccount(null)} account={selectedAccount} transactions={transactions} onTransfer={() => setIsInternalTransferOpen(true)} onTopUp={() => setIsTopUpOpen(true)} onCardSettings={() => { setSelectedAccount(null); setShowCardManagement(true); }} cardHolderName={cardHolderName} />
      )}
      <BudgetsModal isOpen={isBudgetsOpen} onClose={() => setIsBudgetsOpen(false)} transactions={transactions} />
      <SavingsGoalsModal isOpen={isSavingsGoalsOpen} onClose={() => setIsSavingsGoalsOpen(false)} onDeduct={handleSavingsDeduct} />
      <QRCodeModal isOpen={isQRCodeOpen} onClose={() => setIsQRCodeOpen(false)} userName={userName} cardNumber={mainAccount?.cardNumber || "0000"} onReceive={handleQRReceive} />
      <SBPTransferModal isOpen={isSBPTransferOpen} onClose={() => setIsSBPTransferOpen(false)} balance={mainAccountBalance} onTransfer={handleSBPTransfer} />
      <NotificationsCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <CashbackModal isOpen={isCashbackOpen} onClose={() => setIsCashbackOpen(false)} onWithdraw={handleCashbackWithdraw} />
      <CurrencyExchangeModal isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} balance={mainAccountBalance} onExchange={handleCurrencyExchange} />
      <SubscriptionsModal isOpen={isSubscriptionsOpen} onClose={() => setIsSubscriptionsOpen(false)} transactions={transactions} />
      <StatementExportModal isOpen={isStatementExportOpen} onClose={() => setIsStatementExportOpen(false)} transactions={transactions} accounts={accounts} />
      <LoansModal isOpen={isLoansOpen} onClose={() => setIsLoansOpen(false)} />
      <InsuranceModal isOpen={isInsuranceOpen} onClose={() => setIsInsuranceOpen(false)} />
      <InvestmentPortfolioModal isOpen={isInvestmentPortfolioOpen} onClose={() => setIsInvestmentPortfolioOpen(false)} portfolioValue={investmentAccount?.balance || 0} />
      <ReferralProgramModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
      <BarcodeScannerModal isOpen={isBarcodeScannerOpen} onClose={() => setIsBarcodeScannerOpen(false)} onPayment={handlePayment} />
      <MultiCurrencyModal isOpen={isMultiCurrencyOpen} onClose={() => setIsMultiCurrencyOpen(false)} />
      <TipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} userName={userName} />
      <FamilyAccessModal isOpen={isFamilyAccessOpen} onClose={() => setIsFamilyAccessOpen(false)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
