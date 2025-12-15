import { useState, useEffect } from "react";
import { X, Phone, Building2, Star, StarOff, Clock, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SavedRecipient {
  id: string;
  phone: string;
  name: string;
  bank: string;
  isFavorite: boolean;
}

interface SBPTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onTransfer: (amount: number, recipient: string, bank: string) => void;
}

const STORAGE_KEY = "sbp_recipients";

const banks = [
  { id: "sber", name: "Сбербанк", color: "bg-green-600" },
  { id: "vtb", name: "ВТБ", color: "bg-blue-600" },
  { id: "alpha", name: "Альфа-Банк", color: "bg-red-600" },
  { id: "tinkoff", name: "Тинькофф", color: "bg-yellow-500" },
  { id: "raiff", name: "Райффайзен", color: "bg-yellow-600" },
  { id: "gazprom", name: "Газпромбанк", color: "bg-blue-800" },
  { id: "open", name: "Открытие", color: "bg-teal-600" },
  { id: "rosbank", name: "Росбанк", color: "bg-red-700" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+7 (${digits}`;
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

const SBPTransferModal = ({ isOpen, onClose, balance, onTransfer }: SBPTransferModalProps) => {
  const [step, setStep] = useState<"phone" | "bank" | "amount" | "confirm">("phone");
  const [phone, setPhone] = useState("");
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedRecipients(JSON.parse(saved));
    }
  }, []);

  const saveRecipients = (updated: SavedRecipient[]) => {
    setSavedRecipients(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const filteredRecipients = savedRecipients.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  ).sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      setPhone(digits.startsWith("7") ? digits : "7" + digits);
    }
  };

  const handleSelectRecipient = (recipient: SavedRecipient) => {
    setPhone(recipient.phone);
    setSelectedBank(banks.find(b => b.name === recipient.bank) || null);
    setRecipientName(recipient.name);
    setStep("amount");
    setShowHistory(false);
  };

  const handleBankSelect = (bank: typeof banks[0]) => {
    setSelectedBank(bank);
    // Simulate recipient name lookup
    const names = ["Иван И.", "Мария П.", "Алексей С.", "Екатерина К.", "Дмитрий В."];
    setRecipientName(names[Math.floor(Math.random() * names.length)]);
    setStep("amount");
  };

  const handleConfirm = () => {
    const transferAmount = parseFloat(amount);
    if (transferAmount > balance) {
      toast({ title: "Ошибка", description: "Недостаточно средств", variant: "destructive" });
      return;
    }

    // Save recipient
    const existingIndex = savedRecipients.findIndex(r => r.phone === phone && r.bank === selectedBank?.name);
    if (existingIndex === -1 && selectedBank) {
      const newRecipient: SavedRecipient = {
        id: Date.now().toString(),
        phone,
        name: recipientName,
        bank: selectedBank.name,
        isFavorite: false,
      };
      saveRecipients([newRecipient, ...savedRecipients]);
    }

    onTransfer(transferAmount, `${recipientName} (${formatPhone(phone)})`, selectedBank?.name || "");
    toast({ 
      title: "Перевод выполнен", 
      description: `${formatCurrency(transferAmount)} ₽ → ${recipientName}` 
    });
    handleClose();
  };

  const toggleFavorite = (id: string) => {
    const updated = savedRecipients.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    saveRecipients(updated);
  };

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setSelectedBank(null);
    setAmount("");
    setRecipientName("");
    setSearchQuery("");
    setShowHistory(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Перевод по СБП</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {["phone", "bank", "amount", "confirm"].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ["phone", "bank", "amount", "confirm"].indexOf(step) >= i
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === "phone" && (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={formatPhone(phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full pl-12 pr-4 py-4 bg-muted rounded-xl text-foreground text-lg placeholder:text-muted-foreground"
              />
            </div>

            {showHistory && savedRecipients.length > 0 && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по истории"
                    className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Недавние получатели
                  </p>
                  {filteredRecipients.slice(0, 5).map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => handleSelectRecipient(recipient)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {recipient.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">{formatPhone(recipient.phone)} • {recipient.bank}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipient.id);
                        }}
                        className="p-2"
                      >
                        {recipient.isFavorite ? (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Button
              className="w-full"
              onClick={() => setStep("bank")}
              disabled={phone.length < 11}
            >
              Продолжить
            </Button>
          </div>
        )}

        {step === "bank" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Выберите банк получателя</p>
            <div className="grid grid-cols-2 gap-2">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${bank.color} flex items-center justify-center`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-foreground text-sm">{bank.name}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep("phone")}>
              Назад
            </Button>
          </div>
        )}

        {step === "amount" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${selectedBank?.color} flex items-center justify-center`}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">{recipientName}</p>
                <p className="text-sm text-muted-foreground">{formatPhone(phone)} • {selectedBank?.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Сумма перевода</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">₽</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-muted rounded-xl text-foreground"
                />
              </div>
              <p className="text-sm text-muted-foreground">Доступно: {formatCurrency(balance)} ₽</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("bank")}>
                Назад
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep("confirm")}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Продолжить
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Получатель</span>
                <span className="font-medium text-foreground">{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон</span>
                <span className="font-medium text-foreground">{formatPhone(phone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Банк</span>
                <span className="font-medium text-foreground">{selectedBank?.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Сумма</span>
                <span className="text-xl font-bold text-foreground">{formatCurrency(parseFloat(amount))} ₽</span>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Перевод через Систему быстрых платежей. Комиссия: 0 ₽
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("amount")}>
                Назад
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                <Check className="w-4 h-4 mr-2" />
                Подтвердить
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SBPTransferModal;
