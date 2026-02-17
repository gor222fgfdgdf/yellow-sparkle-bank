import { useState } from "react";
import { User, ChevronRight, QrCode, Gift, Shield as ShieldIcon, FileText, Headphones, Info, Newspaper, Phone, Bell, MessageSquare, LayoutGrid, Gauge, Smartphone, CreditCard, TrendingUp, Coins, Briefcase, UserCheck, Plane, PlusCircle, ChevronDown, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import LoyaltyProgramModal from "./LoyaltyProgramModal";
import InsuranceModal from "./InsuranceModal";
import SpendingLimitsModal from "./SpendingLimitsModal";
import SupportPage from "./SupportPage";
import DepositsModal from "./DepositsModal";
import LoansModal from "./LoansModal";
import CurrencyExchangeModal from "./CurrencyExchangeModal";
import InvestmentPortfolioModal from "./InvestmentPortfolioModal";
import QRCodeModal from "./QRCodeModal";

interface MenuPageProps {
  onOpenCardManagement: () => void;
  userName: string;
  balance: number;
  portfolioValue: number;
  cardNumber: string;
  onSignOut: () => void;
}

type TabType = "info" | "products" | "settings";

const MenuPage = ({ onOpenCardManagement, userName, balance, portfolioValue, cardNumber, onSignOut }: MenuPageProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [pushEnabled, setPushEnabled] = useState(true);
  
  // Modal states
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDepositsOpen, setIsDepositsOpen] = useState(false);
  const [isLoansOpen, setIsLoansOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [isQRLoginOpen, setIsQRLoginOpen] = useState(false);

  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const tabs: { id: TabType; label: string }[] = [
    { id: "info", label: "Информация" },
    { id: "products", label: "Продукты" },
    { id: "settings", label: "Настройки" },
  ];

  const infoCards = [
    { label: "Чаты", icon: MessageSquare, color: "bg-accent" },
    { label: "Инвестиции", icon: TrendingUp, color: "bg-accent", action: () => setIsInvestOpen(true) },
    { label: "Все для самозанятых", icon: UserCheck, color: "bg-accent" },
    { label: "На карте", icon: LayoutGrid, color: "bg-accent" },
    { label: "Справки", icon: FileText, color: "bg-accent" },
    { label: "Планирование бюджета", icon: TrendingUp, color: "bg-accent" },
    { label: "Курсы валют и металлов", icon: Coins, color: "bg-accent", action: () => setIsCurrencyOpen(true) },
  ];

  const infoItems = [
    { icon: QrCode, label: "Вход / Операция в Интернет-банке", subtitle: "Сканировать QR-код", highlight: true, action: () => setIsQRLoginOpen(true) },
    { icon: Gift, label: "Программа лояльности", subtitle: "До 15% баллами за покупки в категориях", action: () => setIsLoyaltyOpen(true) },
    { icon: ShieldIcon, label: "Мои программы страхования", subtitle: "Все ваши страховки в одном месте", action: () => setIsInsuranceOpen(true) },
    { icon: FileText, label: "Документы", subtitle: "На подпись и подписанные", action: () => toast({ title: "Документы", description: "Нет документов для подписи" }) },
    { icon: Headphones, label: "Связь с банком", subtitle: "Телефоны для связи", action: () => setIsSupportOpen(true) },
    { icon: Info, label: "Вопросы и ответы по системе", subtitle: "Лимиты, тарифы и другая информация", action: () => toast({ title: "Справка", description: "Раздел FAQ будет доступен в ближайшее время" }) },
    { icon: Newspaper, label: "Новости", subtitle: "Новое в приложении", action: () => toast({ title: "Новости", description: "Нет новых уведомлений" }) },
  ];

  const productCards = [
    { label: "Открыть вклад", badge: "до 14.3%", action: () => setIsDepositsOpen(true) },
    { label: "Взять кредит", badge: "Ставка от 23%", action: () => setIsLoansOpen(true) },
  ];

  const productGrid = [
    { label: "Получить карту", action: onOpenCardManagement },
    { label: "Открыть накопительный счёт", badge: "до 14%", action: () => setIsDepositsOpen(true) },
    { label: "Открыть счёт", action: () => toast({ title: "Новый счёт", description: "Заявка на открытие счёта отправлена" }) },
    { label: "Стать инвестором", action: () => setIsInvestOpen(true) },
    { label: "Подключить подписку Всё Своё", action: () => toast({ title: "Всё Своё", description: "Подписка будет доступна в ближайшее время" }) },
    { label: "Купить монеты и металлы", action: () => setIsCurrencyOpen(true) },
  ];

  const otherOffers = [
    { icon: Briefcase, label: "Всё для бизнеса", action: () => toast({ title: "Бизнес", description: "Раздел для бизнеса в разработке" }) },
    { icon: UserCheck, label: "Всё для самозанятых", action: () => toast({ title: "Самозанятые", description: "Регистрация самозанятого доступна через Госуслуги" }) },
    { icon: Plane, label: "Рассказы о путешествиях", action: () => toast({ title: "Путешествия", description: "Читайте в разделе Журнал" }) },
  ];

  const settingsItems = [
    { icon: Phone, label: "Переводы по номеру телефона", subtitle: "Настройте систему быстрых переводов", action: () => toast({ title: "СБП", description: "Настройки СБП переводов обновлены" }) },
    { icon: Bell, label: "Push-уведомления", subtitle: "Настройте Push уведомления", toggle: true },
    { icon: MessageSquare, label: "Оповещения", subtitle: "По почте и по телефону", action: () => toast({ title: "Оповещения", description: "Настройки оповещений сохранены" }) },
    { icon: LayoutGrid, label: "Виджет", subtitle: "Настройка виджетов", action: () => toast({ title: "Виджеты", description: "Настройка виджетов для главного экрана" }) },
    { icon: Gauge, label: "Лимиты", subtitle: "Настройка лимитов по операциям", action: () => setIsLimitsOpen(true) },
    { icon: ShieldIcon, label: "Безопасность", subtitle: "Настройки входа и безопасности", action: () => toast({ title: "Безопасность", description: "Настройки безопасности" }) },
    { icon: Smartphone, label: "Мои устройства", subtitle: "Добавьте используемое устройство", action: () => toast({ title: "Устройства", description: "Текущее устройство: это приложение" }) },
    { icon: CreditCard, label: "Лимиты на покупки через СБП", subtitle: "Установить лимиты на покупки в магазинах", action: () => setIsLimitsOpen(true) },
  ];

  return (
    <div className="pb-24">
      {/* Header - User info */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{userInitials}</span>
        </div>
        <button className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground">{userName}</span>
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <div className="space-y-0">
          <div className="overflow-x-auto scrollbar-hide py-4 px-4">
            <div className="flex gap-3" style={{ width: "max-content" }}>
              {infoCards.map((card) => (
                <button
                  key={card.label}
                  onClick={card.action}
                  className={`${card.color} rounded-2xl p-4 w-40 h-32 flex flex-col justify-between items-start shrink-0 hover:opacity-80 transition-opacity`}
                >
                  <span className="text-sm font-medium text-foreground leading-tight">{card.label}</span>
                  <div className="self-end">
                    <card.icon className="w-8 h-8 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 px-4">
            {infoItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left ${
                  item.highlight ? "bg-accent" : "bg-card hover:bg-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="px-4 pt-4">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl hover:bg-destructive/10 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-destructive" />
              </div>
              <span className="font-medium text-destructive">Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-0">
          <div className="px-4 pt-4">
            <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
              <h3 className="text-lg font-bold mb-1">Специальные предложения</h3>
              <p className="text-sm opacity-90">Свежие продукты от фермеров РСХБ</p>
              <div className="flex justify-center gap-1 mt-4">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                <div className="w-2 h-2 rounded-full bg-primary-foreground/40" />
                <div className="w-2 h-2 rounded-full bg-primary-foreground/40" />
              </div>
            </div>
          </div>

          <div className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Все продукты</h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {productCards.map((card) => (
                <button
                  key={card.label}
                  onClick={card.action}
                  className="bg-card rounded-2xl p-4 h-32 flex flex-col justify-between items-start hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground">{card.label}</span>
                  <span className="text-xs font-medium bg-foreground/80 text-card px-2.5 py-1 rounded-full">{card.badge}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={onOpenCardManagement}
              className="w-full bg-primary rounded-2xl p-5 mb-3 text-left hover:bg-primary/90 transition-colors"
            >
              <p className="text-primary-foreground font-bold mb-2">Оформить нашу лучшую кредитную карту</p>
              <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full">
                Льготный период 115 дней
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {productGrid.map((card) => (
                <button
                  key={card.label}
                  onClick={card.action}
                  className="bg-card rounded-2xl p-4 h-32 flex flex-col justify-between items-start hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground leading-tight">{card.label}</span>
                  {card.badge && (
                    <span className="text-xs font-medium bg-foreground/80 text-card px-2.5 py-1 rounded-full">{card.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pt-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Другие предложения</h2>
            <div className="space-y-2">
              {otherOffers.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-2 px-4 pt-4">
          {settingsItems.map((item) => (
            <div
              key={item.label}
              className="w-full flex items-center justify-between p-4 bg-card rounded-2xl"
            >
              <button
                onClick={item.action}
                className="flex items-center gap-4 text-left flex-1 min-w-0"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
              </button>
              {item.toggle && (
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={setPushEnabled}
                  className="shrink-0 ml-2"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <LoyaltyProgramModal isOpen={isLoyaltyOpen} onClose={() => setIsLoyaltyOpen(false)} />
      <InsuranceModal isOpen={isInsuranceOpen} onClose={() => setIsInsuranceOpen(false)} />
      <SpendingLimitsModal open={isLimitsOpen} onOpenChange={setIsLimitsOpen} limits={[]} onSaveLimits={() => {}} categories={["Продукты", "Транспорт", "Развлечения", "Рестораны", "Связь", "ЖКХ", "Покупки"]} />
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="p-4">
            <button onClick={() => setIsSupportOpen(false)} className="text-primary font-medium mb-4">← Назад</button>
            <SupportPage />
          </div>
        </div>
      )}
      <DepositsModal isOpen={isDepositsOpen} onClose={() => setIsDepositsOpen(false)} />
      <LoansModal isOpen={isLoansOpen} onClose={() => setIsLoansOpen(false)} />
      <CurrencyExchangeModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        balance={balance}
        onExchange={() => {}}
      />
      <InvestmentPortfolioModal isOpen={isInvestOpen} onClose={() => setIsInvestOpen(false)} portfolioValue={portfolioValue} />
      <QRCodeModal
        isOpen={isQRLoginOpen}
        onClose={() => setIsQRLoginOpen(false)}
        userName={userName}
        cardNumber={cardNumber}
        onReceive={() => {}}
      />
    </div>
  );
};

export default MenuPage;
