import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Euro, CircleDollarSign, ArrowRightLeft, Plus, TrendingUp, TrendingDown, History, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, ResponsiveContainer } from "recharts";

interface CurrencyAccount {
  id: string;
  currency: string;
  symbol: string;
  balance: number;
  icon: any;
  rate: number;
  change: number;
}

interface CurrencyTransaction {
  id: string;
  type: "exchange" | "deposit" | "withdrawal";
  fromCurrency?: string;
  toCurrency?: string;
  currency?: string;
  fromAmount?: number;
  toAmount?: number;
  amount?: number;
  date: string;
}

interface MultiCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencyAccounts: CurrencyAccount[] = [
  { id: "usd", currency: "USD", symbol: "$", balance: 1250.50, icon: DollarSign, rate: 92.45, change: 0.35 },
  { id: "eur", currency: "EUR", symbol: "€", balance: 890.25, icon: Euro, rate: 100.12, change: -0.18 },
  { id: "cny", currency: "CNY", symbol: "¥", balance: 5000.00, icon: CircleDollarSign, rate: 12.85, change: 0.12 },
];

const rateHistory = [
  { date: "1", usd: 91.5, eur: 99.8 },
  { date: "5", usd: 92.0, eur: 100.2 },
  { date: "10", usd: 91.8, eur: 99.5 },
  { date: "15", usd: 92.5, eur: 100.5 },
  { date: "20", usd: 92.2, eur: 100.0 },
  { date: "Сейчас", usd: 92.45, eur: 100.12 },
];

const transactions: CurrencyTransaction[] = [
  { id: "1", type: "exchange", fromCurrency: "RUB", toCurrency: "USD", fromAmount: 92450, toAmount: 1000, date: "10 дек" },
  { id: "2", type: "deposit", currency: "EUR", amount: 500, date: "5 дек" },
  { id: "3", type: "exchange", fromCurrency: "USD", toCurrency: "EUR", fromAmount: 500, toAmount: 460, date: "1 дек" },
];

const MultiCurrencyModal = ({ isOpen, onClose }: MultiCurrencyModalProps) => {
  const [selectedAccount, setSelectedAccount] = useState<CurrencyAccount | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeFrom, setExchangeFrom] = useState<string>("rub");
  const [exchangeTo, setExchangeTo] = useState<string>("usd");
  const [exchangeAmount, setExchangeAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const getExchangeRate = (from: string, to: string) => {
    if (from === "rub") {
      const account = currencyAccounts.find(a => a.id === to);
      return account ? 1 / account.rate : 1;
    }
    if (to === "rub") {
      const account = currencyAccounts.find(a => a.id === from);
      return account?.rate || 1;
    }
    const fromAccount = currencyAccounts.find(a => a.id === from);
    const toAccount = currencyAccounts.find(a => a.id === to);
    if (fromAccount && toAccount) {
      return fromAccount.rate / toAccount.rate;
    }
    return 1;
  };

  const calculateExchangeResult = () => {
    const amount = parseFloat(exchangeAmount) || 0;
    const rate = getExchangeRate(exchangeFrom, exchangeTo);
    return (amount * rate).toFixed(2);
  };

  const handleExchange = async () => {
    if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) {
      toast.error("Введите сумму");
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Обмен выполнен: ${exchangeAmount} → ${calculateExchangeResult()}`);
    setIsProcessing(false);
    setIsExchanging(false);
    setExchangeAmount("");
  };

  const totalInRub = currencyAccounts.reduce((sum, acc) => sum + acc.balance * acc.rate, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
            Мультивалютные счета
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(90vh-100px)] overflow-y-auto space-y-4">
          {/* Total Balance */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Общий баланс в рублях</p>
            <p className="text-3xl font-bold text-foreground">{totalInRub.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽</p>
          </div>

          {isExchanging ? (
            <div className="space-y-4">
              <button onClick={() => setIsExchanging(false)} className="text-primary text-sm">
                ← Назад к счетам
              </button>

              <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
                <h3 className="font-semibold text-foreground">Обмен валюты</h3>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Отдаёте</p>
                  <div className="flex gap-2">
                    <select
                      value={exchangeFrom}
                      onChange={(e) => setExchangeFrom(e.target.value)}
                      className="flex-shrink-0 bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
                    >
                      <option value="rub">RUB</option>
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                      <option value="cny">CNY</option>
                    </select>
                    <Input
                      type="number"
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const temp = exchangeFrom;
                      setExchangeFrom(exchangeTo);
                      setExchangeTo(temp);
                    }}
                    className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                  </button>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Получаете</p>
                  <div className="flex gap-2">
                    <select
                      value={exchangeTo}
                      onChange={(e) => setExchangeTo(e.target.value)}
                      className="flex-shrink-0 bg-muted border border-border rounded-lg px-3 py-2 text-foreground"
                    >
                      <option value="rub">RUB</option>
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                      <option value="cny">CNY</option>
                    </select>
                    <Input
                      type="text"
                      value={calculateExchangeResult()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="bg-muted rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">
                    Курс: 1 {exchangeFrom.toUpperCase()} = {getExchangeRate(exchangeFrom, exchangeTo).toFixed(4)} {exchangeTo.toUpperCase()}
                  </p>
                </div>

                <Button onClick={handleExchange} className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Обмен..." : "Обменять"}
                </Button>
              </div>
            </div>
          ) : selectedAccount ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedAccount(null)} className="text-primary text-sm">
                ← Назад к счетам
              </button>

              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <selectedAccount.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedAccount.currency}</h3>
                    <p className="text-muted-foreground">Валютный счёт</p>
                  </div>
                </div>

                <p className="text-3xl font-bold text-foreground mb-2">
                  {selectedAccount.symbol}{selectedAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-muted-foreground">
                  ≈ {(selectedAccount.balance * selectedAccount.rate).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽
                </p>
              </div>

              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3">Курс {selectedAccount.currency}/RUB</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-foreground">{selectedAccount.rate.toFixed(2)} ₽</span>
                  <span className={`flex items-center gap-1 ${selectedAccount.change >= 0 ? "text-success" : "text-destructive"}`}>
                    {selectedAccount.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedAccount.change >= 0 ? "+" : ""}{selectedAccount.change}%
                  </span>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rateHistory}>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey={selectedAccount.currency.toLowerCase()}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsExchanging(true)}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Обменять
                </Button>
                <Button className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Пополнить
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="accounts">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="accounts">Счета</TabsTrigger>
                <TabsTrigger value="history">История</TabsTrigger>
              </TabsList>

              <TabsContent value="accounts" className="space-y-3">
                {currencyAccounts.map(account => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <account.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{account.currency}</p>
                        <p className="text-sm text-muted-foreground">{account.rate.toFixed(2)} ₽</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{account.symbol}{account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      <p className={`text-sm ${account.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {account.change >= 0 ? "+" : ""}{account.change}%
                      </p>
                    </div>
                  </button>
                ))}

                <Button onClick={() => setIsExchanging(true)} variant="outline" className="w-full">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Обмен валюты
                </Button>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "exchange" ? "bg-primary/10" : "bg-success/10"
                      }`}>
                        {tx.type === "exchange" ? (
                          <ArrowRightLeft className="w-5 h-5 text-primary" />
                        ) : (
                          <Plus className="w-5 h-5 text-success" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {tx.type === "exchange" 
                            ? `${tx.fromCurrency} → ${tx.toCurrency}` 
                            : `Пополнение ${tx.currency}`}
                        </p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {tx.type === "exchange" ? (
                        <>
                          <p className="font-medium text-foreground">+{tx.toAmount?.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">-{tx.fromAmount?.toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="font-bold text-success">+{tx.amount}</p>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MultiCurrencyModal;
