import { useState } from "react";
import { X, Search, ScanBarcode, Phone, Bell, QrCode, ArrowLeftRight, Globe, CreditCard, CircleDollarSign, FileText, Smartphone, Home, Landmark, PhoneCall, Wifi, Ticket, Building2, MoreHorizontal, ChevronRight, Check, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AutoPaymentsModal from "./AutoPaymentsModal";
import QRCodeModal from "./QRCodeModal";
import InternalTransferModal from "./InternalTransferModal";
import TransferModal from "./TransferModal";
import CurrencyExchangeModal from "./CurrencyExchangeModal";
import SBPTransferModal from "./SBPTransferModal";
import BarcodeScannerModal from "./BarcodeScannerModal";
import type { Transaction } from "./TransactionList";
import type { Account } from "./AccountsList";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { icon: any; label: string; color: string } | null;
  onPayment: (amount: number, provider: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const PaymentModal = ({ isOpen, onClose, category, onPayment }: PaymentModalProps) => {
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

  if (!isOpen || !category) return null;

  const IconComponent = category.icon;
  const categoryProviders = providers[category.label] || ["Поставщик 1", "Поставщик 2", "Поставщик 3"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{category.label}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
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

        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Номер лицевого счёта</p>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Введите номер"
            className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-3 mb-6">
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
    </div>
  );
};

interface PaymentsPageProps {
  onPayment: (amount: number, provider: string) => void;
  transactions: Transaction[];
  balance: number;
  accounts: Account[];
  userName: string;
  cardNumber: string;
  onTransfer: (amount: number, recipient: string) => void;
  onInternalTransfer: (fromId: string, toId: string, amount: number) => void;
  onSBPTransfer: (amount: number, recipient: string) => void;
  onQRReceive: (amount: number, sender: string) => void;
}

const PaymentsPage = ({ onPayment, transactions, balance, accounts, userName, cardNumber, onTransfer, onInternalTransfer, onSBPTransfer, onQRReceive }: PaymentsPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{ icon: LucideIcon; label: string; color: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAutoPaymentsOpen, setIsAutoPaymentsOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isInternalTransferOpen, setIsInternalTransferOpen] = useState(false);
  const [isCurrencyExchangeOpen, setIsCurrencyExchangeOpen] = useState(false);
  const [isSBPOpen, setIsSBPOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const transferCards = [
    { icon: QrCode, label: "По QR-коду", action: () => setIsQROpen(true) },
    { icon: ArrowLeftRight, label: "Между счетами", action: () => setIsInternalTransferOpen(true) },
    { icon: Globe, label: "В другую страну", action: () => setIsCurrencyExchangeOpen(true) },
    { icon: CreditCard, label: "По номеру карты", action: () => setIsTransferOpen(true) },
    { icon: CircleDollarSign, label: "В валюту или металлы", action: () => setIsCurrencyExchangeOpen(true) },
    { icon: FileText, label: "По реквизитам", action: () => setIsTransferOpen(true) },
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
          {transferCards.map((card) => (
            <button
              key={card.label}
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

      {/* Автоплатежи */}
      <div className="bg-card mx-0 mt-2 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-4">Автоплатежи</h2>
        <button
          onClick={() => setIsAutoPaymentsOpen(true)}
          className="bg-muted rounded-2xl p-4 w-40 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Автоплатежи</span>
          <div className="self-end mt-auto">
            <Bell className="w-10 h-10 text-primary" />
          </div>
        </button>
      </div>

      {/* Полезная информация */}
      <div className="bg-card mx-0 mt-2 px-4 py-5">
        <h2 className="text-lg font-bold text-foreground mb-4">Полезная информация</h2>
        <div className="flex gap-3">
          <button className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors">
            <span className="text-sm font-medium text-foreground leading-tight">Подробнее<br/>про СБП</span>
            <div className="self-end mt-auto">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">▶</span>
              </div>
            </div>
          </button>
          <button className="flex-1 bg-muted rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-muted/80 transition-colors">
            <span className="text-sm font-medium text-foreground leading-tight">Условия<br/>и тарифы</span>
            <div className="self-end mt-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
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

      <InternalTransferModal
        isOpen={isInternalTransferOpen}
        onClose={() => setIsInternalTransferOpen(false)}
        accounts={accounts}
        onTransfer={onInternalTransfer}
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
    </div>
  );
};

export default PaymentsPage;
