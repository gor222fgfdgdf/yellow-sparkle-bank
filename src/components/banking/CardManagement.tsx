import { useState } from "react";
import { 
  CreditCard, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Settings, 
  Plus, 
  ChevronRight,
  Shield,
  ShoppingCart,
  Plane,
  Banknote,
  AlertTriangle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CardManagementProps {
  onClose: () => void;
  cardHolderName?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const CardManagement = ({ onClose, cardHolderName = "CARDHOLDER" }: CardManagementProps) => {
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [showOrderCard, setShowOrderCard] = useState(false);
  
  const [limits, setLimits] = useState({
    daily: 100000,
    online: 50000,
    international: 30000,
    atm: 50000,
  });

  const cardPin = "4829";

  const handleFreezeToggle = () => {
    setIsCardFrozen(!isCardFrozen);
    toast.success(isCardFrozen ? "Карта разморожена" : "Карта временно заморожена");
  };

  const handleOrderCard = () => {
    toast.success("Карта заказана! Доставка 3-5 рабочих дней.");
    setShowOrderCard(false);
  };

  if (showLimits) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="max-w-lg mx-auto min-h-screen">
          <header className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => setShowLimits(false)}
                className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 text-foreground" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Лимиты расходов</h1>
            </div>
          </header>

          <div className="p-4 space-y-6">
            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Дневной лимит</p>
                  <p className="text-sm text-muted-foreground">Максимум в день</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.daily)} ₽</p>
              </div>
              <Slider
                value={[limits.daily]}
                onValueChange={(value) => setLimits({ ...limits, daily: value[0] })}
                max={500000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ₽</span>
                <span>500 000 ₽</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Покупки онлайн</p>
                  <p className="text-sm text-muted-foreground">Лимит на операцию</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.online)} ₽</p>
              </div>
              <Slider
                value={[limits.online]}
                onValueChange={(value) => setLimits({ ...limits, online: value[0] })}
                max={200000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ₽</span>
                <span>200 000 ₽</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">За границей</p>
                  <p className="text-sm text-muted-foreground">Дневной лимит за рубежом</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.international)} ₽</p>
              </div>
              <Slider
                value={[limits.international]}
                onValueChange={(value) => setLimits({ ...limits, international: value[0] })}
                max={150000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ₽</span>
                <span>150 000 ₽</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Снятие в банкомате</p>
                  <p className="text-sm text-muted-foreground">Дневной лимит наличных</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.atm)} ₽</p>
              </div>
              <Slider
                value={[limits.atm]}
                onValueChange={(value) => setLimits({ ...limits, atm: value[0] })}
                max={150000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ₽</span>
                <span>150 000 ₽</span>
              </div>
            </div>

            <Button
              onClick={() => {
                toast.success("Лимиты обновлены");
                setShowLimits(false);
              }}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90"
            >
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showOrderCard) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="max-w-lg mx-auto min-h-screen">
          <header className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => setShowOrderCard(false)}
                className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 text-foreground" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Заказать карту</h1>
            </div>
          </header>

          <div className="p-4 space-y-6">
            <div className="bg-gradient-to-br from-foreground to-neutral-700 rounded-2xl p-6 aspect-[1.6/1] relative overflow-hidden">
              <div className="absolute top-6 left-6">
                <p className="text-card text-sm opacity-70">Тинькофф</p>
              </div>
              <div className="absolute bottom-16 left-6">
                <p className="text-card text-lg tracking-widest font-mono">•••• •••• •••• ••••</p>
              </div>
              <div className="absolute bottom-6 left-6">
              <p className="text-card/70 text-xs">ВЛАДЕЛЕЦ</p>
                <p className="text-card text-sm">{cardHolderName}</p>
              </div>
              <div className="absolute bottom-6 right-6">
                <p className="text-card/70 text-xs">СРОК</p>
                <p className="text-card text-sm">12/28</p>
              </div>
              <div className="absolute top-6 right-6 w-12 h-8 bg-primary rounded-md" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-1">Выберите тип карты</p>
              
              {[
                { name: "Union Pay", desc: "Бесплатная доставка", price: "Бесплатно" },
                { name: "Union Pay Gold", desc: "Премиальные преимущества", price: "990 ₽/мес" },
                { name: "Union Pay Platinum", desc: "Эксклюзивные привилегии", price: "1990 ₽/мес" },
              ].map((card, index) => (
                <button
                  key={card.name}
                  className={`w-full bg-card rounded-2xl p-4 shadow-sm flex items-center gap-4 text-left transition-all ${
                    index === 0 ? "ring-2 ring-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-12 h-8 bg-gradient-to-br from-foreground to-neutral-600 rounded-md" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{card.name}</p>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                  <p className="font-semibold text-foreground">{card.price}</p>
                </button>
              ))}
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">Адрес доставки</p>
              <p className="text-foreground">г. Москва, ул. Тверская, д. 15</p>
              <p className="text-muted-foreground">кв. 42</p>
            </div>

            <Button
              onClick={handleOrderCard}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90"
            >
              Заказать — Бесплатно
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="max-w-lg mx-auto min-h-screen pb-24">
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Управление картой</h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          <div className={`relative transition-all ${isCardFrozen ? "opacity-60 grayscale" : ""}`}>
            <div className="bg-gradient-to-br from-primary to-amber-400 rounded-2xl p-6 aspect-[1.6/1] relative overflow-hidden shadow-lg">
              <div className="absolute top-6 left-6">
                <p className="text-primary-foreground text-sm font-medium">Тинькофф</p>
              </div>
              <div className="absolute bottom-16 left-6">
                <p className="text-primary-foreground text-lg tracking-widest font-mono">•••• •••• •••• 7823</p>
              </div>
              <div className="absolute bottom-6 left-6">
              <p className="text-primary-foreground/70 text-xs">ВЛАДЕЛЕЦ</p>
                <p className="text-primary-foreground text-sm font-medium">{cardHolderName}</p>
              </div>
              <div className="absolute bottom-6 right-6">
                <p className="text-primary-foreground/70 text-xs">СРОК</p>
                <p className="text-primary-foreground text-sm font-medium">12/28</p>
              </div>
              <div className="absolute top-6 right-6 w-12 h-12">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/30 absolute right-0" />
                <div className="w-8 h-8 rounded-full bg-primary-foreground/30 absolute right-4" />
              </div>
            </div>
            {isCardFrozen && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-foreground/80 text-card px-4 py-2 rounded-full flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Карта заморожена</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isCardFrozen ? "bg-destructive/10" : "bg-success/10"
              }`}>
                {isCardFrozen ? (
                  <Lock className="w-6 h-6 text-destructive" />
                ) : (
                  <Unlock className="w-6 h-6 text-success" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Заморозить карту</p>
                <p className="text-sm text-muted-foreground">
                  {isCardFrozen ? "Карта временно заморожена" : "Временно заблокировать карту"}
                </p>
              </div>
              <Switch
                checked={isCardFrozen}
                onCheckedChange={handleFreezeToggle}
              />
            </div>
            {isCardFrozen && (
              <div className="px-4 pb-4">
                <div className="bg-destructive/10 rounded-xl p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    Все операции заблокированы пока карта заморожена.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">ПИН-код</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-muted-foreground tracking-widest">
                    {showPin ? cardPin : "••••"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPin(!showPin)}
                className="p-3 hover:bg-muted rounded-full transition-colors"
              >
                {showPin ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowLimits(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Settings className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Лимиты расходов</p>
                <p className="text-sm text-muted-foreground">Установить дневные и транзакционные лимиты</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="h-px bg-border mx-4" />

            <button
              onClick={() => setShowOrderCard(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Заказать новую карту</p>
                <p className="text-sm text-muted-foreground">Получить замену или дополнительную карту</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Реквизиты карты</p>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Номер карты</span>
              <span className="font-mono text-foreground">•••• •••• •••• 7823</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Срок действия</span>
              <span className="font-mono text-foreground">12/28</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Тип карты</span>
              <span className="text-foreground">Union Pay</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Статус</span>
              <span className={isCardFrozen ? "text-destructive" : "text-success"}>
                {isCardFrozen ? "Заморожена" : "Активна"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardManagement;
