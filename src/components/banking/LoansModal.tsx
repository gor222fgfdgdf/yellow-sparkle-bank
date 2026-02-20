import { useState } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Calculator, Calendar, Check, Clock, ChevronRight, Percent } from "lucide-react";
import { toast } from "sonner";

interface LoanOffer { id: string; name: string; rate: number; maxAmount: number; maxTerm: number; description: string; features: string[]; }
interface ActiveLoan { id: string; name: string; totalAmount: number; remainingAmount: number; monthlyPayment: number; nextPaymentDate: string; rate: number; }
interface LoansModalProps { isOpen: boolean; onClose: () => void; }

const loanOffers: LoanOffer[] = [
  { id: "1", name: "Кредит наличными", rate: 14.9, maxAmount: 5000000, maxTerm: 60, description: "На любые цели без залога", features: ["Без справок", "Решение за 2 минуты", "Досрочное погашение"] },
  { id: "2", name: "Рефинансирование", rate: 12.9, maxAmount: 3000000, maxTerm: 48, description: "Объедините кредиты со снижением ставки", features: ["Ставка ниже", "Один платёж", "Снижение переплаты"] },
  { id: "3", name: "Рассрочка", rate: 0, maxAmount: 500000, maxTerm: 24, description: "0% на покупки у партнёров", features: ["Без переплаты", "5000+ магазинов", "Мгновенное одобрение"] }
];

const activeLoans: ActiveLoan[] = [
  { id: "1", name: "Потребительский кредит", totalAmount: 500000, remainingAmount: 245000, monthlyPayment: 15420, nextPaymentDate: "25 дек", rate: 14.9 }
];

const LoansModal = ({ isOpen, onClose }: LoansModalProps) => {
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null);
  const [amount, setAmount] = useState(100000);
  const [term, setTerm] = useState(12);
  const [isApplying, setIsApplying] = useState(false);

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    if (rate === 0) return principal / months;
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Заявка одобрена! Деньги поступят в течение 5 минут");
    setIsApplying(false);
    setSelectedOffer(null);
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Кредиты и рассрочка">
      <Tabs defaultValue="offers">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="offers">Предложения</TabsTrigger>
          <TabsTrigger value="calculator">Калькулятор</TabsTrigger>
          <TabsTrigger value="active">Мои кредиты</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          {selectedOffer ? (
            <div className="space-y-6">
              <button onClick={() => setSelectedOffer(null)} className="text-primary text-sm">← Назад к предложениям</button>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-2">{selectedOffer.name}</h3>
                <p className="text-muted-foreground mb-4">{selectedOffer.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Percent className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{selectedOffer.rate}%</span>
                  <span className="text-muted-foreground">годовых</span>
                </div>
                <div className="space-y-2 mb-6">
                  {selectedOffer.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-foreground">{feature}</span></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div><Label>Сумма: {amount.toLocaleString("ru-RU")} ₽</Label><Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={10000} max={selectedOffer.maxAmount} step={10000} className="mt-2" /></div>
                <div><Label>Срок: {term} мес.</Label><Slider value={[term]} onValueChange={([v]) => setTerm(v)} min={3} max={selectedOffer.maxTerm} step={1} className="mt-2" /></div>
                <div className="bg-muted rounded-xl p-4"><p className="text-sm text-muted-foreground">Ежемесячный платёж</p><p className="text-2xl font-bold text-foreground">{Math.round(calculateMonthlyPayment(amount, selectedOffer.rate, term)).toLocaleString("ru-RU")} ₽</p></div>
                <Button onClick={handleApply} className="w-full" disabled={isApplying}>{isApplying ? "Оформление..." : "Оформить кредит"}</Button>
              </div>
            </div>
          ) : (
            loanOffers.map(offer => (
              <button key={offer.id} onClick={() => setSelectedOffer(offer)} className="w-full bg-card rounded-2xl p-4 border border-border text-left hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{offer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-primary">{offer.rate}%</span>
                      <span className="text-sm text-muted-foreground">до {(offer.maxAmount / 1000000).toFixed(1)} млн ₽</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))
          )}
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <div className="space-y-4">
            <div><Label>Сумма кредита</Label><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-2" /><Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={10000} max={5000000} step={10000} className="mt-2" /></div>
            <div><Label>Срок (месяцев)</Label><Input type="number" value={term} onChange={(e) => setTerm(Number(e.target.value))} className="mt-2" /><Slider value={[term]} onValueChange={([v]) => setTerm(v)} min={3} max={60} step={1} className="mt-2" /></div>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Ставка</span><span className="font-medium text-foreground">14.9%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ежемесячный платёж</span><span className="font-bold text-foreground text-lg">{Math.round(calculateMonthlyPayment(amount, 14.9, term)).toLocaleString("ru-RU")} ₽</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Переплата</span><span className="font-medium text-foreground">{Math.round(calculateMonthlyPayment(amount, 14.9, term) * term - amount).toLocaleString("ru-RU")} ₽</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Общая сумма</span><span className="font-medium text-foreground">{Math.round(calculateMonthlyPayment(amount, 14.9, term) * term).toLocaleString("ru-RU")} ₽</span></div>
          </div>
          <Button className="w-full">Оформить кредит</Button>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeLoans.length > 0 ? (
            activeLoans.map(loan => (
              <div key={loan.id} className="bg-card rounded-2xl p-4 border border-border space-y-4">
                <div className="flex items-center justify-between"><div><h3 className="font-semibold text-foreground">{loan.name}</h3><p className="text-sm text-muted-foreground">{loan.rate}% годовых</p></div><CreditCard className="w-8 h-8 text-primary" /></div>
                <div><div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Погашено</span><span className="text-foreground">{(1 - loan.remainingAmount / loan.totalAmount) * 100}%</span></div><Progress value={(1 - loan.remainingAmount / loan.totalAmount) * 100} /></div>
                <div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Остаток</p><p className="font-bold text-foreground">{loan.remainingAmount.toLocaleString("ru-RU")} ₽</p></div><div><p className="text-sm text-muted-foreground">Платёж</p><p className="font-bold text-foreground">{loan.monthlyPayment.toLocaleString("ru-RU")} ₽</p></div></div>
                <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Следующий платёж:</span><span className="font-medium text-foreground">{loan.nextPaymentDate}</span></div>
                <div className="flex gap-2"><Button variant="outline" className="flex-1">График</Button><Button className="flex-1">Погасить</Button></div>
              </div>
            ))
          ) : (
            <div className="text-center py-12"><CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="font-semibold text-foreground mb-2">Нет активных кредитов</h3><p className="text-muted-foreground">Оформите выгодный кредит прямо сейчас</p></div>
          )}
        </TabsContent>
      </Tabs>
    </FullScreenModal>
  );
};

export default LoansModal;
