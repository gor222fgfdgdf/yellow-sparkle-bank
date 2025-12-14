import { useState } from "react";
import { User, CreditCard, Shield, Bell, Palette, LogOut, ChevronRight, ArrowLeft, Check, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface MenuPageProps {
  onOpenCardManagement: () => void;
}

const MenuPage = ({ onOpenCardManagement }: MenuPageProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: "Александр Петров",
    email: "alex.petrov@mail.ru",
    phone: "+7 (999) 123-45-67",
    address: "г. Москва, ул. Тверская, д. 15, кв. 42",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(profileData);

  const [securitySettings, setSecuritySettings] = useState({
    biometrics: true,
    twoFactor: false,
    loginNotifications: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    transactions: true,
    lowBalance: true,
    promotions: false,
    security: true,
    emailNotifications: true,
  });

  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = () => {
    setProfileData(tempProfile);
    setEditingProfile(false);
    toast({ title: "Профиль обновлён", description: "Данные успешно сохранены." });
  };

  const handleLogout = () => {
    toast({ title: "Выход", description: "Вы вышли из аккаунта." });
  };

  if (activeSection === "profile") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад</span>
        </button>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-foreground">АП</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
            <p className="text-muted-foreground">Личный счёт</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 space-y-4">
          {editingProfile ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ФИО</label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Телефон</label>
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Адрес</label>
                <input
                  type="text"
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingProfile(false)}>Отмена</Button>
                <Button className="flex-1" onClick={handleSaveProfile}>Сохранить</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Имя</span>
                <span className="font-medium text-foreground">{profileData.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{profileData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Телефон</span>
                <span className="font-medium text-foreground">{profileData.phone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Адрес</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{profileData.address}</span>
              </div>
              <Button className="w-full mt-4" onClick={() => { setTempProfile(profileData); setEditingProfile(true); }}>
                Редактировать
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "security") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад</span>
        </button>

        <h2 className="text-lg font-bold text-foreground">Безопасность</h2>

        <div className="bg-card rounded-2xl divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Биометрия</p>
              <p className="text-sm text-muted-foreground">Вход по отпечатку или Face ID</p>
            </div>
            <Switch
              checked={securitySettings.biometrics}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, biometrics: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Двухфакторная аутентификация</p>
              <p className="text-sm text-muted-foreground">Дополнительная защита</p>
            </div>
            <Switch
              checked={securitySettings.twoFactor}
              onCheckedChange={(checked) => {
                setSecuritySettings({ ...securitySettings, twoFactor: checked });
                if (checked) toast({ title: "2FA включена", description: "Двухфакторная аутентификация активирована." });
              }}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Уведомления о входе</p>
              <p className="text-sm text-muted-foreground">Оповещение о новых входах</p>
            </div>
            <Switch
              checked={securitySettings.loginNotifications}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
            />
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => toast({ title: "Смена пароля", description: "Ссылка отправлена на email!" })}>
          Сменить пароль
        </Button>
      </div>
    );
  }

  if (activeSection === "notifications") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад</span>
        </button>

        <h2 className="text-lg font-bold text-foreground">Уведомления</h2>

        <div className="bg-card rounded-2xl divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Операции</p>
              <p className="text-sm text-muted-foreground">Уведомления о транзакциях</p>
            </div>
            <Switch
              checked={notificationSettings.transactions}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, transactions: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Низкий баланс</p>
              <p className="text-sm text-muted-foreground">Оповещение при балансе ниже 5000 ₽</p>
            </div>
            <Switch
              checked={notificationSettings.lowBalance}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowBalance: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Акции и предложения</p>
              <p className="text-sm text-muted-foreground">Специальные предложения</p>
            </div>
            <Switch
              checked={notificationSettings.promotions}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, promotions: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Безопасность</p>
              <p className="text-sm text-muted-foreground">Важные уведомления</p>
            </div>
            <Switch
              checked={notificationSettings.security}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, security: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Email-рассылка</p>
              <p className="text-sm text-muted-foreground">Получать на почту</p>
            </div>
            <Switch
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "appearance") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад</span>
        </button>

        <h2 className="text-lg font-bold text-foreground">Оформление</h2>

        <div className="bg-card rounded-2xl p-4">
          <p className="font-medium text-foreground mb-4">Тема</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                !darkMode ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <Sun className="w-8 h-8 text-primary" />
              <span className="font-medium text-foreground">Светлая</span>
              {!darkMode && <Check className="w-5 h-5 text-primary" />}
            </button>
            <button
              onClick={() => {
                setDarkMode(true);
                toast({ title: "Тёмная тема", description: "Скоро будет доступна!" });
              }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                darkMode ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <Moon className="w-8 h-8 text-muted-foreground" />
              <span className="font-medium text-foreground">Тёмная</span>
              {darkMode && <Check className="w-5 h-5 text-primary" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: User, label: "Профиль", description: "Личные данные", section: "profile" },
    { icon: CreditCard, label: "Карты", description: "Управление картами", action: onOpenCardManagement },
    { icon: Shield, label: "Безопасность", description: "Пароль и биометрия", section: "security" },
    { icon: Bell, label: "Уведомления", description: "Push и email", section: "notifications" },
    { icon: Palette, label: "Оформление", description: "Тема приложения", section: "appearance" },
  ];

  const handleMenuItem = (item: typeof menuItems[0]) => {
    if (item.action) {
      item.action();
    } else if (item.section) {
      setActiveSection(item.section);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">АП</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{profileData.name}</h2>
          <p className="text-sm text-muted-foreground">{profileData.email}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl divide-y divide-border">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleMenuItem(item)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl hover:bg-destructive/10 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-5 h-5 text-destructive" />
        </div>
        <span className="font-medium text-destructive">Выйти</span>
      </button>
    </div>
  );
};

export default MenuPage;
