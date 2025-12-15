import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Bell, CreditCard, Receipt, Repeat, ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  amount?: number;
  type: "payment" | "income" | "reminder";
  date: Date;
  isRecurring: boolean;
  frequency?: "monthly" | "weekly" | "yearly";
  isPaid?: boolean;
}

interface FinancialCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinancialCalendarModal = ({ isOpen, onClose }: FinancialCalendarModalProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", title: "Зарплата", amount: 500000, type: "income", date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), isRecurring: true, frequency: "monthly" },
    { id: "2", title: "Аренда квартиры", amount: 45000, type: "payment", date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), isRecurring: true, frequency: "monthly" },
    { id: "3", title: "Яндекс.Плюс", amount: 299, type: "payment", date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), isRecurring: true, frequency: "monthly" },
    { id: "4", title: "Netflix", amount: 1190, type: "payment", date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20), isRecurring: true, frequency: "monthly" },
    { id: "5", title: "Страховка ОСАГО", amount: 12000, type: "payment", date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15), isRecurring: true, frequency: "yearly" },
    { id: "6", title: "Оплатить налог", type: "reminder", date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25), isRecurring: false },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    amount: "",
    type: "payment" as "payment" | "income" | "reminder",
    isRecurring: false,
    frequency: "monthly" as "monthly" | "weekly" | "yearly",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday=0
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) {
      toast({ title: "Ошибка", description: "Выберите дату и введите название", variant: "destructive" });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      amount: newEvent.amount ? Number(newEvent.amount) : undefined,
      type: newEvent.type,
      date: selectedDate,
      isRecurring: newEvent.isRecurring,
      frequency: newEvent.isRecurring ? newEvent.frequency : undefined,
    };

    setEvents([...events, event]);
    setIsAddingEvent(false);
    setNewEvent({ title: "", amount: "", type: "payment", isRecurring: false, frequency: "monthly" });
    toast({ title: "Событие добавлено" });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast({ title: "Событие удалено" });
  };

  const handleMarkAsPaid = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, isPaid: true } : e));
    toast({ title: "Отмечено как оплачено" });
  };

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date() && !e.isPaid)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const totalExpenses = events
    .filter(e => e.type === "payment" && e.amount && new Date(e.date).getMonth() === currentDate.getMonth())
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalIncome = events
    .filter(e => e.type === "income" && e.amount && new Date(e.date).getMonth() === currentDate.getMonth())
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  if (isAddingEvent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setIsAddingEvent(false)} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              Новое событие
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Дата</p>
              <p className="text-lg font-semibold">
                {selectedDate?.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Например: Оплата интернета"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тип</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "payment", label: "Расход", icon: CreditCard },
                  { value: "income", label: "Доход", icon: Receipt },
                  { value: "reminder", label: "Напоминание", icon: Bell },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setNewEvent({ ...newEvent, type: value as any })}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      newEvent.type === value ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${newEvent.type === value ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-xs font-medium">{label}</p>
                  </button>
                ))}
              </div>
            </div>

            {newEvent.type !== "reminder" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Сумма (₽)</label>
                <Input
                  type="number"
                  value={newEvent.amount}
                  onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}

            <button
              onClick={() => setNewEvent({ ...newEvent, isRecurring: !newEvent.isRecurring })}
              className={`w-full p-4 rounded-xl border-2 transition-colors ${
                newEvent.isRecurring ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <Repeat className={`w-5 h-5 ${newEvent.isRecurring ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left flex-1">
                  <p className="font-medium">Повторять</p>
                  <p className="text-sm text-muted-foreground">Регулярное событие</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  newEvent.isRecurring ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {newEvent.isRecurring && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
            </button>

            {newEvent.isRecurring && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "weekly", label: "Еженедельно" },
                  { value: "monthly", label: "Ежемесячно" },
                  { value: "yearly", label: "Ежегодно" },
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={newEvent.frequency === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewEvent({ ...newEvent, frequency: value as any })}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}

            <Button className="w-full" onClick={handleAddEvent}>
              Добавить событие
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Финансовый календарь
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Доходы</p>
              <p className="text-lg font-bold text-success">+{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Расходы</p>
              <p className="text-lg font-bold text-destructive">-{formatCurrency(totalExpenses)}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-muted rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-muted rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative ${
                      isSelected ? "bg-primary text-primary-foreground" : 
                      isToday ? "bg-primary/10 text-primary" : 
                      "hover:bg-muted"
                    }`}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div
                            key={idx}
                            className={`w-1 h-1 rounded-full ${
                              e.type === "income" ? "bg-success" : 
                              e.type === "payment" ? "bg-destructive" : 
                              "bg-warning"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                </h4>
                <Button size="sm" variant="outline" onClick={() => setIsAddingEvent(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>

              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className={`p-3 rounded-xl ${event.isPaid ? "bg-muted" : "bg-card"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.type === "income" ? "bg-success/10" : 
                        event.type === "payment" ? "bg-destructive/10" : 
                        "bg-warning/10"
                      }`}>
                        {event.type === "income" ? <Receipt className="w-5 h-5 text-success" /> :
                         event.type === "payment" ? <CreditCard className="w-5 h-5 text-destructive" /> :
                         <Bell className="w-5 h-5 text-warning" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${event.isPaid ? "line-through text-muted-foreground" : ""}`}>
                          {event.title}
                        </p>
                        {event.isRecurring && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Repeat className="w-3 h-3" />
                            {event.frequency === "monthly" ? "Ежемесячно" : 
                             event.frequency === "weekly" ? "Еженедельно" : "Ежегодно"}
                          </p>
                        )}
                      </div>
                      {event.amount && (
                        <p className={`font-semibold ${
                          event.type === "income" ? "text-success" : "text-destructive"
                        }`}>
                          {event.type === "income" ? "+" : "-"}{formatCurrency(event.amount)}
                        </p>
                      )}
                    </div>
                    {!event.isPaid && event.type === "payment" && (
                      <div className="flex gap-2 mt-2 pt-2 border-t">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleMarkAsPaid(event.id)}>
                          <Check className="w-4 h-4 mr-1" />
                          Оплачено
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Нет событий</p>
                </div>
              )}
            </div>
          )}

          {upcomingEvents.length > 0 && !selectedDate && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Ближайшие события</h4>
              {upcomingEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedDate(new Date(event.date))}
                  className="w-full p-3 bg-card rounded-xl flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    event.type === "income" ? "bg-success/10" : 
                    event.type === "payment" ? "bg-destructive/10" : 
                    "bg-warning/10"
                  }`}>
                    {event.type === "income" ? <Receipt className="w-4 h-4 text-success" /> :
                     event.type === "payment" ? <CreditCard className="w-4 h-4 text-destructive" /> :
                     <Bell className="w-4 h-4 text-warning" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  {event.amount && (
                    <p className={`font-semibold text-sm ${
                      event.type === "income" ? "text-success" : "text-destructive"
                    }`}>
                      {event.type === "income" ? "+" : "-"}{formatCurrency(event.amount)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialCalendarModal;
