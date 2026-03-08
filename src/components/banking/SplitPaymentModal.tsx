import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2, Send, Check, Clock, User, DivideCircle, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FullScreenModal from "./FullScreenModal";

interface Participant { id: string; name: string; phone: string; amount: number; isPaid: boolean; }
interface Split { id: string; title: string; totalAmount: number; participants: Participant[]; createdAt: Date; status: "active" | "completed"; }
interface SplitPaymentModalProps { isOpen: boolean; onClose: () => void; onSendRequest?: (phone: string, amount: number) => void; }

const SplitPaymentModal = ({ isOpen, onClose, onSendRequest }: SplitPaymentModalProps) => {
  const { toast } = useToast();
  const [splits, setSplits] = useState<Split[]>([
    { id: "1", title: "Ужин в ресторане", totalAmount: 8500, participants: [
      { id: "1", name: "Вы", phone: "", amount: 2125, isPaid: true },
      { id: "2", name: "Алексей", phone: "+7 999 123-45-67", amount: 2125, isPaid: true },
      { id: "3", name: "Мария", phone: "+7 999 234-56-78", amount: 2125, isPaid: false },
      { id: "4", name: "Дмитрий", phone: "+7 999 345-67-89", amount: 2125, isPaid: false },
    ], createdAt: new Date(Date.now() - 86400000), status: "active" },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<Split | null>(null);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [newSplit, setNewSplit] = useState({ title: "", totalAmount: "", participants: [{ id: "me", name: "Вы", phone: "", amount: 0, isPaid: true }] as Participant[] });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  const addParticipant = () => setNewSplit({ ...newSplit, participants: [...newSplit.participants, { id: Date.now().toString(), name: "", phone: "", amount: 0, isPaid: false }] });
  const removeParticipant = (id: string) => { if (id === "me") return; setNewSplit({ ...newSplit, participants: newSplit.participants.filter(p => p.id !== id) }); };
  const updateParticipant = (id: string, field: keyof Participant, value: string | number) => setNewSplit({ ...newSplit, participants: newSplit.participants.map(p => p.id === id ? { ...p, [field]: value } : p) });

  const handleCreateSplit = () => {
    if (!newSplit.title || !newSplit.totalAmount) { toast({ title: "Ошибка", description: "Заполните название и сумму", variant: "destructive" }); return; }
    const validParticipants = newSplit.participants.filter(p => p.id === "me" || p.name);
    if (validParticipants.length < 2) { toast({ title: "Ошибка", description: "Добавьте хотя бы одного участника", variant: "destructive" }); return; }
    const perPerson = splitType === "equal" ? Math.ceil(Number(newSplit.totalAmount) / validParticipants.length) : 0;
    const participants = splitType === "equal" ? validParticipants.map(p => ({ ...p, amount: perPerson })) : validParticipants;
    setSplits([{ id: Date.now().toString(), title: newSplit.title, totalAmount: Number(newSplit.totalAmount), participants, createdAt: new Date(), status: "active" }, ...splits]);
    setIsCreating(false);
    setNewSplit({ title: "", totalAmount: "", participants: [{ id: "me", name: "Вы", phone: "", amount: 0, isPaid: true }] });
    toast({ title: "Счёт создан", description: "Запросы на оплату отправлены участникам" });
  };

  const handleSendReminder = (participant: Participant) => toast({ title: "Напоминание отправлено", description: `${participant.name} получит уведомление` });
  const handleMarkAsPaid = (splitId: string, participantId: string) => {
    setSplits(splits.map(s => {
      if (s.id === splitId) {
        const updatedParticipants = s.participants.map(p => p.id === participantId ? { ...p, isPaid: true } : p);
        return { ...s, participants: updatedParticipants, status: updatedParticipants.every(p => p.isPaid) ? "completed" : "active" };
      }
      return s;
    }));
    toast({ title: "Оплата подтверждена" });
  };

  const handleClose = () => { setSelectedSplit(null); setIsCreating(false); onClose(); };

  if (selectedSplit) {
    const paidAmount = selectedSplit.participants.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = selectedSplit.totalAmount - paidAmount;
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => setSelectedSplit(null)} title={selectedSplit.title}>
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex justify-between mb-4">
              <div><p className="text-sm text-muted-foreground">Общая сумма</p><p className="text-2xl font-bold text-foreground">{formatCurrency(selectedSplit.totalAmount)}</p></div>
              <div className={`px-3 py-1 rounded-full h-fit ${selectedSplit.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{selectedSplit.status === "completed" ? "Завершено" : "В процессе"}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Оплачено</span><span className="text-success">{formatCurrency(paidAmount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ожидается</span><span className="text-warning">{formatCurrency(pendingAmount)}</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success transition-all" style={{ width: `${(paidAmount / selectedSplit.totalAmount) * 100}%` }} /></div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Участники</h4>
            {selectedSplit.participants.map(participant => (
              <div key={participant.id} className="p-3 bg-card rounded-xl flex items-center gap-3 border border-border">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${participant.isPaid ? "bg-success/10" : "bg-muted"}`}>
                  {participant.isPaid ? <Check className="w-5 h-5 text-success" /> : <User className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1"><p className="font-medium text-foreground">{participant.name}</p>{participant.phone && <p className="text-xs text-muted-foreground">{participant.phone}</p>}</div>
                <div className="text-right">
                  <p className={`font-semibold ${participant.isPaid ? "text-success" : "text-foreground"}`}>{formatCurrency(participant.amount)}</p>
                  {!participant.isPaid && participant.id !== "me" && (
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleSendReminder(participant)}><Clock className="w-3 h-3 mr-1" />Напомнить</Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleMarkAsPaid(selectedSplit.id, participant.id)}><Check className="w-3 h-3 mr-1" />Оплачено</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullScreenModal>
    );
  }

  if (isCreating) {
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => setIsCreating(false)} title="Новый счёт">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Название</label><Input value={newSplit.title} onChange={(e) => setNewSplit({ ...newSplit, title: e.target.value })} placeholder="Например: Ужин в ресторане" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">Общая сумма</label><Input type="number" value={newSplit.totalAmount} onChange={(e) => setNewSplit({ ...newSplit, totalAmount: e.target.value })} placeholder="0" /></div>
          <div className="flex gap-2">
            <Button variant={splitType === "equal" ? "default" : "outline"} size="sm" onClick={() => setSplitType("equal")} className="flex-1 gap-1"><DivideCircle className="w-4 h-4" />Поровну</Button>
            <Button variant={splitType === "custom" ? "default" : "outline"} size="sm" onClick={() => setSplitType("custom")} className="flex-1 gap-1"><Calculator className="w-4 h-4" />Вручную</Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><label className="text-sm font-medium text-foreground">Участники</label><Button variant="ghost" size="sm" onClick={addParticipant}><Plus className="w-4 h-4 mr-1" />Добавить</Button></div>
            {newSplit.participants.map(participant => (
              <div key={participant.id} className="p-3 bg-card rounded-xl space-y-2 border border-border">
                <div className="flex items-center gap-2">
                  <Input value={participant.name} onChange={(e) => updateParticipant(participant.id, "name", e.target.value)} placeholder="Имя" disabled={participant.id === "me"} className="flex-1" />
                  {participant.id !== "me" && <Button variant="ghost" size="icon" onClick={() => removeParticipant(participant.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                </div>
                {participant.id !== "me" && <Input value={participant.phone} onChange={(e) => updateParticipant(participant.id, "phone", e.target.value)} placeholder="Телефон (необязательно)" />}
                {splitType === "custom" && <Input type="number" value={participant.amount || ""} onChange={(e) => updateParticipant(participant.id, "amount", Number(e.target.value))} placeholder="Сумма" />}
              </div>
            ))}
          </div>
          {splitType === "equal" && newSplit.totalAmount && (
            <div className="bg-muted rounded-xl p-3 text-center"><p className="text-sm text-muted-foreground">Каждый участник платит</p><p className="text-xl font-bold text-foreground">{formatCurrency(Math.ceil(Number(newSplit.totalAmount) / newSplit.participants.length))}</p></div>
          )}
          <Button className="w-full" onClick={handleCreateSplit}><Send className="w-4 h-4 mr-2" />Создать и отправить запросы</Button>
        </div>
      </FullScreenModal>
    );
  }

  return (
    <FullScreenModal isOpen={isOpen} onClose={handleClose} title="Разделить счёт">
      <div className="space-y-4">
        <Button variant="outline" className="w-full gap-2" onClick={() => setIsCreating(true)}><Plus className="w-4 h-4" />Создать новый счёт</Button>
        {splits.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Активные счета</h4>
            {splits.map(split => {
              const paidCount = split.participants.filter(p => p.isPaid).length;
              const totalCount = split.participants.length;
              return (
                <button key={split.id} onClick={() => setSelectedSplit(split)} className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors border border-border">
                  <div className="flex justify-between items-start mb-2"><div><p className="font-medium text-foreground">{split.title}</p><p className="text-sm text-muted-foreground">{paidCount}/{totalCount} оплатили</p></div><p className="font-bold text-foreground">{formatCurrency(split.totalAmount)}</p></div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success transition-all" style={{ width: `${(paidCount / totalCount) * 100}%` }} /></div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>У вас пока нет общих счетов</p><p className="text-sm">Создайте счёт, чтобы разделить расходы с друзьями</p></div>
        )}
      </div>
    </FullScreenModal>
  );
};

export default SplitPaymentModal;
