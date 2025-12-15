import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Star, Ticket, ChevronRight, QrCode, Copy, Check, ShoppingBag, Coffee, Utensils, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  discount: string;
  description: string;
  promocode?: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
}

interface LoyaltyProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const partners: Partner[] = [
  { id: "1", name: "Яндекс.Маркет", logo: "🛒", category: "Покупки", discount: "10%", description: "На первый заказ от 3000 ₽", promocode: "RSHB10" },
  { id: "2", name: "Ozon", logo: "📦", category: "Покупки", discount: "5%", description: "На все товары", promocode: "RSHB5" },
  { id: "3", name: "Delivery Club", logo: "🍕", category: "Еда", discount: "20%", description: "На первые 3 заказа", promocode: "RSHBNEW" },
  { id: "4", name: "Кофемания", logo: "☕", category: "Кафе", discount: "15%", description: "На напитки", promocode: "RSHBCOFFEE" },
  { id: "5", name: "Аэрофлот", logo: "✈️", category: "Путешествия", discount: "2x мили", description: "Двойные мили за покупки", promocode: "" },
  { id: "6", name: "Lamoda", logo: "👗", category: "Одежда", discount: "15%", description: "На новую коллекцию", promocode: "RSHBSTYLE" },
];

const rewards: Reward[] = [
  { id: "1", name: "Скидка 500 ₽ в Ozon", description: "Промокод на 500 ₽", pointsCost: 5000, category: "Промокоды", available: true },
  { id: "2", name: "Бесплатная доставка", description: "Delivery Club", pointsCost: 2000, category: "Промокоды", available: true },
  { id: "3", name: "Кофе в подарок", description: "Кофемания", pointsCost: 1000, category: "Подарки", available: true },
  { id: "4", name: "1000 миль Аэрофлот", description: "Бонусные мили", pointsCost: 10000, category: "Мили", available: true },
  { id: "5", name: "Скидка 2000 ₽ в Lamoda", description: "Промокод на одежду", pointsCost: 15000, category: "Промокоды", available: false },
];

const categoryIcons: Record<string, any> = {
  "Покупки": ShoppingBag,
  "Еда": Utensils,
  "Кафе": Coffee,
  "Путешествия": Plane,
  "Одежда": ShoppingBag,
};

const LoyaltyProgramModal = ({ isOpen, onClose }: LoyaltyProgramModalProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<"main" | "partners" | "rewards" | "partner-detail">("main");
  const [points, setPoints] = useState(12500);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(partners.map(p => p.category)));

  const filteredPartners = selectedCategory
    ? partners.filter(p => p.category === selectedCategory)
    : partners;

  const handleCopyPromocode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Скопировано", description: `Промокод ${code} скопирован` });
  };

  const handleRedeemReward = (reward: Reward) => {
    if (points < reward.pointsCost) {
      toast({ title: "Недостаточно баллов", description: `Нужно ещё ${reward.pointsCost - points} баллов`, variant: "destructive" });
      return;
    }

    setPoints(points - reward.pointsCost);
    toast({ title: "Награда получена! 🎉", description: `${reward.name}` });
  };

  if (selectedPartner && view === "partner-detail") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => { setView("partners"); setSelectedPartner(null); }} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedPartner.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-center text-primary-foreground">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mx-auto mb-4">
                {selectedPartner.logo}
              </div>
              <h3 className="text-2xl font-bold mb-2">{selectedPartner.discount}</h3>
              <p className="text-primary-foreground/80">{selectedPartner.description}</p>
            </div>

            {selectedPartner.promocode && (
              <div className="bg-card rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Промокод</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg p-3 font-mono text-lg text-center">
                    {selectedPartner.promocode}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyPromocode(selectedPartner.promocode!)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl p-4">
              <h4 className="font-medium mb-3">Как получить скидку</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span>Скопируйте промокод выше</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span>Перейдите на сайт {selectedPartner.name}</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span>Введите промокод при оформлении заказа</span>
                </li>
              </ol>
            </div>

            <Button className="w-full">
              Перейти в {selectedPartner.name}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (view === "partners") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setView("main")} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              Партнёры
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Все
              </Button>
              {categories.map(cat => (
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
              {filteredPartners.map(partner => {
                const Icon = categoryIcons[partner.category] || Gift;
                return (
                  <button
                    key={partner.id}
                    onClick={() => { setSelectedPartner(partner); setView("partner-detail"); }}
                    className="p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl mb-3">
                      {partner.logo}
                    </div>
                    <p className="font-medium text-sm truncate">{partner.name}</p>
                    <p className="text-lg font-bold text-primary">{partner.discount}</p>
                    <p className="text-xs text-muted-foreground truncate">{partner.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (view === "rewards") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setView("main")} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              Награды
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ваши баллы</p>
              <p className="text-3xl font-bold">{points.toLocaleString("ru-RU")}</p>
            </div>

            <div className="space-y-3">
              {rewards.map(reward => (
                <div
                  key={reward.id}
                  className={`p-4 bg-card rounded-xl ${!reward.available ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{reward.pointsCost.toLocaleString("ru-RU")}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!reward.available || points < reward.pointsCost}
                      onClick={() => handleRedeemReward(reward)}
                    >
                      {points >= reward.pointsCost ? "Получить" : "Недостаточно"}
                    </Button>
                  </div>
                </div>
              ))}
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
            <Gift className="w-5 h-5" />
            Программа лояльности
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary-foreground/70 text-sm">Ваши баллы</p>
                <p className="text-3xl font-bold">{points.toLocaleString("ru-RU")}</p>
              </div>
              <Star className="w-12 h-12 text-primary-foreground/20" />
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Check className="w-4 h-4" />
              <span>Золотой статус</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setView("partners")}
              className="p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors"
            >
              <ShoppingBag className="w-8 h-8 text-primary mb-2" />
              <p className="font-medium">Партнёры</p>
              <p className="text-sm text-muted-foreground">{partners.length} предложений</p>
            </button>

            <button
              onClick={() => setView("rewards")}
              className="p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors"
            >
              <Gift className="w-8 h-8 text-primary mb-2" />
              <p className="font-medium">Награды</p>
              <p className="text-sm text-muted-foreground">Обменять баллы</p>
            </button>
          </div>

          <div className="bg-card rounded-xl p-4">
            <h4 className="font-medium mb-3">Как заработать баллы</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Покупки по карте</span>
                <span className="font-medium">1 балл за 100 ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">У партнёров</span>
                <span className="font-medium">до 10 баллов за 100 ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Приглашение друга</span>
                <span className="font-medium">500 баллов</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Популярные предложения</h4>
            {partners.slice(0, 3).map(partner => (
              <button
                key={partner.id}
                onClick={() => { setSelectedPartner(partner); setView("partner-detail"); }}
                className="w-full p-3 bg-card rounded-xl flex items-center gap-3 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {partner.logo}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-sm text-muted-foreground">{partner.description}</p>
                </div>
                <span className="font-bold text-primary">{partner.discount}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoyaltyProgramModal;
