import { useState } from "react";
import { X, QrCode, Copy, Check, Scan, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  cardNumber: string;
  onReceive: (amount: number, sender: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const QRCodeModal = ({ isOpen, onClose, userName, cardNumber, onReceive }: QRCodeModalProps) => {
  const [mode, setMode] = useState<"show" | "scan">("show");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const qrData = `tinkoff://pay?card=${cardNumber}&name=${encodeURIComponent(userName)}${amount ? `&amount=${amount}` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Скопировано", description: "Ссылка для оплаты скопирована" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Перевод через QR",
          text: `Перевод для ${userName}`,
          url: qrData,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const randomAmount = Math.floor(Math.random() * 5000) + 500;
      const senders = ["Иван Иванов", "Мария Петрова", "Алексей Сидоров", "Екатерина Козлова"];
      const sender = senders[Math.floor(Math.random() * senders.length)];
      
      onReceive(randomAmount, sender);
      toast({ 
        title: "QR-код распознан", 
        description: `Получен перевод ${formatCurrency(randomAmount)} ₽ от ${sender}` 
      });
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">QR-код для платежей</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => setMode("show")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "show" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Показать
          </button>
          <button
            onClick={() => setMode("scan")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === "scan" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Scan className="w-4 h-4" />
            Сканировать
          </button>
        </div>

        {mode === "show" ? (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center">
              <div className="w-48 h-48 bg-foreground/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Simulated QR Code Pattern */}
                <div className="absolute inset-4 grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"}`}
                    />
                  ))}
                </div>
                {/* Center Logo */}
                <div className="absolute w-12 h-12 bg-primary rounded-lg flex items-center justify-center z-10">
                  <span className="text-primary-foreground font-bold text-lg">T</span>
                </div>
              </div>
              <p className="mt-4 font-medium text-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground">**** {cardNumber}</p>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Сумма (опционально)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-foreground">₽</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Укажите сумму, чтобы отправителю не нужно было её вводить
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Скопировано" : "Копировать"}
              </Button>
              <Button className="flex-1" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scanner View */}
            <div className="bg-foreground/5 rounded-2xl aspect-square flex flex-col items-center justify-center relative overflow-hidden">
              {scanning ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-bounce" />
                  <p className="text-foreground font-medium z-10">Сканирование...</p>
                </>
              ) : (
                <>
                  <Scan className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center px-8">
                    Наведите камеру на QR-код для перевода
                  </p>
                </>
              )}
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary" />
            </div>

            <Button className="w-full" onClick={simulateScan} disabled={scanning}>
              {scanning ? "Сканирование..." : "Сканировать QR-код"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Это демо-режим. В реальном приложении здесь будет камера устройства.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;
