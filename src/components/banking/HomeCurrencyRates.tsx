interface HomeCurrencyRatesProps {
  onOpenCurrency?: () => void;
}

const currencies = [
  { code: "USD", name: "Доллар", flag: "🇺🇸", buy: "79,71", sell: "72,49" },
  { code: "CNY", name: "Юань", flag: "🇨🇳", buy: "11,35", sell: "10,90" },
];

const HomeCurrencyRates = ({ onOpenCurrency }: HomeCurrencyRatesProps) => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-foreground">Курсы валют и металлов</h2>
        <button onClick={onOpenCurrency} className="text-sm font-medium text-primary">Ещё</button>
      </div>

      <div className="divide-y divide-border">
        {currencies.map((c) => (
          <div key={c.code} className="flex items-center px-4 py-3 gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
              {c.flag}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{c.code}</p>
              <p className="text-xs text-muted-foreground">{c.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Купить</p>
              <p className="font-semibold text-foreground">{c.buy}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Продать</p>
              <p className="font-semibold text-foreground">{c.sell}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 py-3">
        <div className="w-6 h-1.5 rounded-full bg-primary" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
      </div>
    </div>
  );
};

export default HomeCurrencyRates;
