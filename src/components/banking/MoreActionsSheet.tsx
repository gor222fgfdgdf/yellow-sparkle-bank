import { useState } from "react";
import { X, FileText, Settings, Bell, HelpCircle, Shield, Gift, Download, Share2, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface MoreActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoreActionsSheet = ({ isOpen, onClose }: MoreActionsSheetProps) => {
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
              <button
                key={statement.month}
                onClick={() => handleDownloadStatement(statement.month)}
                className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
              >
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
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-foreground">Операции</p>
                <p className="text-sm text-muted-foreground">Уведомления о платежах</p>
              </div>
              <Switch
                checked={notificationSettings.transactions}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, transactions: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-foreground">Низкий баланс</p>
                <p className="text-sm text-muted-foreground">При балансе ниже 5000 ₽</p>
              </div>
              <Switch
                checked={notificationSettings.lowBalance}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowBalance: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-foreground">Акции</p>
                <p className="text-sm text-muted-foreground">Скидки и предложения</p>
              </div>
              <Switch
                checked={notificationSettings.promotions}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, promotions: checked })}
              />
            </div>
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

          <div className="space-y-3">
            <Button className="w-full" onClick={handleShareReferral}>
              <Share2 className="w-5 h-5 mr-2" />
              Поделиться ссылкой
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>Вы заработали: <span className="font-semibold text-foreground">3 000 ₽</span> (3 приглашения)</p>
            </div>
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
            <button
              onClick={() => toast({ title: "Пароль", description: "Ссылка для смены пароля отправлена!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Сменить пароль</span>
              <Check className="w-5 h-5 text-green-500" />
            </button>
            <button
              onClick={() => toast({ title: "2FA", description: "Двухфакторная аутентификация включена!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Включить 2FA</span>
              <Check className="w-5 h-5 text-green-500" />
            </button>
            <button
              onClick={() => toast({ title: "Конфиденциальность", description: "Настройки обновлены!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Настройки приватности</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "help") {
    const helpTopics = [
      { title: "Начало работы", description: "Для новых пользователей" },
      { title: "Платежи и переводы", description: "Как отправлять и получать деньги" },
      { title: "Управление картами", description: "Заморозка, лимиты и другое" },
      { title: "Советы по безопасности", description: "Защитите свой аккаунт" },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад</span>
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Справка</h2>

          <div className="space-y-3">
            {helpTopics.map((topic) => (
              <button
                key={topic.title}
                onClick={() => toast({ title: topic.title, description: "Статья открыта!" })}
                className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors text-left"
              >
                <HelpCircle className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{topic.title}</p>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => toast({ title: "Язык", description: "Язык изменён!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Язык</span>
              <span className="text-muted-foreground">Русский</span>
            </button>
            <button
              onClick={() => toast({ title: "Валюта", description: "Валюта: RUB" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Валюта</span>
              <span className="text-muted-foreground">RUB (₽)</span>
            </button>
            <button
              onClick={() => toast({ title: "О приложении", description: "Версия 1.0.0" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Версия</span>
              <span className="text-muted-foreground">1.0.0</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    { icon: FileText, label: "Выписки", description: "Скачать выписки по счёту", section: "statements" },
    { icon: Bell, label: "Уведомления", description: "Настройки оповещений", section: "notifications" },
    { icon: Shield, label: "Безопасность", description: "Конфиденциальность", section: "security" },
    { icon: Gift, label: "Пригласи друга", description: "Получи 1000 ₽ за каждого", section: "referral" },
    { icon: Settings, label: "Настройки", description: "Параметры приложения", section: "settings" },
    { icon: HelpCircle, label: "Справка", description: "Вопросы и ответы", section: "help" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Ещё</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => setActiveSection(action.section)}
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
