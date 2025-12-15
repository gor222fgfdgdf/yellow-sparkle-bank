import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Plus, Eye, EyeOff, Trash2, Copy, Lock, Unlock, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface VirtualCard {
  id: string;
  name: string;
  number: string;
  cvv: string;
  expiry: string;
  balance: number;
  limit: number;
  isActive: boolean;
  isLocked: boolean;
}

interface VirtualCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VirtualCardsModal = ({ isOpen, onClose }: VirtualCardsModalProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<VirtualCard[]>([
    {
      id: "1",
      name: "Покупки онлайн",
      number: "4276 8901 2345 6789",
      cvv: "123",
      expiry: "12/26",
      balance: 15000,
      limit: 50000,
      isActive: true,
      isLocked: false,
    },
    {
      id: "2",
      name: "Подписки",
      number: "4276 5432 1098 7654",
      cvv: "456",
      expiry: "08/27",
      balance: 5000,
      limit: 10000,
      isActive: true,
      isLocked: false,
    },
  ]);
  const [showCVV, setShowCVV] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);

  const generateCardNumber = () => {
    const groups = [];
    for (let i = 0; i < 4; i++) {
      groups.push(Math.floor(1000 + Math.random() * 9000).toString());
    }
    return groups.join(" ");
  };

  const handleCreateCard = () => {
    if (!newCardName || !newCardLimit) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }

    const newCard: VirtualCard = {
      id: Date.now().toString(),
      name: newCardName,
      number: generateCardNumber(),
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      expiry: `${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 3).slice(-2)}`,
      balance: 0,
      limit: Number(newCardLimit),
      isActive: true,
      isLocked: false,
    };

    setCards([...cards, newCard]);
    setIsCreating(false);
    setNewCardName("");
    setNewCardLimit("");
    toast({ title: "Карта создана", description: `Виртуальная карта "${newCard.name}" готова к использованию` });
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    setSelectedCard(null);
    toast({ title: "Карта удалена" });
  };

  const handleToggleLock = (id: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c)));
    const card = cards.find((c) => c.id === id);
    toast({ title: card?.isLocked ? "Карта разблокирована" : "Карта заблокирована" });
  };

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number.replace(/\s/g, ""));
    toast({ title: "Скопировано", description: "Номер карты скопирован" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  };

  if (selectedCard) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setSelectedCard(null)} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedCard.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedCard.isLocked ? "from-muted to-muted" : "from-primary to-primary/80"}`}>
              <div className="flex justify-between items-start mb-8">
                <CreditCard className={`w-8 h-8 ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground"}`} />
                {selectedCard.isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <p className={`font-mono text-lg tracking-wider mb-4 ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground"}`}>
                {selectedCard.number}
              </p>
              <div className="flex justify-between">
                <div>
                  <p className={`text-xs ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground/70"}`}>Действует до</p>
                  <p className={`font-medium ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground"}`}>{selectedCard.expiry}</p>
                </div>
                <div>
                  <p className={`text-xs ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground/70"}`}>CVV</p>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground"}`}>
                      {showCVV === selectedCard.id ? selectedCard.cvv : "***"}
                    </p>
                    <button onClick={() => setShowCVV(showCVV === selectedCard.id ? null : selectedCard.id)}>
                      {showCVV === selectedCard.id ? (
                        <EyeOff className={`w-4 h-4 ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground/70"}`} />
                      ) : (
                        <Eye className={`w-4 h-4 ${selectedCard.isLocked ? "text-muted-foreground" : "text-primary-foreground/70"}`} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Баланс</span>
                <span className="font-semibold">{formatCurrency(selectedCard.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Лимит</span>
                <span className="font-semibold">{formatCurrency(selectedCard.limit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доступно</span>
                <span className="font-semibold text-primary">{formatCurrency(selectedCard.limit - selectedCard.balance)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleCopyNumber(selectedCard.number)} className="gap-2">
                <Copy className="w-4 h-4" /> Копировать
              </Button>
              <Button
                variant={selectedCard.isLocked ? "default" : "outline"}
                onClick={() => handleToggleLock(selectedCard.id)}
                className="gap-2"
              >
                {selectedCard.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {selectedCard.isLocked ? "Разблокировать" : "Заблокировать"}
              </Button>
            </div>

            <Button variant="destructive" className="w-full gap-2" onClick={() => handleDeleteCard(selectedCard.id)}>
              <Trash2 className="w-4 h-4" /> Удалить карту
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
          <DialogTitle>Виртуальные карты</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isCreating ? (
            <div className="bg-card rounded-xl p-4 space-y-4">
              <h3 className="font-semibold">Новая виртуальная карта</h3>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Название</label>
                <Input
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="Например: Онлайн покупки"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Лимит (₽)</label>
                <Input
                  type="number"
                  value={newCardLimit}
                  onChange={(e) => setNewCardLimit(e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                  Отмена
                </Button>
                <Button className="flex-1" onClick={handleCreateCard}>
                  Создать
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full gap-2" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" /> Создать виртуальную карту
            </Button>
          )}

          <div className="space-y-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="w-full p-4 bg-card rounded-xl flex items-center gap-4 hover:bg-muted transition-colors text-left"
              >
                <div className={`w-12 h-8 rounded ${card.isLocked ? "bg-muted" : "bg-primary"} flex items-center justify-center`}>
                  <CreditCard className={`w-5 h-5 ${card.isLocked ? "text-muted-foreground" : "text-primary-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{card.name}</p>
                    {card.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">•••• {card.number.slice(-4)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(card.limit)}</p>
                  <p className="text-xs text-muted-foreground">лимит</p>
                </div>
              </button>
            ))}
          </div>

          {cards.length === 0 && !isCreating && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>У вас пока нет виртуальных карт</p>
              <p className="text-sm">Создайте карту для безопасных покупок онлайн</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualCardsModal;
