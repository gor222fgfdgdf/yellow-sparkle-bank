import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, BarChart3, PieChart, History } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity: number;
  avgPrice: number;
}

interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
}

interface InvestmentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioValue: number;
}

const stocks: Stock[] = [
  { id: "1", symbol: "SBER", name: "Сбербанк", price: 271.5, change: 3.2, changePercent: 1.19, quantity: 100, avgPrice: 245 },
  { id: "2", symbol: "GAZP", name: "Газпром", price: 167.8, change: -2.1, changePercent: -1.24, quantity: 50, avgPrice: 175 },
  { id: "3", symbol: "LKOH", name: "Лукойл", price: 7234, change: 45, changePercent: 0.63, quantity: 10, avgPrice: 6800 },
  { id: "4", symbol: "YNDX", name: "Яндекс", price: 3890, change: 78, changePercent: 2.05, quantity: 25, avgPrice: 3500 },
  { id: "5", symbol: "MGNT", name: "Магнит", price: 5120, change: -35, changePercent: -0.68, quantity: 15, avgPrice: 5000 },
];

const trades: Trade[] = [
  { id: "1", symbol: "SBER", type: "buy", quantity: 50, price: 268, date: "12 дек" },
  { id: "2", symbol: "YNDX", type: "buy", quantity: 10, price: 3780, date: "10 дек" },
  { id: "3", symbol: "GAZP", type: "sell", quantity: 20, price: 170, date: "8 дек" },
  { id: "4", symbol: "LKOH", type: "buy", quantity: 5, price: 7100, date: "5 дек" },
];

const chartData = [
  { date: "Ноя", value: 1150000 },
  { date: "1 дек", value: 1180000 },
  { date: "5 дек", value: 1220000 },
  { date: "10 дек", value: 1195000 },
  { date: "15 дек", value: 1250000 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const InvestmentPortfolioModal = ({ isOpen, onClose, portfolioValue }: InvestmentPortfolioModalProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [isTrading, setIsTrading] = useState(false);

  const totalValue = stocks.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalCost = stocks.reduce((sum, s) => sum + s.avgPrice * s.quantity, 0);
  const totalProfit = totalValue - totalCost;
  const profitPercent = ((totalValue - totalCost) / totalCost * 100).toFixed(2);

  const pieData = stocks.map(s => ({
    name: s.symbol,
    value: s.price * s.quantity
  }));

  const handleTrade = async () => {
    if (!selectedStock || !quantity) return;
    
    setIsTrading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const action = tradeType === "buy" ? "Куплено" : "Продано";
    toast.success(`${action} ${quantity} акций ${selectedStock.symbol}`);
    
    setIsTrading(false);
    setSelectedStock(null);
    setQuantity("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">Инвестиционный портфель</SheetTitle>
        </SheetHeader>

        <div className="h-[calc(90vh-100px)] overflow-y-auto">
          {/* Portfolio Summary */}
          <div className="bg-card rounded-2xl p-4 border border-border mb-4">
            <p className="text-sm text-muted-foreground mb-1">Стоимость портфеля</p>
            <p className="text-3xl font-bold text-foreground">{totalValue.toLocaleString("ru-RU")} ₽</p>
            <div className={`flex items-center gap-1 mt-2 ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString("ru-RU")} ₽</span>
              <span className="text-sm">({profitPercent}%)</span>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-card rounded-2xl p-4 border border-border mb-4">
            <h3 className="font-semibold text-foreground mb-4">Динамика портфеля</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis hide domain={["dataMin - 50000", "dataMax + 50000"]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Tabs defaultValue="stocks">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="stocks">Акции</TabsTrigger>
              <TabsTrigger value="allocation">Структура</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-3">
              {selectedStock ? (
                <div className="space-y-4">
                  <button onClick={() => setSelectedStock(null)} className="text-primary text-sm">
                    ← Назад к списку
                  </button>

                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{selectedStock.symbol}</h3>
                        <p className="text-muted-foreground">{selectedStock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">{selectedStock.price.toLocaleString("ru-RU")} ₽</p>
                        <p className={`text-sm ${selectedStock.change >= 0 ? "text-success" : "text-destructive"}`}>
                          {selectedStock.change >= 0 ? "+" : ""}{selectedStock.change} ({selectedStock.changePercent}%)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">В портфеле</p>
                        <p className="font-bold text-foreground">{selectedStock.quantity} шт.</p>
                      </div>
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">Средняя цена</p>
                        <p className="font-bold text-foreground">{selectedStock.avgPrice.toLocaleString("ru-RU")} ₽</p>
                      </div>
                    </div>

                    <div className="bg-muted rounded-xl p-3 mb-4">
                      <p className="text-sm text-muted-foreground">Прибыль/Убыток</p>
                      <p className={`font-bold ${(selectedStock.price - selectedStock.avgPrice) * selectedStock.quantity >= 0 ? "text-success" : "text-destructive"}`}>
                        {((selectedStock.price - selectedStock.avgPrice) * selectedStock.quantity >= 0 ? "+" : "")}
                        {((selectedStock.price - selectedStock.avgPrice) * selectedStock.quantity).toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={tradeType === "buy" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setTradeType("buy")}
                      >
                        Купить
                      </Button>
                      <Button
                        variant={tradeType === "sell" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setTradeType("sell")}
                      >
                        Продать
                      </Button>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Количество</p>
                      <Input
                        type="number"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>

                    {quantity && (
                      <div className="bg-muted rounded-xl p-3">
                        <p className="text-sm text-muted-foreground">Сумма сделки</p>
                        <p className="font-bold text-foreground">
                          {(selectedStock.price * Number(quantity)).toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                    )}

                    <Button onClick={handleTrade} className="w-full" disabled={!quantity || isTrading}>
                      {isTrading ? "Выполнение..." : tradeType === "buy" ? "Купить" : "Продать"}
                    </Button>
                  </div>
                </div>
              ) : (
                stocks.map(stock => (
                  <button
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">{stock.quantity} шт.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{stock.price.toLocaleString("ru-RU")} ₽</p>
                      <p className={`text-sm ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.changePercent}%
                      </p>
                    </div>
                  </button>
                ))
              )}
            </TabsContent>

            <TabsContent value="allocation">
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Распределение активов</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-4">
                  {stocks.map((stock, i) => (
                    <div key={stock.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-foreground">{stock.symbol}</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {((stock.price * stock.quantity / totalValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {trades.map(trade => (
                <div key={trade.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      trade.type === "buy" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {trade.type === "buy" ? (
                        <ArrowDownRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{trade.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {trade.type === "buy" ? "Покупка" : "Продажа"} • {trade.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{trade.quantity} шт.</p>
                    <p className="text-sm text-muted-foreground">{(trade.price * trade.quantity).toLocaleString("ru-RU")} ₽</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InvestmentPortfolioModal;
