import { useState } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Copy, Share2, Check, Heart, ArrowUpRight, ArrowDownRight, Link2 } from "lucide-react";
import { toast } from "sonner";


interface TipTransaction {
  id: string;
  type: "received" | "sent";
  name: string;
  amount: number;
  message?: string;
  date: string;
}

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const tipTransactions: TipTransaction[] = [
  { id: "1", type: "received", name: "Анонимный", amount: 500, message: "Спасибо за отличный сервис!", date: "12 дек" },
  { id: "2", type: "sent", name: "Курьеру Яндекс Еда", amount: 200, date: "10 дек" },
  { id: "3", type: "received", name: "Мария К.", amount: 300, message: "На кофе ☕", date: "8 дек" },
  { id: "4", type: "sent", name: "Бариста", amount: 150, date: "5 дек" },
];

const quickAmounts = [50, 100, 200, 500];

const TipsModal = ({ isOpen, onClose, userName }: TipsModalProps) => {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipientLink, setRecipientLink] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const personalLink = `https://tips.tinkoff.ru/${userName.toLowerCase().replace(" ", "")}`;
  const totalReceived = tipTransactions.filter(t => t.type === "received").reduce((sum, t) => sum + t.amount, 0);
  const totalSent = tipTransactions.filter(t => t.type === "sent").reduce((sum, t) => sum + t.amount, 0);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Ссылка скопирована!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Оставьте чаевые",
        text: `Оставьте чаевые для ${userName}`,
        url: personalLink,
      });
    } else {
      copyToClipboard(personalLink);
    }
  };

  const handleSendTip = async () => {
    if (!recipientLink || !sendAmount) {
      toast.error("Заполните все поля");
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Чаевые ${sendAmount} ₽ отправлены!`);
    setIsProcessing(false);
    setIsSending(false);
    setRecipientLink("");
    setSendAmount("");
    setSendMessage("");
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Чаевые и донаты">
      <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success/10 rounded-xl p-4 text-center">
              <ArrowDownRight className="w-6 h-6 text-success mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{totalReceived.toLocaleString("ru-RU")} ₽</p>
              <p className="text-sm text-muted-foreground">Получено</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <ArrowUpRight className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{totalSent.toLocaleString("ru-RU")} ₽</p>
              <p className="text-sm text-muted-foreground">Отправлено</p>
            </div>
          </div>

          {isSending ? (
            <div className="space-y-4">
              <button onClick={() => setIsSending(false)} className="text-primary text-sm">
                ← Назад
              </button>

              <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
                <h3 className="font-semibold text-foreground">Отправить чаевые</h3>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ссылка или телефон получателя</p>
                  <Input
                    value={recipientLink}
                    onChange={(e) => setRecipientLink(e.target.value)}
                    placeholder="tips.tinkoff.ru/name или +7..."
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Сумма</p>
                  <div className="flex gap-2 mb-2">
                    {quickAmounts.map(amount => (
                      <Button
                        key={amount}
                        variant={sendAmount === amount.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSendAmount(amount.toString())}
                        className="flex-1"
                      >
                        {amount}₽
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="Другая сумма"
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Сообщение (необязательно)</p>
                  <Input
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    placeholder="Спасибо за отличный сервис!"
                  />
                </div>

                <Button onClick={handleSendTip} className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Отправка..." : `Отправить ${sendAmount || "0"} ₽`}
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="receive">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="receive">Получить</TabsTrigger>
                <TabsTrigger value="send">Отправить</TabsTrigger>
                <TabsTrigger value="history">История</TabsTrigger>
              </TabsList>

              <TabsContent value="receive" className="space-y-4">
                {/* QR Code */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeComponent value={personalLink} size={180} />
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground text-sm mb-4">
                    Покажите QR-код, чтобы получить чаевые
                  </p>
                </div>

                {/* Personal Link */}
                <div className="bg-primary/10 rounded-2xl p-4">
                  <h3 className="font-semibold text-foreground mb-3">Ваша ссылка для чаевых</h3>
                  <div className="flex gap-2">
                    <Input
                      value={personalLink}
                      readOnly
                      className="bg-background text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(personalLink)}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button onClick={shareLink} className="w-full mt-3">
                    <Share2 className="w-4 h-4 mr-2" />
                    Поделиться ссылкой
                  </Button>
                </div>

                {/* Tips for tips */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">💡 Совет</h3>
                  <p className="text-sm text-muted-foreground">
                    Добавьте ссылку в профиль социальных сетей или распечатайте QR-код для получения чаевых
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="send" className="space-y-4">
                <div className="bg-card rounded-2xl p-6 border border-border text-center">
                  <Coffee className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Оставьте чаевые</h3>
                  <p className="text-muted-foreground mb-4">
                    Поблагодарите за хороший сервис
                  </p>
                  <Button onClick={() => setIsSending(true)} className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Отправить чаевые
                  </Button>
                </div>

                {/* Quick Recipients */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Быстрые действия</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setRecipientLink("Курьер Яндекс Еда");
                        setIsSending(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-foreground">Курьеру</p>
                        <p className="text-sm text-muted-foreground">Яндекс Еда, Delivery Club</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setRecipientLink("");
                        setIsSending(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-foreground">По ссылке</p>
                        <p className="text-sm text-muted-foreground">Введите ссылку или телефон</p>
                      </div>
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {tipTransactions.length > 0 ? (
                  tipTransactions.map(tx => (
                    <div key={tx.id} className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "received" ? "bg-success/10" : "bg-primary/10"
                          }`}>
                            {tx.type === "received" ? (
                              <ArrowDownRight className="w-5 h-5 text-success" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{tx.name}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${tx.type === "received" ? "text-success" : "text-foreground"}`}>
                          {tx.type === "received" ? "+" : "-"}{tx.amount} ₽
                        </span>
                      </div>
                      {tx.message && (
                        <p className="text-sm text-muted-foreground bg-muted rounded-lg p-2 mt-2">
                          "{tx.message}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">История пуста</h3>
                    <p className="text-muted-foreground">Отправьте или получите первые чаевые</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
      </div>
    </FullScreenModal>
  );
};

// Simple QR Code component
const QRCodeComponent = ({ value, size }: { value: string; size: number }) => (
  <div
    style={{
      width: size,
      height: size,
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg viewBox="0 0 100 100" width={size - 20} height={size - 20}>
      <rect x="0" y="0" width="30" height="30" fill="#000" />
      <rect x="70" y="0" width="30" height="30" fill="#000" />
      <rect x="0" y="70" width="30" height="30" fill="#000" />
      <rect x="5" y="5" width="20" height="20" fill="#fff" />
      <rect x="75" y="5" width="20" height="20" fill="#fff" />
      <rect x="5" y="75" width="20" height="20" fill="#fff" />
      <rect x="10" y="10" width="10" height="10" fill="#000" />
      <rect x="80" y="10" width="10" height="10" fill="#000" />
      <rect x="10" y="80" width="10" height="10" fill="#000" />
      <rect x="40" y="0" width="5" height="5" fill="#000" />
      <rect x="50" y="5" width="5" height="5" fill="#000" />
      <rect x="40" y="10" width="5" height="5" fill="#000" />
      <rect x="35" y="35" width="30" height="30" fill="#000" />
      <rect x="40" y="40" width="20" height="20" fill="#fff" />
      <rect x="45" y="45" width="10" height="10" fill="#000" />
    </svg>
  </div>
);

export default TipsModal;
