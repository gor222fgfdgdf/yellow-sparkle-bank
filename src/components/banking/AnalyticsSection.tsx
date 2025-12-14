import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
import { TrendingDown, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Transaction } from "./TransactionList";

interface AnalyticsSectionProps {
  transactions: Transaction[];
}

type PeriodFilter = "current" | "1month" | "2months" | "3months";

const periodLabels: Record<PeriodFilter, string> = {
  current: "Текущий месяц",
  "1month": "За месяц",
  "2months": "За 2 месяца",
  "3months": "За 3 месяца",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Продукты": "#22c55e",
  "Кафе": "#f59e0b",
  "Транспорт": "#3b82f6",
  "Жильё": "#8b5cf6",
  "ЖКХ": "#06b6d4",
  "Покупки": "#ec4899",
  "Развлечения": "#f43f5e",
  "Подписки": "#a855f7",
  "Связь": "#14b8a6",
  "Здоровье": "#ef4444",
  "Спорт": "#10b981",
  "Образование": "#6366f1",
  "Другое": "#6b7280",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(value);
};

const AnalyticsSection = ({ transactions }: AnalyticsSectionProps) => {
  const [period, setPeriod] = useState<PeriodFilter>("current");

  const getMonthsAgo = (dateStr: string): number => {
    if (dateStr === "Сегодня" || dateStr === "Вчера") return 0;
    
    const monthMap: Record<string, number> = {
      "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
      "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
    };
    
    const parts = dateStr.split(" ");
    if (parts.length < 2) return 0;
    
    const monthStr = parts[1].toLowerCase();
    const transMonth = monthMap[monthStr] ?? 11;
    const currentMonth = new Date().getMonth();
    
    let diff = currentMonth - transMonth;
    if (diff < 0) diff += 12;
    return diff;
  };

  const filteredTransactions = useMemo(() => {
    const maxMonths = period === "current" ? 0 : 
                      period === "1month" ? 1 : 
                      period === "2months" ? 2 : 3;

    return transactions.filter(t => {
      const monthsAgo = getMonthsAgo(t.date);
      return monthsAgo <= maxMonths && !t.isIncoming;
    });
  }, [transactions, period]);

  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredTransactions.forEach(t => {
      const cat = t.category;
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS["Другое"],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.value, 0);
  }, [categoryData]);

  const totalIncome = useMemo(() => {
    const maxMonths = period === "current" ? 0 : 
                      period === "1month" ? 1 : 
                      period === "2months" ? 2 : 3;
    return transactions
      .filter(t => getMonthsAgo(t.date) <= maxMonths && t.isIncoming)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, period]);

  // Current month expenses
  const currentMonthExpenses = useMemo(() => {
    return transactions
      .filter(t => getMonthsAgo(t.date) === 0 && !t.isIncoming)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Previous month expenses
  const prevMonthExpenses = useMemo(() => {
    return transactions
      .filter(t => getMonthsAgo(t.date) === 1 && !t.isIncoming)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Category comparison data
  const categoryComparison = useMemo(() => {
    const currentMonthCats: Record<string, number> = {};
    const prevMonthCats: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.isIncoming) return;
      const monthsAgo = getMonthsAgo(t.date);
      if (monthsAgo === 0) {
        currentMonthCats[t.category] = (currentMonthCats[t.category] || 0) + t.amount;
      } else if (monthsAgo === 1) {
        prevMonthCats[t.category] = (prevMonthCats[t.category] || 0) + t.amount;
      }
    });

    const allCategories = new Set([...Object.keys(currentMonthCats), ...Object.keys(prevMonthCats)]);
    
    return Array.from(allCategories).map(cat => ({
      name: cat,
      current: currentMonthCats[cat] || 0,
      previous: prevMonthCats[cat] || 0,
      diff: (currentMonthCats[cat] || 0) - (prevMonthCats[cat] || 0),
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS["Другое"],
    })).sort((a, b) => b.current - a.current);
  }, [transactions]);

  const expensesDiff = currentMonthExpenses - prevMonthExpenses;
  const expensesDiffPercent = prevMonthExpenses > 0 
    ? ((expensesDiff / prevMonthExpenses) * 100).toFixed(1) 
    : "0";

  const topCategories = categoryData.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-foreground">Аналитика расходов</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
          className="text-sm font-medium text-primary bg-transparent border-none cursor-pointer focus:outline-none"
        >
          {Object.entries(periodLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Расходы</span>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalExpenses)} ₽</p>
        </div>
        <div className="bg-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Доходы</span>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalIncome)} ₽</p>
        </div>
      </div>

      {/* Month Comparison Card */}
      <div className="bg-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Сравнение с прошлым месяцем</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Текущий месяц</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(currentMonthExpenses)} ₽</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Прошлый месяц</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(prevMonthExpenses)} ₽</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 p-3 rounded-xl ${
          expensesDiff > 0 ? "bg-red-500/10" : expensesDiff < 0 ? "bg-green-500/10" : "bg-muted"
        }`}>
          {expensesDiff > 0 ? (
            <ArrowUp className="w-5 h-5 text-red-500" />
          ) : expensesDiff < 0 ? (
            <ArrowDown className="w-5 h-5 text-green-500" />
          ) : (
            <Minus className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <span className={`font-semibold ${
              expensesDiff > 0 ? "text-red-500" : expensesDiff < 0 ? "text-green-500" : "text-muted-foreground"
            }`}>
              {expensesDiff > 0 ? "+" : ""}{formatCurrency(Math.abs(expensesDiff))} ₽
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              ({expensesDiff >= 0 ? "+" : ""}{expensesDiffPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Category Comparison */}
      {categoryComparison.length > 0 && (
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Изменение по категориям</h3>
          <div className="space-y-3">
            {categoryComparison.slice(0, 5).map((cat) => {
              const diffPercent = cat.previous > 0 
                ? ((cat.diff / cat.previous) * 100).toFixed(0) 
                : cat.current > 0 ? "+100" : "0";
              return (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(cat.previous)} → {formatCurrency(cat.current)} ₽
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    cat.diff > 0 ? "bg-red-500/10 text-red-500" : 
                    cat.diff < 0 ? "bg-green-500/10 text-green-500" : 
                    "bg-muted text-muted-foreground"
                  }`}>
                    {cat.diff > 0 ? <ArrowUp className="w-3 h-3" /> : 
                     cat.diff < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                    {cat.diff !== 0 ? `${diffPercent}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pie Chart */}
      {categoryData.length > 0 && (
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Расходы по категориям</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {topCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(cat.value)} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      {categoryData.length > 0 && (
        <div className="bg-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Топ категорий</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCategories}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)} ₽`, 'Сумма']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="bg-card rounded-2xl overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground p-4 pb-2">Все категории</h3>
        <div className="divide-y divide-border">
          {categoryData.map((cat) => {
            const percentage = totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : "0";
            return (
              <div key={cat.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{percentage}% от расходов</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">{formatCurrency(cat.value)} ₽</span>
              </div>
            );
          })}
        </div>
      </div>

      {categoryData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Нет расходов за выбранный период
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;
