import { useState } from "react";
import { User, ChevronRight, QrCode, Gift, Shield as ShieldIcon, FileText, Headphones, Info, Newspaper, Phone, Bell, MessageSquare, LayoutGrid, Gauge, Smartphone, CreditCard, TrendingUp, Coins, Briefcase, UserCheck, Plane, PlusCircle, ChevronDown, LogOut, MapPin, Calculator, BookOpen } from "lucide-react";
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
import DevPdfTestPage from "./DevPdfTestPage";
import DevStatementGenerator from "./DevStatementGenerator";
import DevTransactionManager from "./DevTransactionManager";
import DevCertificateGenerator from "./DevCertificateGenerator";
import AccountCertificateModal from "./AccountCertificateModal";
import BudgetsModal from "./BudgetsModal";
import GeolocationModal from "./GeolocationModal";
import FinancialEducationModal from "./FinancialEducationModal";
import FullScreenModal from "./FullScreenModal";

interface MenuPageProps {
  onOpenCardManagement: () => void;
  onOpenSupport?: () => void;
  userName: string;
  balance: number;
  portfolioValue: number;
  cardNumber: string;
  onSignOut: () => void;
  transactions?: any[];
}

type TabType = "info" | "products" | "settings";

// ---- Documents Screen ----
const DocumentsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <FullScreenModal isOpen={isOpen} onClose={onClose} title="Документы">
    <div className="space-y-4">
      <div className="bg-muted rounded-2xl p-5 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">Нет документов</p>
        <p className="text-sm text-muted-foreground mt-1">Документы для подписи будут отображаться здесь</p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Подписанные</h3>
        {[
          { name: "Заявление на открытие счёта", date: "20.02.2020", status: "Подписан" },
          { name: "Согласие на обработку ПДн", date: "20.02.2020", status: "Подписан" },
          { name: "Договор комплексного обслуживания", date: "20.02.2020", status: "Подписан" },
        ].map(doc => (
          <div key={doc.name} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-medium text-foreground text-sm">{doc.name}</p>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{doc.date}</span>
              <span className="text-xs text-primary font-medium">{doc.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </FullScreenModal>
);

// ---- FAQ Screen ----
const FAQModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const faqs = [
    { q: "Как изменить лимиты по карте?", a: "Перейдите в Настройки → Лимиты, где можно установить дневные и месячные ограничения для переводов и покупок." },
    { q: "Как заблокировать карту?", a: "В разделе «Управление картами» нажмите на карту и выберите «Заблокировать». Разблокировка доступна там же." },
    { q: "Как подключить автоплатёж?", a: "На вкладке «Платежи» перейдите в раздел «Автоплатежи» и настройте новый автоплатёж с нужной периодичностью." },
    { q: "Как отправить перевод через СБП?", a: "На вкладке «Платежи» нажмите «Перевести по номеру телефона», введите номер получателя и сумму." },
    { q: "Как получить выписку по счёту?", a: "Откройте детали счёта → «Выписка по счёту». Выберите период и язык, затем экспортируйте PDF." },
    { q: "Как связаться с поддержкой?", a: "Нажмите иконку чата в правом верхнем углу главного экрана или позвоните на горячую линию 8-800-100-1100." },
    { q: "Как пополнить счёт?", a: "Через банкоматы РСХБ (бесплатно), переводом из другого банка по СБП, или по реквизитам счёта." },
    { q: "Какая комиссия за переводы?", a: "СБП — бесплатно до 100 000 ₽/мес. По номеру карты — 1.5% (мин. 30 ₽). По реквизитам — бесплатно." },
  ];
  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Вопросы и ответы">
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <button
            key={i}
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            className="w-full bg-card rounded-xl p-4 text-left border border-border"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground text-sm pr-4">{faq.q}</p>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedIdx === i ? "rotate-180" : ""}`} />
            </div>
            {expandedIdx === i && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
            )}
          </button>
        ))}
      </div>
    </FullScreenModal>
  );
};

// ---- News Screen ----
const NewsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <FullScreenModal isOpen={isOpen} onClose={onClose} title="Новости">
    <div className="space-y-3">
      {[
        { date: "08.03.2026", title: "Обновление приложения v2.5", text: "Добавлена поддержка выписок на английском языке, улучшена аналитика расходов и добавлен новый раздел «Своё»." },
        { date: "01.03.2026", title: "Повышенный кэшбэк в марте", text: "До 10% кэшбэка в категории «Рестораны» и «Путешествия» до конца месяца." },
        { date: "15.02.2026", title: "Переводы через СБП стали быстрее", text: "Среднее время перевода сократилось до 3 секунд. Лимит без комиссии увеличен до 100 000 ₽/мес." },
        { date: "01.02.2026", title: "Новые возможности UnionPay", text: "Теперь вы можете оплачивать покупки через UnionPay QuickPass в более чем 180 странах мира." },
        { date: "15.01.2026", title: "Программа лояльности обновлена", text: "Начисление баллов ускорено, добавлены новые партнёры. Баллы можно тратить на путешествия и кэшбэк." },
      ].map(news => (
        <div key={news.title} className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{news.date}</p>
          <p className="font-medium text-foreground mb-2">{news.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{news.text}</p>
        </div>
      ))}
    </div>
  </FullScreenModal>
);

// ---- Security Screen ----
const SecurityModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Безопасность">
      <div className="space-y-4">
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Двухфакторная аутентификация</p>
            <p className="text-sm text-muted-foreground">SMS-подтверждение при входе</p>
          </div>
          <Switch checked={twoFAEnabled} onCheckedChange={(v) => { setTwoFAEnabled(v); toast({ title: v ? "2FA включена" : "2FA отключена" }); }} />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Биометрия</p>
            <p className="text-sm text-muted-foreground">Вход по Face ID / Touch ID</p>
          </div>
          <Switch checked={biometricEnabled} onCheckedChange={(v) => { setBiometricEnabled(v); toast({ title: v ? "Биометрия включена" : "Биометрия отключена" }); }} />
        </div>
        <button onClick={() => toast({ title: "Ссылка отправлена", description: "Проверьте почту для смены пароля" })} className="w-full bg-card rounded-xl p-4 border border-border text-left hover:bg-muted transition-colors">
          <p className="font-medium text-foreground">Сменить пароль</p>
          <p className="text-sm text-muted-foreground">Ссылка придёт на почту</p>
        </button>
        <button onClick={() => toast({ title: "Активные сессии", description: "Найдена 1 активная сессия (это приложение)" })} className="w-full bg-card rounded-xl p-4 border border-border text-left hover:bg-muted transition-colors">
          <p className="font-medium text-foreground">Активные сессии</p>
          <p className="text-sm text-muted-foreground">Просмотр и завершение сессий</p>
        </button>
        <button onClick={() => toast({ title: "Push-уведомления о входе", description: "Вы будете получать уведомление при каждом входе в аккаунт" })} className="w-full bg-card rounded-xl p-4 border border-border text-left hover:bg-muted transition-colors">
          <p className="font-medium text-foreground">Уведомления о входе</p>
          <p className="text-sm text-muted-foreground">Push при каждом входе в аккаунт</p>
        </button>
      </div>
    </FullScreenModal>
  );
};

// ---- Devices Screen ----
const DevicesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <FullScreenModal isOpen={isOpen} onClose={onClose} title="Мои устройства">
    <div className="space-y-4">
      <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-4">
        <Smartphone className="w-10 h-10 text-primary" />
        <div className="flex-1">
          <p className="font-medium text-foreground">Это устройство</p>
          <p className="text-sm text-muted-foreground">Россельхозбанк Mobile</p>
          <p className="text-xs text-primary mt-1">Активно сейчас</p>
        </div>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">Других привязанных устройств нет</p>
      </div>
    </div>
  </FullScreenModal>
);

// ---- Self-employed Screen ----
const SelfEmployedModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <FullScreenModal isOpen={isOpen} onClose={onClose} title="Всё для самозанятых">
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
        <h3 className="text-lg font-bold mb-2">Стань самозанятым</h3>
        <p className="text-sm opacity-90">Регистрация через приложение за 5 минут, без визита в налоговую</p>
      </div>
      <div className="space-y-3">
        {[
          { title: "Автоматическая отчётность", desc: "Чеки формируются автоматически при каждом поступлении" },
          { title: "Налог 4-6%", desc: "4% при работе с физлицами, 6% с юридическими" },
          { title: "Бесплатный счёт", desc: "Обслуживание счёта самозанятого — 0 ₽" },
          { title: "Интеграция с ФНС", desc: "Данные автоматически передаются в налоговую" },
        ].map(item => (
          <div key={item.title} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </FullScreenModal>
);

// ---- Chat Support Screen ----
const ChatSupportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Здравствуйте! Я виртуальный помощник РСХБ. Чем могу помочь?" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { from: "user", text: message }]);
    const msg = message.toLowerCase();
    setMessage("");
    setTimeout(() => {
      let reply = "Спасибо за ваш вопрос! Для более подробной консультации позвоните на горячую линию 8-800-100-1100.";
      if (msg.includes("перевод")) reply = "Переводы доступны через СБП (бесплатно до 100 000 ₽/мес), по номеру карты или по реквизитам. Перейдите на вкладку «Платежи».";
      else if (msg.includes("карт")) reply = "Управление картами доступно в разделе «Управление картами». Там можно заблокировать, перевыпустить или настроить лимиты.";
      else if (msg.includes("кэшбэк") || msg.includes("баллы")) reply = "Текущий кэшбэк можно посмотреть на главном экране. Выберите категории повышенного кэшбэка до конца месяца!";
      else if (msg.includes("выписк")) reply = "Выписку можно сформировать в деталях счёта → «Выписка по счёту». Доступен экспорт в PDF на русском и английском.";
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
    }, 800);
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Чат с поддержкой">
      <div className="flex flex-col" style={{ minHeight: "60vh" }}>
        <div className="flex-1 space-y-3 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground text-sm"
          />
          <button onClick={sendMessage} className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </FullScreenModal>
  );
};

const MenuPage = ({ onOpenCardManagement, onOpenSupport, userName, balance, portfolioValue, cardNumber, onSignOut, transactions = [] }: MenuPageProps) => {
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
  const [isDevTestOpen, setIsDevTestOpen] = useState(false);
  const [isDevStatementOpen, setIsDevStatementOpen] = useState(false);
  const [isDevTxManagerOpen, setIsDevTxManagerOpen] = useState(false);
  const [isDevCertOpen, setIsDevCertOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isBudgetsOpen, setIsBudgetsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isSelfEmployedOpen, setIsSelfEmployedOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const tabs: { id: TabType; label: string }[] = [
    { id: "info", label: "Информация" },
    { id: "products", label: "Продукты" },
    { id: "settings", label: "Настройки" },
  ];

  const infoCards = [
    { label: "Чаты", icon: MessageSquare, color: "bg-accent", action: () => setIsChatOpen(true) },
    { label: "Инвестиции", icon: TrendingUp, color: "bg-accent", action: () => setIsInvestOpen(true) },
    { label: "Все для самозанятых", icon: UserCheck, color: "bg-accent", action: () => setIsSelfEmployedOpen(true) },
    { label: "На карте", icon: MapPin, color: "bg-accent", action: () => setIsMapOpen(true) },
    { label: "Справки", icon: FileText, color: "bg-accent", action: () => setIsCertificateOpen(true) },
    { label: "Планирование бюджета", icon: Calculator, color: "bg-accent", action: () => setIsBudgetsOpen(true) },
    { label: "Курсы валют и металлов", icon: Coins, color: "bg-accent", action: () => setIsCurrencyOpen(true) },
  ];

  const infoItems = [
    { icon: QrCode, label: "Вход / Операция в Интернет-банке", subtitle: "Сканировать QR-код", highlight: true, action: () => setIsQRLoginOpen(true) },
    { icon: Gift, label: "Программа лояльности", subtitle: "До 15% баллами за покупки в категориях", action: () => setIsLoyaltyOpen(true) },
    { icon: ShieldIcon, label: "Мои программы страхования", subtitle: "Все ваши страховки в одном месте", action: () => setIsInsuranceOpen(true) },
    { icon: FileText, label: "Документы", subtitle: "На подпись и подписанные", action: () => setIsDocumentsOpen(true) },
    { icon: Headphones, label: "Связь с банком", subtitle: "Телефоны для связи", action: () => setIsSupportOpen(true) },
    { icon: Info, label: "Вопросы и ответы по системе", subtitle: "Лимиты, тарифы и другая информация", action: () => setIsFAQOpen(true) },
    { icon: Newspaper, label: "Новости", subtitle: "Новое в приложении", action: () => setIsNewsOpen(true) },
  ];

  const productCards = [
    { label: "Открыть вклад", badge: "до 14.3%", action: () => setIsDepositsOpen(true) },
    { label: "Взять кредит", badge: "Ставка от 23%", action: () => setIsLoansOpen(true) },
  ];

  const productGrid = [
    { label: "Получить карту", action: onOpenCardManagement },
    { label: "Открыть накопительный счёт", badge: "до 14%", action: () => setIsDepositsOpen(true) },
    { label: "Открыть счёт", action: () => toast({ title: "Заявка отправлена", description: "Менеджер свяжется с вами в течение 1 рабочего дня" }) },
    { label: "Стать инвестором", action: () => setIsInvestOpen(true) },
    { label: "Подключить подписку Всё Своё", action: () => toast({ title: "Подписка оформлена", description: "Доступ к контенту «Всё Своё» активирован" }) },
    { label: "Купить монеты и металлы", action: () => setIsCurrencyOpen(true) },
  ];

  const otherOffers = [
    { icon: Briefcase, label: "Всё для бизнеса", action: () => toast({ title: "Расчётный счёт для бизнеса", description: "Оставьте заявку по телефону 8-800-100-1100" }) },
    { icon: UserCheck, label: "Всё для самозанятых", action: () => setIsSelfEmployedOpen(true) },
    { icon: BookOpen, label: "Финансовая грамотность", action: () => setIsEducationOpen(true) },
  ];

  const settingsItems = [
    { icon: Phone, label: "Переводы по номеру телефона", subtitle: "Настройте систему быстрых переводов", action: () => toast({ title: "СБП активна", description: "Ваш банк по умолчанию для входящих переводов СБП — РСХБ" }) },
    { icon: Bell, label: "Push-уведомления", subtitle: "Настройте Push уведомления", toggle: true },
    { icon: MessageSquare, label: "Оповещения", subtitle: "По почте и по телефону", action: () => toast({ title: "Настройки оповещений", description: "SMS и email-оповещения включены для всех операций свыше 100 ₽" }) },
    { icon: LayoutGrid, label: "Виджет", subtitle: "Настройка виджетов", action: () => toast({ title: "Виджеты", description: "Виджет баланса добавлен на главный экран устройства" }) },
    { icon: Gauge, label: "Лимиты", subtitle: "Настройка лимитов по операциям", action: () => setIsLimitsOpen(true) },
    { icon: ShieldIcon, label: "Безопасность", subtitle: "Настройки входа и безопасности", action: () => setIsSecurityOpen(true) },
    { icon: Smartphone, label: "Мои устройства", subtitle: "Добавьте используемое устройство", action: () => setIsDevicesOpen(true) },
    { icon: CreditCard, label: "Лимиты на покупки через СБП", subtitle: "Установить лимиты на покупки в магазинах", action: () => setIsLimitsOpen(true) },
    { icon: Smartphone, label: "🛠 Разработка", subtitle: "Тестирование методов экспорта PDF", action: () => setIsDevTestOpen(true) },
    { icon: FileText, label: "🛠 Выписка из будущего", subtitle: "Генерация выписок за любые даты", action: () => setIsDevStatementOpen(true) },
    { icon: FileText, label: "🛠 Справка из будущего", subtitle: "Генерация справок за любую дату", action: () => setIsDevCertOpen(true) },
    { icon: CreditCard, label: "🛠 Транзакции", subtitle: "Полное управление транзакциями (ПК)", action: () => setIsDevTxManagerOpen(true) },
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
        <div className="fixed inset-0 z-50 bg-background" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 44px)' }}>
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
      <AccountCertificateModal isOpen={isCertificateOpen} onClose={() => setIsCertificateOpen(false)} />
      <BudgetsModal isOpen={isBudgetsOpen} onClose={() => setIsBudgetsOpen(false)} transactions={transactions} />
      <GeolocationModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <FinancialEducationModal isOpen={isEducationOpen} onClose={() => setIsEducationOpen(false)} />
      <DocumentsModal isOpen={isDocumentsOpen} onClose={() => setIsDocumentsOpen(false)} />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <NewsModal isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
      <SecurityModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <DevicesModal isOpen={isDevicesOpen} onClose={() => setIsDevicesOpen(false)} />
      <SelfEmployedModal isOpen={isSelfEmployedOpen} onClose={() => setIsSelfEmployedOpen(false)} />
      <ChatSupportModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <DevPdfTestPage isOpen={isDevTestOpen} onClose={() => setIsDevTestOpen(false)} />
      <DevStatementGenerator isOpen={isDevStatementOpen} onClose={() => setIsDevStatementOpen(false)} />
      <DevTransactionManager isOpen={isDevTxManagerOpen} onClose={() => setIsDevTxManagerOpen(false)} />
      <DevCertificateGenerator isOpen={isDevCertOpen} onClose={() => setIsDevCertOpen(false)} />
    </div>
  );
};

export default MenuPage;
