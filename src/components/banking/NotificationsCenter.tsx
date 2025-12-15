import { useState, useEffect } from "react";
import { X, Bell, CreditCard, Shield, Megaphone, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

interface Notification {
  id: string;
  type: "transaction" | "security" | "promo" | "system";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "banking_notifications";

const typeIcons: Record<string, { icon: LucideIcon; color: string }> = {
  transaction: { icon: CreditCard, color: "bg-blue-500" },
  security: { icon: Shield, color: "bg-red-500" },
  promo: { icon: Megaphone, color: "bg-purple-500" },
  system: { icon: Bell, color: "bg-gray-500" },
};

const typeLabels: Record<string, string> = {
  transaction: "Операции",
  security: "Безопасность",
  promo: "Акции",
  system: "Система",
};

const getInitialNotifications = (): Notification[] => [
  {
    id: "1",
    type: "transaction",
    title: "Покупка в Пятёрочка",
    message: "Списание 1 250 ₽ с карты *7823",
    date: "Сегодня, 14:32",
    isRead: false,
  },
  {
    id: "2",
    type: "transaction",
    title: "Входящий перевод",
    message: "Получен перевод 15 000 ₽ от Иван И.",
    date: "Сегодня, 12:15",
    isRead: false,
  },
  {
    id: "3",
    type: "security",
    title: "Вход в приложение",
    message: "Выполнен вход с нового устройства iPhone 15",
    date: "Вчера, 19:45",
    isRead: true,
  },
  {
    id: "4",
    type: "promo",
    title: "Кэшбэк 10% на АЗС",
    message: "Повышенный кэшбэк на все АЗС до конца месяца",
    date: "Вчера, 10:00",
    isRead: true,
  },
  {
    id: "5",
    type: "transaction",
    title: "Автоплатёж выполнен",
    message: "Оплата МТС на сумму 650 ₽",
    date: "2 дня назад",
    isRead: true,
  },
  {
    id: "6",
    type: "system",
    title: "Обновление приложения",
    message: "Доступна новая версия с улучшениями",
    date: "3 дня назад",
    isRead: true,
  },
  {
    id: "7",
    type: "security",
    title: "Смена пароля",
    message: "Пароль успешно изменён",
    date: "5 дней назад",
    isRead: true,
  },
  {
    id: "8",
    type: "promo",
    title: "Кредит под 9.9%",
    message: "Персональное предложение на кредит до 1 000 000 ₽",
    date: "Неделю назад",
    isRead: true,
  },
];

const NotificationsCenter = ({ isOpen, onClose }: NotificationsCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      setNotifications(getInitialNotifications());
    }
  }, []);

  const saveNotifications = (updated: Notification[]) => {
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = filter
    ? notifications.filter(n => n.type === filter)
    : notifications;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
    toast({ title: "Готово", description: "Все уведомления прочитаны" });
  };

  const deleteNotification = (id: string) => {
    saveNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    saveNotifications([]);
    toast({ title: "Уведомления очищены" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Уведомления</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "text-primary" : ""}
            >
              <Filter className="w-4 h-4 mr-1" />
              Фильтры
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Прочитать все
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-1" />
                Очистить
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Все
            </button>
            {Object.entries(typeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Нет уведомлений</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const typeData = typeIcons[notification.type];
              const IconComponent = typeData.icon;

              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 rounded-xl transition-colors cursor-pointer ${
                    notification.isRead ? "bg-muted/30" : "bg-muted/70"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full ${typeData.color} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium text-foreground ${!notification.isRead ? "font-semibold" : ""}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-background rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{notification.date}</span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      {notification.action && (
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0 h-auto mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                          }}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
