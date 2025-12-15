import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Filter, ChevronRight, ShoppingCart, Coffee, Car, Utensils, ShoppingBag } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface TransactionWithLocation {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  location: Location;
  icon: any;
}

interface GeolocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, any> = {
  "Продукты": ShoppingCart,
  "Рестораны": Utensils,
  "Кофейни": Coffee,
  "Транспорт": Car,
  "Покупки": ShoppingBag,
};

const mockLocations: TransactionWithLocation[] = [
  {
    id: "1",
    name: "Пятёрочка",
    amount: -3450,
    category: "Продукты",
    date: "Сегодня, 14:32",
    location: { lat: 55.7558, lng: 37.6173, address: "ул. Тверская, 15" },
    icon: ShoppingCart,
  },
  {
    id: "2",
    name: "Кофемания",
    amount: -650,
    category: "Кофейни",
    date: "Сегодня, 10:15",
    location: { lat: 55.7539, lng: 37.6208, address: "Камергерский пер., 6" },
    icon: Coffee,
  },
  {
    id: "3",
    name: "Яндекс.Такси",
    amount: -890,
    category: "Транспорт",
    date: "Вчера, 22:45",
    location: { lat: 55.7601, lng: 37.6188, address: "Пушкинская пл." },
    icon: Car,
  },
  {
    id: "4",
    name: "Перекрёсток",
    amount: -5670,
    category: "Продукты",
    date: "Вчера, 18:20",
    location: { lat: 55.7512, lng: 37.6184, address: "ул. Петровка, 20" },
    icon: ShoppingCart,
  },
  {
    id: "5",
    name: "Шоколадница",
    amount: -420,
    category: "Кофейни",
    date: "2 дня назад",
    location: { lat: 55.7545, lng: 37.6150, address: "Тверской бул., 9" },
    icon: Coffee,
  },
];

const GeolocationModal = ({ isOpen, onClose }: GeolocationModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithLocation | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const categories = Array.from(new Set(mockLocations.map((t) => t.category)));
  
  const filteredTransactions = selectedCategory
    ? mockLocations.filter((t) => t.category === selectedCategory)
    : mockLocations;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Math.abs(amount));
  };

  const getCategoryTotal = (category: string) => {
    return mockLocations
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  if (selectedTransaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setSelectedTransaction(null)} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              Детали транзакции
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <selectedTransaction.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedTransaction.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.category}</p>
                </div>
                <p className="text-lg font-bold text-destructive">-{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {selectedTransaction.date}
              </div>
            </div>

            <div className="bg-card rounded-xl overflow-hidden">
              <div className="h-48 bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Карта недоступна</p>
                    <p className="text-xs text-muted-foreground">Интеграция с картами в разработке</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Точка покупки
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium">{selectedTransaction.location.address}</p>
                <p className="text-sm text-muted-foreground">
                  Координаты: {selectedTransaction.location.lat.toFixed(4)}, {selectedTransaction.location.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 space-y-2">
              <h4 className="font-medium">Статистика по этому месту</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Всего покупок</span>
                <span>5 раз</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Средний чек</span>
                <span>{formatCurrency(2500)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Всего потрачено</span>
                <span className="font-semibold">{formatCurrency(12500)}</span>
              </div>
            </div>
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
            <MapPin className="w-5 h-5" />
            География покупок
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex-1"
            >
              Список
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="flex-1"
            >
              Карта
            </Button>
          </div>

          {viewMode === "map" ? (
            <div className="bg-muted rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Карта покупок</p>
                <p className="text-sm text-muted-foreground">Интеграция в разработке</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Все
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat] || ShoppingBag;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-4 rounded-xl text-left transition-colors ${
                        selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${selectedCategory === cat ? "" : "text-primary"}`} />
                      <p className="font-medium text-sm">{cat}</p>
                      <p className={`text-xs ${selectedCategory === cat ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatCurrency(getCategoryTotal(cat))}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Последние покупки</h4>
                {filteredTransactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTransaction(tx)}
                    className="w-full p-3 bg-card rounded-xl flex items-center gap-3 hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <tx.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tx.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{tx.location.address}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">-{formatCurrency(tx.amount)}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeolocationModal;
