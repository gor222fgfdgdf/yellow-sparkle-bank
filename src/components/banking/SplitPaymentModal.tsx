import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2, Send, Check, Clock, User, Percent, DivideCircle, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  phone: string;
  amount: number;
  isPaid: boolean;
}

interface Split {
  id: string;
  title: string;
  totalAmount: number;
  participants: Participant[];
  createdAt: Date;
  status: "active" | "completed";
}

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendRequest?: (phone: string, amount: number) => void;
}

const SplitPaymentModal = ({ isOpen, onClose, onSendRequest }: SplitPaymentModalProps) => {
  const { toast } = useToast();
  const [splits, setSplits] = useState<Split[]>([
    {
      id: "1",
      title: "Ужин в ресторане",
      totalAmount: 8500,
      participants: [
        { id: "1", name: "Вы", phone: "", amount: 2125, isPaid: true },
        { id: "2", name: "Алексей", phone: "+7 999 123-45-67", amount: 2125, isPaid: true },
        { id: "3", name: "Мария", phone: "+7 999 234-56-78", amount: 2125, isPaid: false },
        { id: "4", name: "Дмитрий", phone: "+7 999 345-67-89", amount: 2125, isPaid: false },
      ],
      createdAt: new Date(Date.now() - 86400000),
      status: "active",
    },
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  
  const [newSplit, setNewSplit] = useState({
    title: "",
    totalAmount: "",
    participants: [
      { id: "me", name: "Вы", phone: "", amount: 0, isPaid: true },
    ] as Participant[],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  };

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      amount: 0,
      isPaid: false,
    };
    setNewSplit({
      ...newSplit,
      participants: [...newSplit.participants, newParticipant],
    });
  };

  const removeParticipant = (id: string) => {
    if (id === "me") return;
    setNewSplit({
      ...newSplit,
      participants: newSplit.participants.filter((p) => p.id !== id),
    });
  };

  const updateParticipant = (id: string, field: keyof Participant, value: string | number) => {
    setNewSplit({
      ...newSplit,
      participants: newSplit.participants.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const calculateEqualSplit = () => {
    const total = Number(newSplit.totalAmount) || 0;
    const perPerson = Math.ceil(total / newSplit.participants.length);
    setNewSplit({
      ...newSplit,
      participants: newSplit.participants.map((p) => ({ ...p, amount: perPerson })),
    });
  };

  const handleCreateSplit = () => {
    if (!newSplit.title || !newSplit.totalAmount) {
      toast({ title: "Ошибка", description: "Заполните название и сумму", variant: "destructive" });
      return;
    }

    const validParticipants = newSplit.participants.filter((p) => p.id === "me" || p.name);
    if (validParticipants.length < 2) {
      toast({ title: "Ошибка", description: "Добавьте хотя бы одного участника", variant: "destructive" });
      return;
    }

    const split: Split = {
      id: Date.now().toString(),
      title: newSplit.title,
      totalAmount: Number(newSplit.totalAmount),
      participants: validParticipants,
      createdAt: new Date(),
      status: "active",
    };

    setSplits([split, ...splits]);
    setIsCreating(false);
    setNewSplit({
      title: "",
      totalAmount: "",
      participants: [{ id: "me", name: "Вы", phone: "", amount: 0, isPaid: true }],
    });
    toast({ title: "Счёт создан", description: "Запросы на оплату отправлены участникам" });
  };

  const handleSendReminder = (participant: Participant) => {
    toast({ title: "Напоминание отправлено", description: `${participant.name} получит уведомление` });
  };

  const handleMarkAsPaid = (splitId: string, participantId: string) => {
    setSplits(splits.map((s) => {
      if (s.id === splitId) {
        const updatedParticipants = s.participants.map((p) =>
          p.id === participantId ? { ...p, isPaid: true } : p
        );
        const allPaid = updatedParticipants.every((p) => p.isPaid);
        return { ...s, participants: updatedParticipants, status: allPaid ? "completed" : "active" };
      }
      return s;
    }));
    toast({ title: "Оплата подтверждена" });
  };

  if (selectedSplit) {
    const paidAmount = selectedSplit.participants.filter((p) => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = selectedSplit.totalAmount - paidAmount;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setSelectedSplit(null)} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedSplit.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Общая сумма</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedSplit.totalAmount)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full h-fit ${
                  selectedSplit.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {selectedSplit.status === "completed" ? "Завершено" : "В процессе"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Оплачено</span>
                  <span className="text-success">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ожидается</span>
                  <span className="text-warning">{formatCurrency(pendingAmount)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${(paidAmount / selectedSplit.totalAmount) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Участники</h4>
              {selectedSplit.participants.map((participant) => (
                <div key={participant.id} className="p-3 bg-card rounded-xl flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    participant.isPaid ? "bg-success/10" : "bg-muted"
                  }`}>
                    {participant.isPaid ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                    {participant.phone && (
                      <p className="text-xs text-muted-foreground">{participant.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${participant.isPaid ? "text-success" : ""}`}>
                      {formatCurrency(participant.amount)}
                    </p>
                    {!participant.isPaid && participant.id !== "me" && (
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleSendReminder(participant)}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Напомнить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleMarkAsPaid(selectedSplit.id, participant.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Оплачено
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isCreating) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              Новый счёт
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={newSplit.title}
                onChange={(e) => setNewSplit({ ...newSplit, title: e.target.value })}
                placeholder="Например: Ужин в ресторане"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Общая сумма</label>
              <Input
                type="number"
                value={newSplit.totalAmount}
                onChange={(e) => setNewSplit({ ...newSplit, totalAmount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={splitType === "equal" ? "default" : "outline"}
                size="sm"
                onClick={() => setSplitType("equal")}
                className="flex-1 gap-1"
              >
                <DivideCircle className="w-4 h-4" />
                Поровну
              </Button>
              <Button
                variant={splitType === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setSplitType("custom")}
                className="flex-1 gap-1"
              >
                <Calculator className="w-4 h-4" />
                Вручную
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Участники</label>
                <Button variant="ghost" size="sm" onClick={addParticipant}>
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>

              {newSplit.participants.map((participant, index) => (
                <div key={participant.id} className="p-3 bg-card rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={participant.name}
                      onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                      placeholder="Имя"
                      disabled={participant.id === "me"}
                      className="flex-1"
                    />
                    {participant.id !== "me" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  {participant.id !== "me" && (
                    <Input
                      value={participant.phone}
                      onChange={(e) => updateParticipant(participant.id, "phone", e.target.value)}
                      placeholder="Телефон (необязательно)"
                    />
                  )}
                  {splitType === "custom" && (
                    <Input
                      type="number"
                      value={participant.amount || ""}
                      onChange={(e) => updateParticipant(participant.id, "amount", Number(e.target.value))}
                      placeholder="Сумма"
                    />
                  )}
                </div>
              ))}
            </div>

            {splitType === "equal" && newSplit.totalAmount && (
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-sm text-muted-foreground">Каждый участник платит</p>
                <p className="text-xl font-bold">
                  {formatCurrency(Math.ceil(Number(newSplit.totalAmount) / newSplit.participants.length))}
                </p>
              </div>
            )}

            <Button className="w-full" onClick={handleCreateSplit}>
              <Send className="w-4 h-4 mr-2" />
              Создать и отправить запросы
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
            <Users className="w-5 h-5" />
            Разделить счёт
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" className="w-full gap-2" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Создать новый счёт
          </Button>

          {splits.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Активные счета</h4>
              {splits.map((split) => {
                const paidCount = split.participants.filter((p) => p.isPaid).length;
                const totalCount = split.participants.length;
                
                return (
                  <button
                    key={split.id}
                    onClick={() => setSelectedSplit(split)}
                    className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{split.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {paidCount}/{totalCount} оплатили
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(split.totalAmount)}</p>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success transition-all"
                        style={{ width: `${(paidCount / totalCount) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>У вас пока нет общих счетов</p>
              <p className="text-sm">Создайте счёт, чтобы разделить расходы с друзьями</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SplitPaymentModal;
