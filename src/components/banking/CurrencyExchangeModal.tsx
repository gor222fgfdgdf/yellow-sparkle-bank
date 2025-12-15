import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, ArrowRightLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  buyRate: number;
  sellRate: number;
  change: number;
}

interface CurrencyExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onExchange: (amount: number, from: string, to: string) => void;
}

const formatCurrency = (value: number, decimals = 2) => {
  return new Intl.NumberFormat("ru-RU", { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  }).format(value);
};

const currencies: Currency[] = [
  { code: "USD", name: "Доллар США", symbol: "$", flag: "🇺🇸", buyRate: 92.45, sellRate: 89.80, change: -0.35 },
  { code: "EUR", name: "Евро", symbol: "€", flag: "🇪🇺", buyRate: 100.20, sellRate: 97.50, change: 0.28 },
  { code: "CNY", name: "Юань", symbol: "¥", flag: "🇨🇳", buyRate: 12.85, sellRate: 12.40, change: 0.05 },
  { code: "GBP", name: "Фунт", symbol: "£", flag: "🇬🇧", buyRate: 116.90, sellRate: 113.80, change: -0.42 },
  { code: "JPY", name: "Йена", symbol: "¥", flag: "🇯🇵", buyRate: 0.62, sellRate: 0.59, change: 0.01 },
  { code: "CHF", name: "Франк", symbol: "₣", flag: "🇨🇭", buyRate: 105.30, sellRate: 102.10, change: 0.18 },
];

const CurrencyExchangeModal = ({ isOpen, onClose, balance, onExchange }: CurrencyExchangeModalProps) => {
  const [tab, setTab] = useState<"rates" | "exchange" | "calculator">("rates");
  const [fromCurrency, setFromCurrency] = useState("RUB");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [lastUpdate] = useState(new Date());
  const { toast } = useToast();

  const getRate = (from: string, to: string): number => {
    if (from === "RUB") {
      const currency = currencies.find(c => c.code === to);
      return currency ? 1 / currency.sellRate : 1;
    } else if (to === "RUB") {
      const currency = currencies.find(c => c.code === from);
      return currency ? currency.buyRate : 1;
    } else {
      const fromCur = currencies.find(c => c.code === from);
      const toCur = currencies.find(c => c.code === to);
      if (fromCur && toCur) {
        return fromCur.buyRate / toCur.sellRate;
      }
    }
    return 1;
  };

  const convertedAmount = amount ? parseFloat(amount) * getRate(fromCurrency, toCurrency) : 0;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchange = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({ title: "Ошибка", description: "Введите сумму", variant: "destructive" });
      return;
    }

    if (fromCurrency === "RUB" && amountNum > balance) {
      toast({ title: "Ошибка", description: "Недостаточно средств", variant: "destructive" });
      return;
    }

    onExchange(amountNum, fromCurrency, toCurrency);
    toast({ 
      title: "Обмен выполнен", 
      description: `${formatCurrency(amountNum)} ${fromCurrency} → ${formatCurrency(convertedAmount)} ${toCurrency}` 
    });
    setAmount("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Валюты</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          {[
            { id: "rates", label: "Курсы" },
            { id: "exchange", label: "Обмен" },
            { id: "calculator", label: "Калькулятор" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "rates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Обновлено: {lastUpdate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Обновить
              </Button>
            </div>

            <div className="space-y-2">
              {currencies.map((currency) => (
                <div
                  key={currency.code}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <p className="font-medium text-foreground">{currency.code}</p>
                      <p className="text-sm text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Покупка</p>
                        <p className="font-medium text-foreground">{formatCurrency(currency.buyRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Продажа</p>
                        <p className="font-medium text-foreground">{formatCurrency(currency.sellRate)}</p>
                      </div>
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-sm ${
                      currency.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {currency.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{currency.change >= 0 ? "+" : ""}{formatCurrency(currency.change)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "exchange" && (
          <div className="space-y-6">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Отдаёте</label>
              <div className="flex gap-2">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-24 px-3 py-3 bg-muted rounded-xl text-foreground font-medium"
                >
                  <option value="RUB">🇷🇺 RUB</option>
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-4 py-3 bg-muted rounded-xl text-foreground text-lg font-medium"
                />
              </div>
              {fromCurrency === "RUB" && (
                <p className="text-sm text-muted-foreground">Доступно: {formatCurrency(balance)} ₽</p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-3 rounded-full bg-muted hover:bg-primary/10 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5 text-primary" />
              </button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Получаете</label>
              <div className="flex gap-2">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-24 px-3 py-3 bg-muted rounded-xl text-foreground font-medium"
                >
                  <option value="RUB">🇷🇺 RUB</option>
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <div className="flex-1 px-4 py-3 bg-muted/50 rounded-xl text-foreground text-lg font-medium">
                  {convertedAmount ? formatCurrency(convertedAmount) : "0"}
                </div>
              </div>
            </div>

            {amount && (
              <div className="p-3 bg-muted/50 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">
                  Курс: 1 {fromCurrency} = {formatCurrency(getRate(fromCurrency, toCurrency), 4)} {toCurrency}
                </p>
              </div>
            )}

            <Button className="w-full" onClick={handleExchange} disabled={!amount || parseFloat(amount) <= 0}>
              Обменять
            </Button>
          </div>
        )}

        {tab === "calculator" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Сумма в рублях</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-foreground">₽</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-4 bg-muted rounded-xl text-foreground text-xl font-medium"
                />
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="space-y-2">
                {currencies.map((currency) => {
                  const converted = parseFloat(amount) / currency.sellRate;
                  return (
                    <div
                      key={currency.code}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currency.flag}</span>
                        <span className="font-medium text-foreground">{currency.code}</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">
                        {currency.symbol}{formatCurrency(converted)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyExchangeModal;
