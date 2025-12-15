import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, Plus, TrendingUp, Calendar, Percent, Lock, ChevronRight, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface Deposit {
  id: string;
  name: string;
  amount: number;
  rate: number;
  term: number; // months
  startDate: Date;
  endDate: Date;
  accruedInterest: number;
  isReplenishable: boolean;
  isWithdrawable: boolean;
}

interface DepositProduct {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  isReplenishable: boolean;
  isWithdrawable: boolean;
  description: string;
}

interface DepositsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit?: (amount: number) => void;
}

const depositProducts: DepositProduct[] = [
  {
    id: "1",
    name: "Максимальный доход",
    minAmount: 50000,
    maxAmount: 10000000,
    minTerm: 6,
    maxTerm: 36,
    baseRate: 18,
    isReplenishable: false,
    isWithdrawable: false,
    description: "Максимальная ставка без возможности снятия",
  },
  {
    id: "2",
    name: "Накопительный",
    minAmount: 10000,
    maxAmount: 5000000,
    minTerm: 3,
    maxTerm: 24,
    baseRate: 15,
    isReplenishable: true,
    isWithdrawable: false,
    description: "Пополняемый вклад с капитализацией",
  },
  {
    id: "3",
    name: "Свободный",
    minAmount: 30000,
    maxAmount: 3000000,
    minTerm: 3,
    maxTerm: 12,
    baseRate: 12,
    isReplenishable: true,
    isWithdrawable: true,
    description: "Гибкие условия снятия и пополнения",
  },
];

const DepositsModal = ({ isOpen, onClose, onOpenDeposit }: DepositsModalProps) => {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([
    {
      id: "1",
      name: "Накопительный",
      amount: 500000,
      rate: 15,
      term: 12,
      startDate: new Date(Date.now() - 90 * 86400000),
      endDate: new Date(Date.now() + 275 * 86400000),
      accruedInterest: 18750,
      isReplenishable: true,
      isWithdrawable: false,
    },
  ]);
  
  const [view, setView] = useState<"list" | "products" | "calculator" | "detail">("list");
  const [selectedProduct, setSelectedProduct] = useState<DepositProduct | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  
  const [calcAmount, setCalcAmount] = useState(100000);
  const [calcTerm, setCalcTerm] = useState(12);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  };

  const calculateInterest = (amount: number, rate: number, months: number) => {
    return Math.round(amount * (rate / 100) * (months / 12));
  };

  const getRateForTerm = (product: DepositProduct, term: number) => {
    // Longer terms get slightly higher rates
    const termBonus = Math.min((term - product.minTerm) * 0.1, 2);
    return product.baseRate + termBonus;
  };

  const handleOpenDeposit = () => {
    if (!selectedProduct) return;

    const rate = getRateForTerm(selectedProduct, calcTerm);
    const newDeposit: Deposit = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      amount: calcAmount,
      rate,
      term: calcTerm,
      startDate: new Date(),
      endDate: new Date(Date.now() + calcTerm * 30 * 86400000),
      accruedInterest: 0,
      isReplenishable: selectedProduct.isReplenishable,
      isWithdrawable: selectedProduct.isWithdrawable,
    };

    setDeposits([...deposits, newDeposit]);
    onOpenDeposit?.(calcAmount);
    setView("list");
    setSelectedProduct(null);
    toast({ title: "Вклад открыт", description: `${selectedProduct.name} на ${formatCurrency(calcAmount)}` });
  };

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalInterest = deposits.reduce((sum, d) => sum + d.accruedInterest, 0);

  if (selectedDeposit && view === "detail") {
    const daysLeft = Math.ceil((selectedDeposit.endDate.getTime() - Date.now()) / 86400000);
    const totalDays = Math.ceil((selectedDeposit.endDate.getTime() - selectedDeposit.startDate.getTime()) / 86400000);
    const progress = ((totalDays - daysLeft) / totalDays) * 100;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => { setView("list"); setSelectedDeposit(null); }} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedDeposit.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-primary/10 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Сумма вклада</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(selectedDeposit.amount)}</p>
              <p className="text-sm text-success mt-2">
                +{formatCurrency(selectedDeposit.accruedInterest)} начислено
              </p>
            </div>

            <div className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ставка</span>
                <span className="font-semibold text-primary">{selectedDeposit.rate}% годовых</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Срок</span>
                <span className="font-semibold">{selectedDeposit.term} мес.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Открыт</span>
                <span className="font-semibold">{selectedDeposit.startDate.toLocaleDateString("ru-RU")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Закрытие</span>
                <span className="font-semibold">{selectedDeposit.endDate.toLocaleDateString("ru-RU")}</span>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Прогресс</span>
                <span className="text-sm font-medium">{daysLeft} дней до закрытия</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex gap-2">
              {selectedDeposit.isReplenishable && (
                <Button variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Пополнить
                </Button>
              )}
              {selectedDeposit.isWithdrawable && (
                <Button variant="outline" className="flex-1">
                  Снять часть
                </Button>
              )}
            </div>

            <div className="bg-muted rounded-xl p-4">
              <h4 className="font-medium mb-2">Ожидаемый доход</h4>
              <p className="text-2xl font-bold text-success">
                +{formatCurrency(calculateInterest(selectedDeposit.amount, selectedDeposit.rate, selectedDeposit.term))}
              </p>
              <p className="text-sm text-muted-foreground">за весь срок вклада</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectedProduct && view === "calculator") {
    const rate = getRateForTerm(selectedProduct, calcTerm);
    const expectedInterest = calculateInterest(calcAmount, rate, calcTerm);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setView("products")} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedProduct.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Сумма вклада</label>
                  <span className="text-sm text-primary font-medium">{formatCurrency(calcAmount)}</span>
                </div>
                <Slider
                  value={[calcAmount]}
                  onValueChange={([val]) => setCalcAmount(val)}
                  min={selectedProduct.minAmount}
                  max={selectedProduct.maxAmount}
                  step={10000}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatCurrency(selectedProduct.minAmount)}</span>
                  <span>{formatCurrency(selectedProduct.maxAmount)}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Срок</label>
                  <span className="text-sm text-primary font-medium">{calcTerm} мес.</span>
                </div>
                <Slider
                  value={[calcTerm]}
                  onValueChange={([val]) => setCalcTerm(val)}
                  min={selectedProduct.minTerm}
                  max={selectedProduct.maxTerm}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{selectedProduct.minTerm} мес.</span>
                  <span>{selectedProduct.maxTerm} мес.</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Ставка</p>
                  <p className="text-2xl font-bold text-primary">{rate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Доход за срок</p>
                  <p className="text-2xl font-bold text-success">+{formatCurrency(expectedInterest)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">В конце срока получите</p>
                <p className="text-xl font-bold">{formatCurrency(calcAmount + expectedInterest)}</p>
              </div>
            </div>

            <div className="flex gap-2 text-sm">
              {selectedProduct.isReplenishable && (
                <span className="px-2 py-1 bg-success/10 text-success rounded-full">Пополняемый</span>
              )}
              {selectedProduct.isWithdrawable && (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full">Частичное снятие</span>
              )}
              {!selectedProduct.isReplenishable && !selectedProduct.isWithdrawable && (
                <span className="px-2 py-1 bg-warning/10 text-warning rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Без досрочного снятия
                </span>
              )}
            </div>

            <Button className="w-full" onClick={handleOpenDeposit}>
              Открыть вклад
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (view === "products") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              Открыть вклад
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {depositProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => { setSelectedProduct(product); setView("calculator"); }}
                className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{product.baseRate}%</p>
                    <p className="text-xs text-muted-foreground">годовых</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    от {formatCurrency(product.minAmount)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    {product.minTerm}-{product.maxTerm} мес.
                  </span>
                </div>
              </button>
            ))}
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
            <Landmark className="w-5 h-5" />
            Вклады
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {deposits.length > 0 && (
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Всего на вкладах</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalDeposits)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Начислено</p>
                  <p className="text-lg font-bold text-success">+{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full gap-2" onClick={() => setView("products")}>
            <Plus className="w-4 h-4" />
            Открыть новый вклад
          </Button>

          {deposits.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Мои вклады</h4>
              {deposits.map((deposit) => (
                <button
                  key={deposit.id}
                  onClick={() => { setSelectedDeposit(deposit); setView("detail"); }}
                  className="w-full p-4 bg-card rounded-xl flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{deposit.name}</p>
                    <p className="text-sm text-muted-foreground">{deposit.rate}% • {deposit.term} мес.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(deposit.amount)}</p>
                    <p className="text-xs text-success">+{formatCurrency(deposit.accruedInterest)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Landmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>У вас пока нет вкладов</p>
              <p className="text-sm">Откройте вклад и получайте до 18% годовых</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositsModal;
