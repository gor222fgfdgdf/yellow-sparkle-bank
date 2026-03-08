import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Car, FileText, AlertTriangle, Search, Check, Clock, CreditCard, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FullScreenModal from "./FullScreenModal";

interface Fine {
  id: string;
  type: "traffic" | "tax" | "utility";
  title: string;
  amount: number;
  discount?: number;
  discountDeadline?: Date;
  documentNumber: string;
  date: Date;
  status: "pending" | "paid";
}

interface GovernmentServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayFine?: (amount: number) => void;
}

const services = [
  { id: "1", icon: Car, title: "Штрафы ГИБДД", description: "Проверка и оплата штрафов", category: "Штрафы" },
  { id: "2", icon: FileText, title: "Налоги", description: "Транспортный, имущественный", category: "Налоги" },
  { id: "3", icon: Building, title: "ЖКХ", description: "Коммунальные услуги", category: "Услуги" },
  { id: "4", icon: Receipt, title: "Госпошлины", description: "Паспорт, водительские права", category: "Услуги" },
];

const GovernmentServicesModal = ({ isOpen, onClose, onPayFine }: GovernmentServicesModalProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<"main" | "fines" | "taxes" | "detail">("main");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);

  const [fines, setFines] = useState<Fine[]>([
    { id: "1", type: "traffic", title: "Превышение скорости на 20-40 км/ч", amount: 500, discount: 250, discountDeadline: new Date(Date.now() + 10 * 86400000), documentNumber: "18810177230000000001", date: new Date(Date.now() - 5 * 86400000), status: "pending" },
    { id: "2", type: "traffic", title: "Нарушение правил парковки", amount: 2500, documentNumber: "18810177230000000002", date: new Date(Date.now() - 15 * 86400000), status: "pending" },
    { id: "3", type: "tax", title: "Транспортный налог 2024", amount: 12500, documentNumber: "40702810400000000001", date: new Date(Date.now() - 30 * 86400000), status: "pending" },
  ]);

  const [stsNumber, setStsNumber] = useState("");
  const [innNumber, setInnNumber] = useState("");
  const [uinNumber, setUinNumber] = useState("");

  const formatCurrency = (amount: number) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);

  const handleSearch = (type: "fines" | "taxes") => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      toast({ title: "Поиск завершён", description: `Найдено ${fines.filter(f => type === "fines" ? f.type === "traffic" : f.type === "tax").length} записей` });
    }, 1500);
  };

  const handlePayFine = (fine: Fine) => {
    const payAmount = fine.discount || fine.amount;
    setFines(fines.map(f => f.id === fine.id ? { ...f, status: "paid" as const } : f));
    onPayFine?.(payAmount);
    setSelectedFine(null);
    setView("main");
    toast({ title: "Оплата успешна", description: `${fine.title} - ${formatCurrency(payAmount)}` });
  };

  const handlePayAllFines = () => {
    const trafficFines = fines.filter(f => f.type === "traffic" && f.status === "pending");
    const total = trafficFines.reduce((sum, f) => sum + (f.discount || f.amount), 0);
    setFines(fines.map(f => f.type === "traffic" ? { ...f, status: "paid" as const } : f));
    onPayFine?.(total);
    toast({ title: "Все штрафы оплачены", description: formatCurrency(total) });
  };

  const handleUinSearch = () => {
    if (!uinNumber) {
      toast({ title: "Ошибка", description: "Введите номер УИН", variant: "destructive" });
      return;
    }
    toast({ title: "Поиск по УИН", description: "Начислений по указанному УИН не найдено" });
  };

  const pendingFines = fines.filter(f => f.status === "pending");
  const totalPending = pendingFines.reduce((sum, f) => sum + (f.discount || f.amount), 0);

  const handleClose = () => { setView("main"); setSelectedFine(null); onClose(); };

  if (selectedFine && view === "detail") {
    const daysUntilDiscount = selectedFine.discountDeadline ? Math.ceil((selectedFine.discountDeadline.getTime() - Date.now()) / 86400000) : 0;
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => { setView("fines"); setSelectedFine(null); }} title="Детали начисления">
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-warning" /></div>
              <div className="flex-1"><p className="font-semibold text-foreground">{selectedFine.title}</p><p className="text-sm text-muted-foreground">{selectedFine.date.toLocaleDateString("ru-RU")}</p></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Номер документа</span><span className="font-mono text-foreground">{selectedFine.documentNumber}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Сумма штрафа</span><span className="font-semibold text-foreground">{formatCurrency(selectedFine.amount)}</span></div>
            </div>
          </div>
          {selectedFine.discount && daysUntilDiscount > 0 && (
            <div className="bg-success/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-success" /><span className="font-medium text-success">Скидка 50%</span></div>
              <p className="text-sm text-muted-foreground mb-2">Оплатите в течение {daysUntilDiscount} дней со скидкой</p>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground line-through">{formatCurrency(selectedFine.amount)}</span>
                <span className="text-2xl font-bold text-success">{formatCurrency(selectedFine.discount)}</span>
              </div>
            </div>
          )}
          <div className="bg-card rounded-xl p-4 border border-border">
            <h4 className="font-medium text-foreground mb-3">К оплате</h4>
            <p className="text-3xl font-bold text-foreground mb-4">{formatCurrency(selectedFine.discount && daysUntilDiscount > 0 ? selectedFine.discount : selectedFine.amount)}</p>
            <Button className="w-full" onClick={() => handlePayFine(selectedFine)}><CreditCard className="w-4 h-4 mr-2" />Оплатить</Button>
          </div>
        </div>
      </FullScreenModal>
    );
  }

  if (view === "fines") {
    const trafficFines = fines.filter(f => f.type === "traffic" && f.status === "pending");
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => setView("main")} title="Штрафы ГИБДД">
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 space-y-3 border border-border">
            <p className="text-sm text-muted-foreground">Номер СТС</p>
            <Input value={stsNumber} onChange={(e) => setStsNumber(e.target.value)} placeholder="00 00 000000" />
            <Button className="w-full" onClick={() => handleSearch("fines")} disabled={isSearching}>
              {isSearching ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Поиск...</> : <><Search className="w-4 h-4 mr-2" />Проверить штрафы</>}
            </Button>
          </div>
          {trafficFines.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center"><h4 className="font-medium text-foreground">Найденные штрафы</h4><span className="text-sm text-muted-foreground">{trafficFines.length} шт.</span></div>
              {trafficFines.map(fine => (
                <button key={fine.id} onClick={() => { setSelectedFine(fine); setView("detail"); }} className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0"><Car className="w-5 h-5 text-warning" /></div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-foreground truncate">{fine.title}</p><p className="text-sm text-muted-foreground">{fine.date.toLocaleDateString("ru-RU")}</p></div>
                    <div className="text-right">
                      {fine.discount ? (<><p className="text-sm text-muted-foreground line-through">{formatCurrency(fine.amount)}</p><p className="font-bold text-success">{formatCurrency(fine.discount)}</p></>) : (<p className="font-bold text-foreground">{formatCurrency(fine.amount)}</p>)}
                    </div>
                  </div>
                </button>
              ))}
              <Button className="w-full" variant="outline" onClick={handlePayAllFines}>Оплатить все ({formatCurrency(trafficFines.reduce((sum, f) => sum + (f.discount || f.amount), 0))})</Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><Check className="w-12 h-12 mx-auto mb-3 text-success" /><p className="font-medium">Штрафов не найдено</p><p className="text-sm">Введите номер СТС для проверки</p></div>
          )}
        </div>
      </FullScreenModal>
    );
  }

  if (view === "taxes") {
    const taxFines = fines.filter(f => f.type === "tax" && f.status === "pending");
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => setView("main")} title="Налоги">
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 space-y-3 border border-border">
            <p className="text-sm text-muted-foreground">ИНН</p>
            <Input value={innNumber} onChange={(e) => setInnNumber(e.target.value)} placeholder="000000000000" maxLength={12} />
            <Button className="w-full" onClick={() => handleSearch("taxes")} disabled={isSearching}>
              {isSearching ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Поиск...</> : <><Search className="w-4 h-4 mr-2" />Проверить налоги</>}
            </Button>
          </div>
          {taxFines.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Начисления</h4>
              {taxFines.map(fine => (
                <button key={fine.id} onClick={() => { setSelectedFine(fine); setView("detail"); }} className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
                    <div className="flex-1"><p className="font-medium text-foreground">{fine.title}</p><p className="text-sm text-muted-foreground">до {fine.date.toLocaleDateString("ru-RU")}</p></div>
                    <p className="font-bold text-foreground">{formatCurrency(fine.amount)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><Check className="w-12 h-12 mx-auto mb-3 text-success" /><p className="font-medium">Задолженностей нет</p><p className="text-sm">Введите ИНН для проверки</p></div>
          )}
        </div>
      </FullScreenModal>
    );
  }

  return (
    <FullScreenModal isOpen={isOpen} onClose={handleClose} title="Госуслуги">
      <div className="space-y-4">
        {pendingFines.length > 0 && (
          <div className="bg-warning/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-warning" /><span className="font-medium text-foreground">Есть неоплаченные начисления</span></div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
            <p className="text-sm text-muted-foreground">{pendingFines.length} начислений</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {services.map(service => (
            <button key={service.id} onClick={() => {
              if (service.title === "Штрафы ГИБДД") setView("fines");
              else if (service.title === "Налоги") setView("taxes");
              else if (service.title === "ЖКХ") toast({ title: "ЖКХ", description: "Используйте раздел «Платежи» для оплаты коммунальных услуг" });
              else toast({ title: service.title, description: "Используйте раздел «Платежи» для оплаты госпошлин" });
            }} className="p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors border border-border">
              <service.icon className="w-8 h-8 text-primary mb-3" />
              <p className="font-medium text-sm text-foreground">{service.title}</p>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </button>
          ))}
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <h4 className="font-medium text-foreground mb-3">Быстрая оплата по УИН</h4>
          <div className="flex gap-2">
            <Input value={uinNumber} onChange={(e) => setUinNumber(e.target.value)} placeholder="Номер УИН" className="flex-1" />
            <Button onClick={handleUinSearch}>Найти</Button>
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default GovernmentServicesModal;
