import { useState } from "react";
import { Search, ScanBarcode, Phone, Bell, QrCode, ArrowLeftRight, Globe, CreditCard, CircleDollarSign, FileText, Smartphone, Home, Landmark, PhoneCall, Wifi, Ticket, Building2, MoreHorizontal, ChevronRight, Check, X, ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AutoPaymentsModal from "./AutoPaymentsModal";
import QRCodeModal from "./QRCodeModal";
import TransferModal from "./TransferModal";
import CurrencyExchangeModal from "./CurrencyExchangeModal";
import SBPTransferModal from "./SBPTransferModal";
import BarcodeScannerModal from "./BarcodeScannerModal";
import PaymentTemplatesModal from "./PaymentTemplatesModal";
import FullScreenModal from "./FullScreenModal";
import type { Transaction } from "./TransactionList";
import type { Account } from "./AccountsList";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

// ---- Payment Category Full-Screen Modal ----
interface PaymentCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { icon: any; label: string; color: string } | null;
  onPayment: (amount: number, provider: string) => void;
}

const PaymentCategoryModal = ({ isOpen, onClose, category, onPayment }: PaymentCategoryModalProps) => {
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const providers: Record<string, string[]> = {
    "Мобильная связь": ["МТС", "Билайн", "Мегафон", "Теле2"],
    "ЖКХ": ["МосОблЕИРЦ", "ГИС ЖКХ", "Управляющая компания"],
    "В бюджет": ["ФНС", "ПФР", "ФСС"],
    "Домашний телефон": ["Ростелеком", "МГТС", "Домру"],
    "Интернет и ТВ": ["Ростелеком", "Билайн Дом", "МТС Домашний", "Дом.ру"],
    "Билеты и путешествия": ["РЖД", "Аэрофлот", "S7 Airlines"],
    "Из другого банка": ["Сбербанк", "ВТБ", "Альфа-Банк", "Газпромбанк"],
    "Ещё": ["Штрафы ГИБДД", "Налоги", "Детский сад", "Образование"],
  };

  const handlePay = () => {
    if (!provider) {
      toast({ title: "Ошибка", description: "Выберите поставщика услуг", variant: "destructive" });
      return;
    }
    if (!accountNumber) {
      toast({ title: "Ошибка", description: "Введите номер счёта/лицевого счёта", variant: "destructive" });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Ошибка", description: "Введите корректную сумму", variant: "destructive" });
      return;
    }

    onPayment(parseFloat(amount), provider);
    toast({ title: "Оплачено!", description: `${formatCurrency(parseFloat(amount))} ₽ — ${provider}` });
    setProvider("");
    setAccountNumber("");
    setAmount("");
    onClose();
  };

  if (!category) return null;

  const categoryProviders = providers[category.label] || ["Поставщик 1", "Поставщик 2", "Поставщик 3"];

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title={category.label}>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Выберите поставщика</p>
          <div className="grid grid-cols-2 gap-2">
            {categoryProviders.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === p ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium text-foreground">{p}</span>
                {provider === p && <Check className="inline-block ml-2 w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Номер лицевого счёта</p>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Введите номер"
            className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Сумма</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">₽</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button onClick={handlePay} className="w-full h-14 text-lg font-semibold">
          Оплатить
        </Button>
      </div>
    </FullScreenModal>
  );
};

// ---- SBP Info Screen ----
const SBPInfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <FullScreenModal isOpen={isOpen} onClose={onClose} title="Система быстрых платежей">
    <div className="space-y-6">
      <div className="bg-primary/10 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-foreground mb-2">Что такое СБП?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Система быстрых платежей (СБП) — это сервис Банка России, позволяющий мгновенно переводить деньги по номеру телефона между счетами разных банков.
        </p>
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Преимущества</h4>
        {[
          { title: "Мгновенно", desc: "Деньги приходят за несколько секунд" },
          { title: "Бесплатно", desc: "Переводы до 100 000 ₽/мес без комиссии" },
          { title: "Удобно", desc: "Достаточно знать номер телефона получателя" },
          { title: "Безопасно", desc: "Все операции защищены шифрованием" },
        ].map(item => (
          <div key={item.title} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Лимиты</h4>
        <div className="bg-muted rounded-xl p-4">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Без комиссии</span>
            <span className="font-medium text-foreground">до 100 000 ₽/мес</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Максимум за операцию</span>
            <span className="font-medium text-foreground">1 000 000 ₽</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Максимум в сутки</span>
            <span className="font-medium text-foreground">1 000 000 ₽</span>
          </div>
        </div>
      </div>
    </div>
  </FullScreenModal>
);

// ---- Tariffs Screen ----
const TariffsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <FullScreenModal isOpen={isOpen} onClose={onClose} title="Условия и тарифы">
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Переводы</h4>
        <div className="bg-muted rounded-xl p-4 space-y-3">
          {[
            { label: "СБП (до 100 000 ₽/мес)", value: "Бесплатно" },
            { label: "СБП (свыше 100 000 ₽/мес)", value: "0.5%" },
            { label: "По номеру карты", value: "1.5%, мин. 30 ₽" },
            { label: "По реквизитам", value: "Бесплатно" },
            { label: "Международные переводы", value: "от 1%, мин. 200 ₽" },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Обслуживание карт</h4>
        <div className="bg-muted rounded-xl p-4 space-y-3">
          {[
            { label: "UnionPay Classic", value: "Бесплатно" },
            { label: "UnionPay Gold", value: "990 ₽/год" },
            { label: "Выпуск/перевыпуск", value: "Бесплатно" },
            { label: "Снятие в банкоматах РСХБ", value: "Бесплатно" },
            { label: "Снятие в других банкоматах", value: "1%, мин. 100 ₽" },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Валютные операции</h4>
        <div className="bg-muted rounded-xl p-4 space-y-3">
          {[
            { label: "Курс конвертации", value: "Курс ЦБ + маржа банка" },
            { label: "Комиссия за конвертацию", value: "0%" },
            { label: "Обмен валют (в приложении)", value: "По курсу банка" },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </FullScreenModal>
);

// ---- Main PaymentsPage ----
interface PaymentsPageProps {
  onPayment: (amount: number, provider: string) => void;
  transactions: Transaction[];
  balance: number;
  accounts: Account[];
  userName: string;
  cardNumber: string;
  onTransfer: (amount: number, recipient: string) => void;
  onSBPTransfer: (amount: number, recipient: string) => void;
  onQRReceive: (amount: number, sender: string) => void;
}

const PaymentsPage = ({ onPayment, transactions, balance, accounts, userName, cardNumber, onTransfer, onSBPTransfer, onQRReceive }: PaymentsPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{ icon: LucideIcon; label: string; color: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAutoPaymentsOpen, setIsAutoPaymentsOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCurrencyExchangeOpen, setIsCurrencyExchangeOpen] = useState(false);
  const [isSBPOpen, setIsSBPOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSBPInfoOpen, setIsSBPInfoOpen] = useState(false);
  const [isTariffsOpen, setIsTariffsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const transferCards = [
    { icon: QrCode, label: "По QR-коду", action: () => setIsQROpen(true) },
    { icon: Globe, label: "В другую страну", action: () => setIsCurrencyExchangeOpen(true) },
    { icon: CreditCard, label: "По номеру карты", action: () => setIsTransferOpen(true) },
    { icon: CircleDollarSign, label: "В валюту или металлы", action: () => setIsCurrencyExchangeOpen(true) },
    { icon: FileText, label: "По реквизитам", action: () => setIsTransferOpen(true) },
    { icon: ArrowLeftRight, label: "Между счетами", action: () => setIsTransferOpen(true) },
  ];

  const paymentItems = [
    { icon: Smartphone, label: "Мобильная связь", color: "bg-primary/10 text-primary" },
    { icon: Home, label: "ЖКХ", color: "bg-primary/10 text-primary" },
    { icon: Landmark, label: "В бюджет", color: "bg-primary/10 text-primary" },
    { icon: PhoneCall, label: "Домашний телефон", color: "bg-primary/10 text-primary" },
    { icon: Wifi, label: "Интернет и ТВ", color: "bg-primary/10 text-primary" },
    { icon: Ticket, label: "Билеты и путешествия", color: "bg-primary/10 text-primary" },
    { icon: Building2, label: "Из другого банка", color: "bg-primary/10 text-primary" },
    { icon: MoreHorizontal, label: "Ещё", color: "bg-primary/10 text-primary" },
  ];

  const handleCategoryClick = (cat: { icon: LucideIcon; label: string; color: string }) => {
    setSelectedCategory(cat);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-0 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Платежи</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Search className="w-6 h-6 text-foreground" />
          </button>
          <button 
            onClick={() => setIsBarcodeScannerOpen(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ScanBarcode className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск платежей..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
        </div>
      )}

      {/* Перевести по номеру телефона */}
      <div className="bg-card mx-0 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-3">Перевести по номеру телефона</h2>
        <button 
          onClick={() => setIsSBPOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-muted rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">▶</span>
              </div>
            </div>
            <span className="text-muted-foreground">В РСХБ или другой банк</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span className="text-sm">+7</span>
          </div>
        </button>
      </div>

      {/* На оплату */}
      <div className="bg-card mx-0 mt-2 px-4 py-4">
        <button 
          onClick={() => setIsAutoPaymentsOpen(true)}
          className="flex items-center gap-3 w-full"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-foreground font-medium">На оплату</span>
        </button>
      </div>

      {/* Перевести - Grid */}
      <div className="bg-card mx-0 mt-2 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-4">Перевести</h2>
        <div className="grid grid-cols-3 gap-3">
          {transferCards.map((card, idx) => (
            <button
              key={`${card.label}-${idx}`}
              onClick={card.action}
              className="bg-muted rounded-2xl p-3 flex flex-col items-start justify-between aspect-square hover:bg-muted/80 transition-colors"
            >
              <span className="text-xs font-medium text-foreground leading-tight">{card.label}</span>
              <div className="self-end mt-auto">
                <card.icon className="w-8 h-8 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Оплатить */}
      <div className="bg-card mx-0 mt-2 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-3">Оплатить</h2>
        <div className="space-y-1">
          {paymentItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleCategoryClick(item)}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Шаблоны и автоплатежи */}
      <div className="bg-card mx-0 mt-2 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-4">Быстрые действия</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsTemplatesOpen(true)}
            className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Шаблоны<br/>платежей</span>
            <div className="self-end mt-auto">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </button>
          <button
            onClick={() => setIsAutoPaymentsOpen(true)}
            className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Авто-<br/>платежи</span>
            <div className="self-end mt-auto">
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </button>
        </div>
      </div>

      {/* Полезная информация */}
      <div className="bg-card mx-0 mt-2 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-4">Полезная информация</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSBPInfoOpen(true)}
            className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors"
          >
            <span className="text-sm font-medium text-foreground leading-tight">Подробнее<br/>про СБП</span>
            <div className="self-end mt-auto">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">▶</span>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setIsTariffsOpen(true)}
            className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors"
          >
            <span className="text-sm font-medium text-foreground leading-tight">Условия<br/>и тарифы</span>
            <div className="self-end mt-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <PaymentCategoryModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        category={selectedCategory}
        onPayment={onPayment}
      />

      <AutoPaymentsModal
        isOpen={isAutoPaymentsOpen}
        onClose={() => setIsAutoPaymentsOpen(false)}
        onExecutePayment={onPayment}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        userName={userName}
        cardNumber={cardNumber}
        onReceive={onQRReceive}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        balance={balance}
        onTransfer={onTransfer}
      />

      <CurrencyExchangeModal
        isOpen={isCurrencyExchangeOpen}
        onClose={() => setIsCurrencyExchangeOpen(false)}
        balance={balance}
        onExchange={(amount, from, to) => onPayment(amount, `${from} → ${to}`)}
      />

      <SBPTransferModal
        isOpen={isSBPOpen}
        onClose={() => setIsSBPOpen(false)}
        balance={balance}
        onTransfer={onSBPTransfer}
      />

      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onPayment={onPayment}
      />

      <PaymentTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onPayment={onPayment}
      />

      <SBPInfoModal isOpen={isSBPInfoOpen} onClose={() => setIsSBPInfoOpen(false)} />
      <TariffsModal isOpen={isTariffsOpen} onClose={() => setIsTariffsOpen(false)} />
    </div>
  );
};

export default PaymentsPage;
