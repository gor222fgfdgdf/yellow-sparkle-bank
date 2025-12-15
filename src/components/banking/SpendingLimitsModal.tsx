import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, AlertTriangle, Check } from "lucide-react";

export interface SpendingLimit {
  category: string;
  limit: number;
  enabled: boolean;
}

interface SpendingLimitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limits: SpendingLimit[];
  onSaveLimits: (limits: SpendingLimit[]) => void;
  categories: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Продукты": "#22c55e",
  "Кафе": "#f59e0b",
  "Транспорт": "#3b82f6",
  "Жильё": "#8b5cf6",
  "ЖКХ": "#06b6d4",
  "Покупки": "#ec4899",
  "Развлечения": "#f43f5e",
  "Подписки": "#a855f7",
  "Связь": "#14b8a6",
  "Здоровье": "#ef4444",
  "Спорт": "#10b981",
  "Образование": "#6366f1",
  "Другое": "#6b7280",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const SpendingLimitsModal = ({
  open,
  onOpenChange,
  limits,
  onSaveLimits,
  categories,
}: SpendingLimitsModalProps) => {
  const [localLimits, setLocalLimits] = useState<SpendingLimit[]>([]);

  useEffect(() => {
    if (open) {
      const existingLimitsMap = new Map(limits.map(l => [l.category, l]));
      const allLimits = categories.map(cat => {
        const existing = existingLimitsMap.get(cat);
        return existing || { category: cat, limit: 0, enabled: false };
      });
      setLocalLimits(allLimits);
    }
  }, [open, limits, categories]);

  const handleLimitChange = (category: string, value: string) => {
    const numValue = parseInt(value.replace(/\D/g, "")) || 0;
    setLocalLimits(prev =>
      prev.map(l => (l.category === category ? { ...l, limit: numValue } : l))
    );
  };

  const handleToggle = (category: string) => {
    setLocalLimits(prev =>
      prev.map(l => (l.category === category ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const handleSave = () => {
    onSaveLimits(localLimits.filter(l => l.limit > 0));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Лимиты расходов
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Установите лимиты для категорий. Вы получите уведомление при превышении.
        </p>

        <div className="space-y-3">
          {localLimits.map((item) => {
            const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Другое"];
            return (
              <div
                key={item.category}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="text"
                      value={item.limit > 0 ? formatCurrency(item.limit) : ""}
                      onChange={(e) => handleLimitChange(item.category, e.target.value)}
                      placeholder="Лимит в ₽"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={() => handleToggle(item.category)}
                  disabled={item.limit === 0}
                />
              </div>
            );
          })}
        </div>

        <Button onClick={handleSave} className="w-full mt-4">
          Сохранить
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export interface LimitAlert {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}

interface LimitAlertsProps {
  alerts: LimitAlert[];
  onDismiss: (category: string) => void;
}

export const LimitAlerts = ({ alerts, onDismiss }: LimitAlertsProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => {
        const color = CATEGORY_COLORS[alert.category] || CATEGORY_COLORS["Другое"];
        const isExceeded = alert.percentage >= 100;
        const isWarning = alert.percentage >= 80 && alert.percentage < 100;

        return (
          <div
            key={alert.category}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              isExceeded ? "bg-red-500/10" : "bg-amber-500/10"
            }`}
          >
            <div className={`p-2 rounded-full ${isExceeded ? "bg-red-500/20" : "bg-amber-500/20"}`}>
              <AlertTriangle className={`w-4 h-4 ${isExceeded ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isExceeded ? "text-red-500" : "text-amber-500"}`}>
                {isExceeded ? "Лимит превышен" : "Приближение к лимиту"}
              </p>
              <p className="text-xs text-muted-foreground">
                {alert.category}: {formatCurrency(alert.spent)} / {formatCurrency(alert.limit)} ₽ ({alert.percentage.toFixed(0)}%)
              </p>
            </div>
            <button
              onClick={() => onDismiss(alert.category)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <Check className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SpendingLimitsModal;
