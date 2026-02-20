import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, 
  Star, StarOff, Bell, BellOff, ChevronRight, Info, Calendar,
  Briefcase, BarChart3, Newspaper, AlertCircle, Clock, RefreshCw, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, AreaChart, Area } from "recharts";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity: number;
  avgPrice: number;
  sector: string;
  dividendYield?: number;
  nextDividend?: string;
}

interface Bond {
  id: string;
  name: string;
  coupon: number;
  maturity: string;
  price: number;
  yield: number;
  quantity: number;
}

interface ETF {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity: number;
  avgPrice: number;
  category: string;
}

interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  symbol?: string;
}

interface InvestmentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioValue: number;
}

const stocks: Stock[] = [
  { id: "1", symbol: "SBER", name: "Сбербанк", price: 271.5, change: 3.2, changePercent: 1.19, quantity: 100, avgPrice: 245, sector: "Финансы", dividendYield: 12.5, nextDividend: "Июнь 2025" },
  { id: "2", symbol: "GAZP", name: "Газпром", price: 167.8, change: -2.1, changePercent: -1.24, quantity: 50, avgPrice: 175, sector: "Нефть и газ", dividendYield: 8.2, nextDividend: "Июль 2025" },
  { id: "3", symbol: "LKOH", name: "Лукойл", price: 7234, change: 45, changePercent: 0.63, quantity: 10, avgPrice: 6800, sector: "Нефть и газ", dividendYield: 15.3, nextDividend: "Май 2025" },
  { id: "4", symbol: "YNDX", name: "Яндекс", price: 3890, change: 78, changePercent: 2.05, quantity: 25, avgPrice: 3500, sector: "IT", dividendYield: 0, nextDividend: undefined },
  { id: "5", symbol: "MGNT", name: "Магнит", price: 5120, change: -35, changePercent: -0.68, quantity: 15, avgPrice: 5000, sector: "Ритейл", dividendYield: 9.8, nextDividend: "Апрель 2025" },
];

const availableStocks: Stock[] = [
  { id: "6", symbol: "VTBR", name: "ВТБ", price: 0.018, change: 0.0002, changePercent: 1.12, quantity: 0, avgPrice: 0, sector: "Финансы", dividendYield: 0 },
  { id: "7", symbol: "ROSN", name: "Роснефть", price: 512.5, change: 4.2, changePercent: 0.83, quantity: 0, avgPrice: 0, sector: "Нефть и газ", dividendYield: 10.5 },
  { id: "8", symbol: "NVTK", name: "Новатэк", price: 1156, change: -12, changePercent: -1.03, quantity: 0, avgPrice: 0, sector: "Нефть и газ", dividendYield: 7.8 },
  { id: "9", symbol: "MTSS", name: "МТС", price: 282.3, change: 1.8, changePercent: 0.64, quantity: 0, avgPrice: 0, sector: "Телеком", dividendYield: 14.2 },
  { id: "10", symbol: "POLY", name: "Полюс", price: 13500, change: 250, changePercent: 1.89, quantity: 0, avgPrice: 0, sector: "Металлы", dividendYield: 5.5 },
];

const bonds: Bond[] = [
  { id: "1", name: "ОФЗ 26238", coupon: 7.35, maturity: "2041", price: 68.5, yield: 14.2, quantity: 20 },
  { id: "2", name: "ОФЗ 26243", coupon: 9.8, maturity: "2038", price: 78.2, yield: 13.8, quantity: 30 },
  { id: "3", name: "Сбербанк БО-001P-01", coupon: 12.5, maturity: "2026", price: 102.3, yield: 11.5, quantity: 10 },
];

const etfs: ETF[] = [
  { id: "1", symbol: "TMOS", name: "Тинькофф Индекс МосБиржи", price: 6.25, change: 0.08, changePercent: 1.3, quantity: 500, avgPrice: 5.8, category: "Индексный" },
  { id: "2", symbol: "SBSP", name: "Сбербанк S&P 500", price: 16.8, change: -0.2, changePercent: -1.18, quantity: 200, avgPrice: 15.5, category: "Международный" },
  { id: "3", symbol: "GOLD", name: "Тинькофф Золото", price: 9.45, change: 0.15, changePercent: 1.61, quantity: 300, avgPrice: 8.9, category: "Товарный" },
];

const trades: Trade[] = [
  { id: "1", symbol: "SBER", type: "buy", quantity: 50, price: 268, date: "12 дек" },
  { id: "2", symbol: "YNDX", type: "buy", quantity: 10, price: 3780, date: "10 дек" },
  { id: "3", symbol: "GAZP", type: "sell", quantity: 20, price: 170, date: "8 дек" },
  { id: "4", symbol: "LKOH", type: "buy", quantity: 5, price: 7100, date: "5 дек" },
  { id: "5", symbol: "TMOS", type: "buy", quantity: 200, price: 6.1, date: "3 дек" },
];

const marketIndices: MarketIndex[] = [
  { name: "IMOEX", value: 2845.32, change: 28.5, changePercent: 1.01 },
  { name: "РТС", value: 892.15, change: -5.2, changePercent: -0.58 },
  { name: "S&P 500", value: 6051.25, change: 45.8, changePercent: 0.76 },
];

const news: NewsItem[] = [
  { id: "1", title: "Сбербанк увеличил прибыль на 15% в ноябре", source: "РБК", time: "2ч назад", sentiment: "positive", symbol: "SBER" },
  { id: "2", title: "Газпром сократит инвестпрограмму в 2025 году", source: "Ведомости", time: "4ч назад", sentiment: "negative", symbol: "GAZP" },
  { id: "3", title: "Яндекс запускает новый сервис доставки", source: "Forbes", time: "6ч назад", sentiment: "positive", symbol: "YNDX" },
  { id: "4", title: "ЦБ может повысить ставку до 23%", source: "Коммерсантъ", time: "8ч назад", sentiment: "neutral" },
];

const chartData = [
  { date: "Окт", value: 1050000 },
  { date: "Ноя", value: 1150000 },
  { date: "1 дек", value: 1180000 },
  { date: "5 дек", value: 1220000 },
  { date: "10 дек", value: 1195000 },
  { date: "15 дек", value: 1280000 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const InvestmentPortfolioModal = ({ isOpen, onClose, portfolioValue }: InvestmentPortfolioModalProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>(["SBER", "YNDX"]);
  const [priceAlerts, setPriceAlerts] = useState<string[]>(["GAZP"]);
  const [activeAssetTab, setActiveAssetTab] = useState<"stocks" | "bonds" | "etf">("stocks");
  const [view, setView] = useState<"portfolio" | "market" | "analytics" | "news">("portfolio");

  const totalStocksValue = stocks.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalBondsValue = bonds.reduce((sum, b) => sum + b.price * 10 * b.quantity, 0); // nominal 1000
  const totalETFValue = etfs.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const totalValue = totalStocksValue + totalBondsValue + totalETFValue;
  
  const totalCost = stocks.reduce((sum, s) => sum + s.avgPrice * s.quantity, 0) + 
                    bonds.reduce((sum, b) => sum + 1000 * b.quantity, 0) +
                    etfs.reduce((sum, e) => sum + e.avgPrice * e.quantity, 0);
  const totalProfit = totalValue - totalCost;
  const profitPercent = ((totalValue - totalCost) / totalCost * 100).toFixed(2);

  const expectedDividends = stocks.reduce((sum, s) => {
    if (s.dividendYield) {
      return sum + (s.price * s.quantity * s.dividendYield / 100);
    }
    return sum;
  }, 0);

  const pieData = [
    { name: "Акции", value: totalStocksValue },
    { name: "Облигации", value: totalBondsValue },
    { name: "ETF", value: totalETFValue },
  ];

  const allStocks = [...stocks, ...availableStocks];
  const filteredStocks = allStocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTrade = async () => {
    if (!selectedStock || !quantity) return;
    
    setIsTrading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const action = tradeType === "buy" ? "Куплено" : "Продано";
    const orderInfo = orderType === "limit" ? ` по цене ${limitPrice} ₽` : " по рынку";
    toast.success(`${action} ${quantity} акций ${selectedStock.symbol}${orderInfo}`);
    
    setIsTrading(false);
    setSelectedStock(null);
    setQuantity("");
    setLimitPrice("");
  };

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol));
      toast.info(`${symbol} удалён из избранного`);
    } else {
      setWatchlist([...watchlist, symbol]);
      toast.success(`${symbol} добавлен в избранное`);
    }
  };

  const togglePriceAlert = (symbol: string) => {
    if (priceAlerts.includes(symbol)) {
      setPriceAlerts(priceAlerts.filter(s => s !== symbol));
      toast.info(`Уведомление для ${symbol} отключено`);
    } else {
      setPriceAlerts([...priceAlerts, symbol]);
      toast.success(`Уведомление для ${symbol} включено`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span>Инвестиции</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => toast.info("Данные обновлены")}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(95vh-100px)] overflow-y-auto space-y-4">
          {/* Market Indices */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {marketIndices.map((index) => (
              <div key={index.name} className="flex-shrink-0 bg-card rounded-xl p-3 border border-border min-w-[120px]">
                <p className="text-xs text-muted-foreground">{index.name}</p>
                <p className="font-bold text-foreground">{index.value.toLocaleString("ru-RU")}</p>
                <p className={`text-xs ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {index.change >= 0 ? "+" : ""}{index.changePercent}%
                </p>
              </div>
            ))}
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "portfolio", label: "Портфель", icon: Briefcase },
              { id: "market", label: "Рынок", icon: BarChart3 },
              { id: "analytics", label: "Аналитика", icon: TrendingUp },
              { id: "news", label: "Новости", icon: Newspaper },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={view === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setView(tab.id as any)}
                className="flex-shrink-0"
              >
                <tab.icon className="w-4 h-4 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>

          {view === "portfolio" && (
            <>
              {/* Portfolio Summary */}
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Стоимость портфеля</p>
                <p className="text-3xl font-bold text-foreground">{totalValue.toLocaleString("ru-RU")} ₽</p>
                <div className={`flex items-center gap-2 mt-2 ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">{totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString("ru-RU")} ₽</span>
                  <Badge variant={totalProfit >= 0 ? "default" : "destructive"} className="text-xs">
                    {totalProfit >= 0 ? "+" : ""}{profitPercent}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Акции</p>
                    <p className="font-semibold text-foreground text-sm">{totalStocksValue.toLocaleString("ru-RU")} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Облигации</p>
                    <p className="font-semibold text-foreground text-sm">{totalBondsValue.toLocaleString("ru-RU")} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ETF</p>
                    <p className="font-semibold text-foreground text-sm">{totalETFValue.toLocaleString("ru-RU")} ₽</p>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Динамика портфеля</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis hide domain={["dataMin - 50000", "dataMax + 50000"]} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Asset Tabs */}
              <Tabs value={activeAssetTab} onValueChange={(v) => setActiveAssetTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="stocks">Акции</TabsTrigger>
                  <TabsTrigger value="bonds">Облигации</TabsTrigger>
                  <TabsTrigger value="etf">ETF</TabsTrigger>
                </TabsList>

                <TabsContent value="stocks" className="space-y-3 mt-4">
                  {selectedStock ? (
                    <div className="space-y-4">
                      <button onClick={() => setSelectedStock(null)} className="text-primary text-sm flex items-center gap-1">
                        ← Назад к списку
                      </button>

                      <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-foreground">{selectedStock.symbol}</h3>
                              <button onClick={() => toggleWatchlist(selectedStock.symbol)}>
                                {watchlist.includes(selectedStock.symbol) ? (
                                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                ) : (
                                  <StarOff className="w-5 h-5 text-muted-foreground" />
                                )}
                              </button>
                              <button onClick={() => togglePriceAlert(selectedStock.symbol)}>
                                {priceAlerts.includes(selectedStock.symbol) ? (
                                  <Bell className="w-5 h-5 text-primary" />
                                ) : (
                                  <BellOff className="w-5 h-5 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            <p className="text-muted-foreground">{selectedStock.name}</p>
                            <Badge variant="secondary" className="mt-1">{selectedStock.sector}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-foreground">{selectedStock.price.toLocaleString("ru-RU")} ₽</p>
                            <p className={`text-sm ${selectedStock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {selectedStock.change >= 0 ? "+" : ""}{selectedStock.change} ({selectedStock.changePercent}%)
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-muted rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">В портфеле</p>
                            <p className="font-bold text-foreground">{selectedStock.quantity} шт.</p>
                          </div>
                          <div className="bg-muted rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">Средняя цена</p>
                            <p className="font-bold text-foreground">{selectedStock.avgPrice.toLocaleString("ru-RU")} ₽</p>
                          </div>
                          {selectedStock.dividendYield ? (
                            <>
                              <div className="bg-muted rounded-xl p-3">
                                <p className="text-xs text-muted-foreground">Дивиденды</p>
                                <p className="font-bold text-foreground">{selectedStock.dividendYield}%</p>
                              </div>
                              <div className="bg-muted rounded-xl p-3">
                                <p className="text-xs text-muted-foreground">След. выплата</p>
                                <p className="font-bold text-foreground">{selectedStock.nextDividend || "—"}</p>
                              </div>
                            </>
                          ) : null}
                        </div>

                        {selectedStock.quantity > 0 && (
                          <div className="bg-muted rounded-xl p-3 mb-4">
                            <p className="text-xs text-muted-foreground">Прибыль/Убыток</p>
                            <p className={`font-bold ${(selectedStock.price - selectedStock.avgPrice) * selectedStock.quantity >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {((selectedStock.price - selectedStock.avgPrice) * selectedStock.quantity >= 0 ? "+" : "")}
                              {((selectedStock.price - selectedStock.avgPrice) * selectedStock.quantity).toLocaleString("ru-RU")} ₽
                            </p>
                          </div>
                        )}
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
                            disabled={selectedStock.quantity === 0}
                          >
                            Продать
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant={orderType === "market" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setOrderType("market")}
                          >
                            По рынку
                          </Button>
                          <Button
                            variant={orderType === "limit" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setOrderType("limit")}
                          >
                            Лимитная
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Количество</p>
                            <Input
                              type="number"
                              placeholder="0"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                            />
                          </div>

                          {orderType === "limit" && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Цена</p>
                              <Input
                                type="number"
                                placeholder={selectedStock.price.toString()}
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        {quantity && (
                          <div className="bg-muted rounded-xl p-3">
                            <p className="text-sm text-muted-foreground">Сумма сделки</p>
                            <p className="font-bold text-foreground">
                              {(
                                (orderType === "limit" && limitPrice ? Number(limitPrice) : selectedStock.price) * 
                                Number(quantity)
                              ).toLocaleString("ru-RU")} ₽
                            </p>
                          </div>
                        )}

                        <Button onClick={handleTrade} className="w-full" disabled={!quantity || isTrading}>
                          {isTrading ? "Выполнение..." : tradeType === "buy" ? "Купить" : "Продать"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    stocks.filter(s => s.quantity > 0).map(stock => (
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
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{stock.symbol}</p>
                              {watchlist.includes(stock.symbol) && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{stock.quantity} шт. • {stock.sector}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{(stock.price * stock.quantity).toLocaleString("ru-RU")} ₽</p>
                          <p className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {stock.change >= 0 ? "+" : ""}{stock.changePercent}%
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="bonds" className="space-y-3 mt-4">
                  {bonds.map(bond => (
                    <div key={bond.id} className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{bond.name}</p>
                          <p className="text-sm text-muted-foreground">Погашение: {bond.maturity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{(bond.price * 10 * bond.quantity).toLocaleString("ru-RU")} ₽</p>
                          <p className="text-sm text-green-500">{bond.yield}% доходность</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Купон: <span className="text-foreground">{bond.coupon}%</span></span>
                        <span className="text-muted-foreground">Кол-во: <span className="text-foreground">{bond.quantity} шт.</span></span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="etf" className="space-y-3 mt-4">
                  {etfs.map(etf => (
                    <div key={etf.id} className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{etf.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{etf.symbol}</p>
                            <p className="text-sm text-muted-foreground">{etf.quantity} шт. • {etf.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{(etf.price * etf.quantity).toLocaleString("ru-RU")} ₽</p>
                          <p className={`text-sm ${etf.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {etf.change >= 0 ? "+" : ""}{etf.changePercent}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Trade History */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  История сделок
                </h3>
                <div className="space-y-2">
                  {trades.slice(0, 3).map(trade => (
                    <div key={trade.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          trade.type === "buy" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {trade.type === "buy" ? (
                            <ArrowDownRight className="w-3 h-3 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{trade.symbol}</p>
                          <p className="text-xs text-muted-foreground">{trade.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{trade.quantity} шт.</p>
                        <p className="text-xs text-muted-foreground">{(trade.price * trade.quantity).toLocaleString("ru-RU")} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === "market" && (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск акций..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Watchlist */}
              {watchlist.length > 0 && !searchQuery && (
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Избранное
                  </h3>
                  <div className="space-y-2">
                    {allStocks.filter(s => watchlist.includes(s.symbol)).map(stock => (
                      <button
                        key={stock.id}
                        onClick={() => setSelectedStock(stock)}
                        className="w-full flex items-center justify-between py-2 hover:bg-muted rounded-lg px-2 transition-colors"
                      >
                        <span className="font-medium text-foreground">{stock.symbol}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{stock.price.toLocaleString("ru-RU")} ₽</span>
                          <span className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {stock.change >= 0 ? "+" : ""}{stock.changePercent}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Stocks */}
              <div className="space-y-2">
                {filteredStocks.map(stock => (
                  <button
                    key={stock.id}
                    onClick={() => {
                      setSelectedStock(stock);
                      setView("portfolio");
                    }}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{stock.symbol}</p>
                          {watchlist.includes(stock.symbol) && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{stock.price.toLocaleString("ru-RU")} ₽</p>
                      <p className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.change >= 0 ? "+" : ""}{stock.changePercent}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === "analytics" && (
            <>
              {/* Portfolio Allocation */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Структура портфеля</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={40}
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
              </div>

              {/* Dividend Calendar */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Дивидендный календарь
                </h3>
                <div className="bg-primary/10 rounded-xl p-3 mb-4">
                  <p className="text-sm text-muted-foreground">Ожидаемые дивиденды за год</p>
                  <p className="text-2xl font-bold text-foreground">{expectedDividends.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽</p>
                </div>
                <div className="space-y-2">
                  {stocks.filter(s => s.dividendYield && s.dividendYield > 0).map(stock => (
                    <div key={stock.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">{stock.nextDividend}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{stock.dividendYield}%</p>
                        <p className="text-sm text-muted-foreground">
                          ~{((stock.price * stock.quantity * stock.dividendYield!) / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Allocation */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3">По секторам</h3>
                <div className="space-y-2">
                  {Array.from(new Set(stocks.filter(s => s.quantity > 0).map(s => s.sector))).map(sector => {
                    const sectorStocks = stocks.filter(s => s.sector === sector && s.quantity > 0);
                    const sectorValue = sectorStocks.reduce((sum, s) => sum + s.price * s.quantity, 0);
                    const percentage = (sectorValue / totalStocksValue * 100).toFixed(1);
                    return (
                      <div key={sector} className="flex items-center justify-between">
                        <span className="text-foreground">{sector}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {view === "news" && (
            <div className="space-y-3">
              {news.map(item => (
                <div key={item.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.sentiment === "positive" ? "bg-green-500/10" :
                      item.sentiment === "negative" ? "bg-red-500/10" : "bg-muted"
                    }`}>
                      {item.sentiment === "positive" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : item.sentiment === "negative" ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <Info className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground leading-tight">{item.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                        {item.symbol && (
                          <Badge variant="secondary" className="text-xs">{item.symbol}</Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InvestmentPortfolioModal;