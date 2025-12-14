import { User, CreditCard, Shield, Bell, Palette, LogOut, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuPageProps {
  onOpenCardManagement: () => void;
}

const MenuPage = ({ onOpenCardManagement }: MenuPageProps) => {
  const { toast } = useToast();

  const menuItems = [
    { icon: User, label: "Profile", description: "Personal information" },
    { icon: CreditCard, label: "Cards", description: "Manage your cards", action: onOpenCardManagement },
    { icon: Shield, label: "Security", description: "Password & biometrics" },
    { icon: Bell, label: "Notifications", description: "Push & email alerts" },
    { icon: Palette, label: "Appearance", description: "Theme settings" },
  ];

  const handleMenuItem = (item: typeof menuItems[0]) => {
    if (item.action) {
      item.action();
    } else {
      toast({
        title: item.label,
        description: `${item.label} settings coming soon!`,
      });
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
          <h2 className="text-lg font-bold text-foreground">Alex Johnson</h2>
          <p className="text-sm text-muted-foreground">alex.johnson@email.com</p>
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
        onClick={() => toast({ title: "Logout", description: "Logout feature coming soon!" })}
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
