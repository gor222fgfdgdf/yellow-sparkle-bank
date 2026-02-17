import { useState } from "react";
import { X, Bell, CreditCard, Shield, Megaphone, CheckCheck, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import type { LucideIcon } from "lucide-react";

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, { icon: LucideIcon; color: string }> = {
  transaction: { icon: CreditCard, color: "bg-primary" },
  security: { icon: Shield, color: "bg-destructive" },
  promo: { icon: Megaphone, color: "bg-accent-foreground" },
  system: { icon: Bell, color: "bg-muted-foreground" },
};

const typeLabels: Record<string, string> = {
  transaction: "Операции",
  security: "Безопасность",
  promo: "Акции",
  system: "Система",
};

const NotificationsCenter = ({ isOpen, onClose }: NotificationsCenterProps) => {
  const [filter, setFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = filter
    ? notifications.filter(n => n.type === filter)
    : notifications;

  const handleMarkAsRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllRead.mutate();
    toast({ title: "Готово", description: "Все уведомления прочитаны" });
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
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
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? "text-primary" : ""}>
            <Filter className="w-4 h-4 mr-1" />
            Фильтры
          </Button>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Прочитать все
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
                filter === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Все
            </button>
            {Object.entries(typeLabels).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
              const typeData = typeIcons[notification.type] || typeIcons.system;
              const IconComponent = typeData.icon;

              return (
                <div
                  key={notification.id}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  className={`p-4 rounded-xl transition-colors cursor-pointer group ${
                    notification.is_read ? "bg-muted/30" : "bg-muted/70"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full ${typeData.color} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium text-foreground ${!notification.is_read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                          className="p-1 hover:bg-background rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {!notification.is_read && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
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
