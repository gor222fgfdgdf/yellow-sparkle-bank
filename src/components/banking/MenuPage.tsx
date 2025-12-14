import { useState } from "react";
import { User, CreditCard, Shield, Bell, Palette, LogOut, ChevronRight, ArrowLeft, X, Check, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface MenuPageProps {
  onOpenCardManagement: () => void;
}

const MenuPage = ({ onOpenCardManagement }: MenuPageProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(profileData);

  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    biometrics: true,
    twoFactor: false,
    loginNotifications: true,
  });

  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState({
    transactions: true,
    lowBalance: true,
    promotions: false,
    security: true,
    emailNotifications: true,
  });

  // Appearance state
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = () => {
    setProfileData(tempProfile);
    setEditingProfile(false);
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
  };

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  };

  // Profile Section
  if (activeSection === "profile") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Menu</span>
        </button>

        <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-foreground">AJ</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
            <p className="text-muted-foreground">Personal Account</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 space-y-4">
          {editingProfile ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
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
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <input
                  type="text"
                  value={tempProfile.address}
                  onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingProfile(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSaveProfile}>Save</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{profileData.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{profileData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{profileData.phone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{profileData.address}</span>
              </div>
              <Button className="w-full mt-4" onClick={() => { setTempProfile(profileData); setEditingProfile(true); }}>
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Security Section
  if (activeSection === "security") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Menu</span>
        </button>

        <h2 className="text-lg font-bold text-foreground">Security Settings</h2>

        <div className="bg-card rounded-2xl divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Biometric Login</p>
              <p className="text-sm text-muted-foreground">Use fingerprint or Face ID</p>
            </div>
            <Switch
              checked={securitySettings.biometrics}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, biometrics: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Extra security for your account</p>
            </div>
            <Switch
              checked={securitySettings.twoFactor}
              onCheckedChange={(checked) => {
                setSecuritySettings({ ...securitySettings, twoFactor: checked });
                if (checked) toast({ title: "2FA Enabled", description: "Two-factor authentication is now active." });
              }}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Login Notifications</p>
              <p className="text-sm text-muted-foreground">Get alerted on new logins</p>
            </div>
            <Switch
              checked={securitySettings.loginNotifications}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
            />
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => toast({ title: "Password Reset", description: "Password reset email sent!" })}>
          Change Password
        </Button>
      </div>
    );
  }

  // Notifications Section
  if (activeSection === "notifications") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Menu</span>
        </button>

        <h2 className="text-lg font-bold text-foreground">Notification Settings</h2>

        <div className="bg-card rounded-2xl divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Transaction Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified for every transaction</p>
            </div>
            <Switch
              checked={notificationSettings.transactions}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, transactions: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Low Balance Alerts</p>
              <p className="text-sm text-muted-foreground">Alert when balance is low</p>
            </div>
            <Switch
              checked={notificationSettings.lowBalance}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowBalance: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Promotions & Offers</p>
              <p className="text-sm text-muted-foreground">Special deals and cashback</p>
            </div>
            <Switch
              checked={notificationSettings.promotions}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, promotions: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Security Alerts</p>
              <p className="text-sm text-muted-foreground">Important security updates</p>
            </div>
            <Switch
              checked={notificationSettings.security}
              onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, security: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
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

  // Appearance Section
  if (activeSection === "appearance") {
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Menu</span>
        </button>

        <h2 className="text-lg font-bold text-foreground">Appearance</h2>

        <div className="bg-card rounded-2xl p-4">
          <p className="font-medium text-foreground mb-4">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                !darkMode ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <Sun className="w-8 h-8 text-primary" />
              <span className="font-medium text-foreground">Light</span>
              {!darkMode && <Check className="w-5 h-5 text-primary" />}
            </button>
            <button
              onClick={() => {
                setDarkMode(true);
                toast({ title: "Dark Mode", description: "Dark mode will be available soon!" });
              }}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                darkMode ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <Moon className="w-8 h-8 text-muted-foreground" />
              <span className="font-medium text-foreground">Dark</span>
              {darkMode && <Check className="w-5 h-5 text-primary" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: User, label: "Profile", description: "Personal information", section: "profile" },
    { icon: CreditCard, label: "Cards", description: "Manage your cards", action: onOpenCardManagement },
    { icon: Shield, label: "Security", description: "Password & biometrics", section: "security" },
    { icon: Bell, label: "Notifications", description: "Push & email alerts", section: "notifications" },
    { icon: Palette, label: "Appearance", description: "Theme settings", section: "appearance" },
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
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">AJ</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{profileData.name}</h2>
          <p className="text-sm text-muted-foreground">{profileData.email}</p>
        </div>
      </div>

      {/* Menu Items */}
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

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl hover:bg-destructive/10 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-5 h-5 text-destructive" />
        </div>
        <span className="font-medium text-destructive">Log Out</span>
      </button>
    </div>
  );
};

export default MenuPage;
