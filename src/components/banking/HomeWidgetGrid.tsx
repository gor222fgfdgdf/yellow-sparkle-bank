import { QrCode, Users, BarChart3 } from "lucide-react";
import UnionPayLogo from "./UnionPayLogo";

interface HomeWidgetGridProps {
  totalBalance: number;
  onQRCode?: () => void;
  onReferral?: () => void;
  onCashback?: () => void;
  onAnalytics?: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(value);

const HomeWidgetGrid = ({ totalBalance, onQRCode, onReferral, onCashback, onAnalytics }: HomeWidgetGridProps) => {
  return (
    <div className="bg-card rounded-2xl p-3">
      <div className="grid grid-cols-4 gap-2 auto-rows-auto">
        {/* QR Code */}
        <button onClick={onQRCode} className="bg-background rounded-xl p-3 flex items-center justify-center aspect-square">
          <QrCode className="w-7 h-7 text-foreground" />
        </button>

        {/* UnionPay logo */}
        <button className="bg-background rounded-xl p-3 flex items-center justify-center aspect-square">
          <UnionPayLogo className="w-8 h-8" />
        </button>

        {/* Доступно баллов - spans 2 cols */}
        <button onClick={onCashback} className="bg-background rounded-xl p-3 col-span-2 flex flex-col items-start justify-between relative overflow-hidden">
          <p className="text-sm font-semibold text-foreground">Доступно</p>
          <p className="text-sm text-foreground">баллов</p>
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">4</span>
          </div>
        </button>

        {/* Приведи друга */}
        <button onClick={onReferral} className="bg-primary rounded-xl p-3 col-span-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">Приведи друга</span>
        </button>

        {/* Анализ финансов */}
        <button onClick={onAnalytics} className="bg-background rounded-xl p-3 col-span-2 flex flex-col items-start">
          <p className="text-xs font-semibold text-foreground">Анализ финансов</p>
          <p className="text-xs text-muted-foreground">Всего средств</p>
          <p className="text-base font-bold text-foreground mt-1">{formatCurrency(totalBalance)} ₽</p>
          <div className="w-full h-1.5 bg-primary/20 rounded-full mt-2">
            <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default HomeWidgetGrid;
