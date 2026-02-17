import { useState } from "react";
import { X, FileText, Settings, Bell, Shield, Gift, Download, Share2, Check, ArrowLeft, CreditCard, PiggyBank, Calculator, Calendar, Lock, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface MoreActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscriptions?: () => void;
  onOpenStatementExport?: () => void;
  onOpenBudgets?: () => void;
  onOpenSavingsGoals?: () => void;
  onOpenLoans?: () => void;
  onOpenInsurance?: () => void;
  onOpenCalendar?: () => void;
  onSetupPin?: () => void;
}

const MoreActionsSheet = ({ isOpen, onClose, onOpenSubscriptions, onOpenStatementExport, onOpenBudgets, onOpenSavingsGoals, onOpenLoans, onOpenInsurance, onOpenCalendar, onSetupPin }: MoreActionsSheetProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    transactions: true,
    lowBalance: true,
    promotions: false,
  });
  const [referralCode] = useState("ALEX2024");

  const statements = [
    { month: "Декабрь 2024", size: "245 КБ" },
    { month: "Ноябрь 2024", size: "312 КБ" },
    { month: "Октябрь 2024", size: "198 КБ" },
    { month: "Сентябрь 2024", size: "276 КБ" },
  ];

  const handleDownloadStatement = (month: string) => {
    toast({ title: "Загрузка", description: `Выписка за ${month} загружается...` });
  };

  const handleShareReferral = () => {
    navigator.clipboard.writeText(`Присоединяйся к банку с моим кодом: ${referralCode}`);
    toast({ title: "Скопировано!", description: "Ссылка скопирована в буфер обмена" });
  };

  if (!isOpen) return null;

  if (activeSection === "statements") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад</span>
          </button>
          <h2 className="text-xl font-bold text-foreground mb-6">Выписки по счёту</h2>
          <div className="space-y-3">
            {statements.map((statement) => (
              <button key={statement.month} onClick={() => handleDownloadStatement(statement.month)} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{statement.month}</p>
                    <p className="text-sm text-muted-foreground">{statement.size}</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "notifications") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад</span>
          </button>
          <h2 className="text-xl font-bold text-foreground mb-6">Настройки уведомлений</h2>
          <div className="space-y-4">
            {[
              { key: "transactions", label: "Операции", desc: "Уведомления о платежах" },
              { key: "lowBalance", label: "Низкий баланс", desc: "При балансе ниже 5000 ₽" },
              { key: "promotions", label: "Акции", desc: "Скидки и предложения" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={notificationSettings[key as keyof typeof notificationSettings]}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [key]: checked })}
                />
              </div>
            ))}
          </div>
          <Button className="w-full mt-6" onClick={() => { toast({ title: "Сохранено", description: "Настройки обновлены" }); setActiveSection(null); }}>
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  if (activeSection === "referral") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад</span>
          </button>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Приведи друга</h2>
            <p className="text-muted-foreground mt-2">Поделитесь кодом и получите 1000 ₽ за каждого друга!</p>
          </div>
          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center mb-2">Ваш код приглашения</p>
            <p className="text-2xl font-bold text-primary text-center">{referralCode}</p>
          </div>
          <Button className="w-full" onClick={handleShareReferral}>
            <Share2 className="w-5 h-5 mr-2" />
            Поделиться ссылкой
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-3">
            <p>Вы заработали: <span className="font-semibold text-foreground">3 000 ₽</span> (3 приглашения)</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "security") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад</span>
          </button>
          <h2 className="text-xl font-bold text-foreground mb-6">Безопасность</h2>
          <div className="space-y-3">
            <button onClick={() => toast({ title: "Пароль", description: "Ссылка для смены пароля отправлена!" })} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <span className="font-medium text-foreground">Сменить пароль</span>
              <Check className="w-5 h-5 text-primary" />
            </button>
            <button onClick={() => toast({ title: "2FA", description: "Двухфакторная аутентификация включена!" })} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <span className="font-medium text-foreground">Включить 2FA</span>
              <Check className="w-5 h-5 text-primary" />
            </button>
            {onSetupPin && (
              <button onClick={() => { setActiveSection(null); onClose(); onSetupPin(); }} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                <span className="font-medium text-foreground">Установить PIN-код</span>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <button onClick={() => toast({ title: "Конфиденциальность", description: "Настройки обновлены!" })} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
              <span className="font-medium text-foreground">Настройки приватности</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    { icon: FileText, label: "Выписки", description: "Скачать выписки по счёту", onClick: () => onOpenStatementExport ? (onClose(), onOpenStatementExport()) : setActiveSection("statements") },
    { icon: Repeat, label: "Подписки", description: "Управление подписками", onClick: () => onOpenSubscriptions && (onClose(), onOpenSubscriptions()) },
    { icon: Calculator, label: "Бюджеты", description: "Планирование расходов", onClick: () => onOpenBudgets && (onClose(), onOpenBudgets()) },
    { icon: PiggyBank, label: "Цели", description: "Копилки и цели накоплений", onClick: () => onOpenSavingsGoals && (onClose(), onOpenSavingsGoals()) },
    { icon: CreditCard, label: "Кредиты", description: "Кредиты и рассрочки", onClick: () => onOpenLoans && (onClose(), onOpenLoans()) },
    { icon: Shield, label: "Страхование", description: "Защита и страхование", onClick: () => onOpenInsurance && (onClose(), onOpenInsurance()) },
    { icon: Calendar, label: "Календарь", description: "Финансовый календарь", onClick: () => onOpenCalendar && (onClose(), onOpenCalendar()) },
    { icon: Bell, label: "Уведомления", description: "Настройки оповещений", onClick: () => setActiveSection("notifications") },
    { icon: Shield, label: "Безопасность", description: "Конфиденциальность и PIN", onClick: () => setActiveSection("security") },
    { icon: Gift, label: "Пригласи друга", description: "Получи 1000 ₽ за каждого", onClick: () => setActiveSection("referral") },
    { icon: Settings, label: "Настройки", description: "Параметры приложения", onClick: () => setActiveSection("settings") },
  ];

  if (activeSection === "settings") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад</span>
          </button>
          <h2 className="text-xl font-bold text-foreground mb-6">Настройки</h2>
          <div className="space-y-3">
            {[
              { label: "Язык", value: "Русский" },
              { label: "Валюта", value: "RUB (₽)" },
              { label: "Версия", value: "1.0.0" },
            ].map(({ label, value }) => (
              <button key={label} onClick={() => toast({ title: label, description: `${label}: ${value}` })} className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground">{value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Ещё</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{action.label}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreActionsSheet;
