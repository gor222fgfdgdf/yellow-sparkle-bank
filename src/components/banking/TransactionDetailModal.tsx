import { X, Calendar, Tag, CreditCard, Clock, MapPin, Receipt, Copy, Share2, Flag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  isIncoming: boolean;
  icon: any;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const formatDate = (dateString: string) => {
  // Handle Russian date formats like "15 дек", "Сегодня", "Вчера"
  if (dateString === "Сегодня") {
    return new Date().toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  if (dateString === "Вчера") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  // Try parsing ISO date format first (YYYY-MM-DD)
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  // Handle Russian short format "15 дек"
  const monthMap: Record<string, number> = {
    "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
    "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
  };
  
  const parts = dateString.split(" ");
  if (parts.length >= 2) {
    const day = parseInt(parts[0]);
    const monthStr = parts[1].toLowerCase().slice(0, 3);
    const month = monthMap[monthStr];
    
    if (!isNaN(day) && month !== undefined) {
      const year = new Date().getFullYear();
      const date = new Date(year, month, day);
      return date.toLocaleDateString("ru-RU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }
  
  // Fallback: return the original string
  return dateString;
};

const formatTime = () => {
  const hours = Math.floor(Math.random() * 12) + 8;
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const TransactionDetailModal = ({ isOpen, onClose, transaction }: TransactionDetailModalProps) => {
  if (!isOpen || !transaction) return null;

  const IconComponent = transaction.icon;
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    toast.success("ID операции скопирован");
  };

  const handleShare = async () => {
    const text = `${transaction.name}\n${transaction.isIncoming ? "+" : "-"}${formatCurrency(transaction.amount)} ₽\n${formatDate(transaction.date)}`;
    
    if (navigator.share) {
      await navigator.share({ title: "Детали операции", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Информация скопирована");
    }
  };

  const handleReport = () => {
    toast.info("Заявка на оспаривание отправлена");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-background rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Детали операции</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Info */}
          <div className="p-6 text-center border-b border-border">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              transaction.isIncoming ? "bg-green-500/10" : "bg-muted"
            }`}>
              <IconComponent className={`w-8 h-8 ${transaction.isIncoming ? "text-green-600" : "text-muted-foreground"}`} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{transaction.name}</h3>
            <p className="text-muted-foreground mb-4">{transaction.category}</p>
            <p className={`text-3xl font-bold ${transaction.isIncoming ? "text-green-600" : "text-foreground"}`}>
              {transaction.isIncoming ? "+" : "-"}{formatCurrency(transaction.amount)} ₽
            </p>
          </div>

          {/* Details */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Дата</p>
                <p className="font-medium text-foreground">{formatDate(transaction.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Время</p>
                <p className="font-medium text-foreground">{formatTime()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Tag className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Категория</p>
                <p className="font-medium text-foreground">{transaction.category}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Способ оплаты</p>
                <p className="font-medium text-foreground">Union Pay •••• 7823</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">ID операции</p>
                <p className="font-medium text-foreground font-mono text-sm">{transaction.id.slice(0, 8)}...{transaction.id.slice(-4)}</p>
              </div>
              <button onClick={handleCopyId} className="p-2 hover:bg-muted rounded-full transition-colors">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {transaction.isIncoming && (
              <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Отправитель</p>
                  <p className="font-medium text-foreground">{transaction.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Cashback info for expenses (exclude internal transfers) */}
          {!transaction.isIncoming && 
           !transaction.category.toLowerCase().includes("перевод") && 
           !transaction.category.toLowerCase().includes("пополнение") && (
            <div className="mx-4 mb-4 p-4 bg-primary/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Кэшбэк по операции</p>
                  <p className="font-bold text-primary">+{formatCurrency(Math.round(transaction.amount * 0.01))} ₽</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Категория</p>
                  <p className="font-medium text-foreground">1%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReport}
            >
              <Flag className="w-4 h-4 mr-2" />
              Оспорить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
