import { useState } from "react";
import { Car, Coffee, ShoppingBag, Tv, Utensils, Fuel, Music, ArrowUpRight, Home, Smartphone, Zap, Droplets, Briefcase, Heart, Gamepad2, GraduationCap, Dumbbell, CreditCard, PiggyBank, TrendingUp, Wallet, Target, QrCode, Send, Bell, Diamond, DollarSign, CalendarCheck, FileText, Percent, Shield, Users, Scan, Globe, Coffee as TipsIcon, Search, MessageCircle, Eye } from "lucide-react";
import RSHBLogo from "@/components/banking/RSHBLogo";
import AccountsList, { type Account } from "@/components/banking/AccountsList";
import QuickActions from "@/components/banking/QuickActions";
import StoriesBanner from "@/components/banking/StoriesBanner";
import TransactionList, { type Transaction } from "@/components/banking/TransactionList";
import TransferModal from "@/components/banking/TransferModal";
import HomePromoBanner from "@/components/banking/HomePromoBanner";
import HomeStoryCards from "@/components/banking/HomeStoryCards";
import HomePromoBannerSlider from "@/components/banking/HomePromoBannerSlider";
import HomeWidgetGrid from "@/components/banking/HomeWidgetGrid";
import HomeAccountsList from "@/components/banking/HomeAccountsList";
import HomeCurrencyRates from "@/components/banking/HomeCurrencyRates";
import HomeSelfEmployedBanner from "@/components/banking/HomeSelfEmployedBanner";
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
import HistoryPage from "@/components/banking/HistoryPage";
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
import VirtualCardsModal from "@/components/banking/VirtualCardsModal";
import DepositsModal from "@/components/banking/DepositsModal";
import GovernmentServicesModal from "@/components/banking/GovernmentServicesModal";
import CharityModal from "@/components/banking/CharityModal";
import LoyaltyProgramModal from "@/components/banking/LoyaltyProgramModal";
import FinancialCalendarModal from "@/components/banking/FinancialCalendarModal";
import FinancialEducationModal from "@/components/banking/FinancialEducationModal";
import SvoePage from "@/components/banking/SvoePage";
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
  const [isVirtualCardsOpen, setIsVirtualCardsOpen] = useState(false);
  const [isDepositsOpen, setIsDepositsOpen] = useState(false);
  const [isGovernmentOpen, setIsGovernmentOpen] = useState(false);
  const [isCharityOpen, setIsCharityOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);

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
      rawDate: tx.date,
      icon: iconMap[tx.icon] || CreditCard,
      isIncoming: tx.is_income || false,
      accountId: tx.account_id,
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
        return (
          <PaymentsPage 
            onPayment={handlePayment} 
            transactions={transactions} 
            balance={mainAccountBalance}
            accounts={accounts}
            userName={userName}
            cardNumber={mainAccount?.cardNumber || "0000"}
            onTransfer={handleTransfer}
            onInternalTransfer={handleInternalTransfer}
            onSBPTransfer={handleSBPTransfer}
            onQRReceive={handleQRReceive}
          />
        );
      case "support":
        return <SupportPage />;
      case "menu":
        return (
          <MenuPage 
            onOpenCardManagement={() => setShowCardManagement(true)}
            userName={userName}
            balance={mainAccountBalance}
            portfolioValue={investmentAccount?.balance || 0}
            cardNumber={mainAccount?.cardNumber || "0000"}
            onSignOut={signOut}
          />
        );
      case "history":
        return <HistoryPage transactions={transactions} accounts={accounts} />;
      case "svoe":
        return <SvoePage />;
      default:
        return (
          <>
            <HomePromoBanner onOpenVirtualCards={() => setIsVirtualCardsOpen(true)} />
            <HomeStoryCards 
              onOpenDeposits={() => setIsDepositsOpen(true)}
              onOpenInvestment={() => setIsInvestmentPortfolioOpen(true)}
              onOpenCurrency={() => setIsCurrencyOpen(true)}
              onOpenLoyalty={() => setIsLoyaltyOpen(true)}
            />
            <HomePromoBannerSlider />
            <QuickActions
              onTopUpClick={() => setIsTopUpOpen(true)}
              onTransferClick={() => setIsInternalTransferOpen(true)}
              onHistoryClick={() => setActiveTab("history")}
              onMoreClick={() => setIsMoreOpen(true)}
            />
            <HomeWidgetGrid
              totalBalance={accounts.reduce((s, a) => s + a.balance, 0)}
              onQRCode={() => setIsQRCodeOpen(true)}
              onReferral={() => setIsReferralOpen(true)}
              onCashback={() => setIsCashbackOpen(true)}
              onAnalytics={() => setIsBudgetsOpen(true)}
            />
            <HomeAccountsList
              accounts={accounts}
              onAccountClick={handleAccountClick}
              onShowAll={() => setShowCardManagement(true)}
            />
            <Button 
              onClick={() => setIsDepositsOpen(true)}
              className="w-full h-12 rounded-2xl text-base font-semibold"
            >
              Оформить новый продукт
            </Button>
            <HomeCurrencyRates onOpenCurrency={() => setIsCurrencyOpen(true)} />
            <HomeSelfEmployedBanner />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary-foreground" />
            </button>
            <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-primary-foreground" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => setActiveTab("support")} className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">{renderTabContent()}</main>

      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} balance={mainAccountBalance} onTransfer={handleTransfer} />
      <InternalTransferModal isOpen={isInternalTransferOpen} onClose={() => setIsInternalTransferOpen(false)} accounts={accounts} onTransfer={handleInternalTransfer} />
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} onTopUp={handleTopUp} />
      <MoreActionsSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenSubscriptions={() => { setIsMoreOpen(false); setIsSubscriptionsOpen(true); }}
        onOpenStatementExport={() => { setIsMoreOpen(false); setIsStatementExportOpen(true); }}
        onOpenBudgets={() => { setIsMoreOpen(false); setIsBudgetsOpen(true); }}
        onOpenSavingsGoals={() => { setIsMoreOpen(false); setIsSavingsGoalsOpen(true); }}
        onOpenLoans={() => { setIsMoreOpen(false); setIsLoansOpen(true); }}
        onOpenInsurance={() => { setIsMoreOpen(false); setIsInsuranceOpen(true); }}
        onOpenCalendar={() => { setIsMoreOpen(false); setIsCalendarOpen(true); }}
        onSetupPin={() => { setIsMoreOpen(false); setIsSettingUpPin(true); }}
      />
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
      <VirtualCardsModal isOpen={isVirtualCardsOpen} onClose={() => setIsVirtualCardsOpen(false)} />
      <DepositsModal isOpen={isDepositsOpen} onClose={() => setIsDepositsOpen(false)} />
      <GovernmentServicesModal isOpen={isGovernmentOpen} onClose={() => setIsGovernmentOpen(false)} onPayFine={(amount) => handlePayment(amount, "Госуслуги")} />
      <CharityModal isOpen={isCharityOpen} onClose={() => setIsCharityOpen(false)} onDonate={(amount, org) => handlePayment(amount, org)} />
      <LoyaltyProgramModal isOpen={isLoyaltyOpen} onClose={() => setIsLoyaltyOpen(false)} />
      <FinancialCalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <FinancialEducationModal isOpen={isEducationOpen} onClose={() => setIsEducationOpen(false)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
