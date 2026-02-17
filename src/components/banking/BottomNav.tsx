import { LayoutGrid, Clock, Smile, CreditCard, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "home", icon: LayoutGrid, label: "Главная" },
    { id: "history", icon: Clock, label: "История" },
    { id: "svoe", icon: Smile, label: "Своё", isCenter: true },
    { id: "payments", icon: CreditCard, label: "Платежи" },
    { id: "menu", icon: MoreHorizontal, label: "Ещё" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-40">
      <div className="max-w-lg mx-auto flex justify-around items-end py-1 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center -mt-4"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive ? "bg-primary" : "bg-primary"
                }`}>
                  <tab.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className={`text-[10px] font-medium mt-0.5 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-all ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
