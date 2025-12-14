import { X, FileText, Settings, Bell, HelpCircle, Shield, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoreActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoreActionsSheet = ({ isOpen, onClose }: MoreActionsSheetProps) => {
  const { toast } = useToast();

  const actions = [
    { icon: FileText, label: "Statements", description: "Download account statements" },
    { icon: Bell, label: "Notifications", description: "Manage your alerts" },
    { icon: Shield, label: "Security", description: "Privacy and security settings" },
    { icon: Gift, label: "Referral Program", description: "Invite friends, earn rewards" },
    { icon: Settings, label: "Settings", description: "App preferences" },
    { icon: HelpCircle, label: "Help Center", description: "FAQs and support" },
  ];

  const handleAction = (label: string) => {
    toast({
      title: label,
      description: `${label} feature coming soon!`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">More Actions</h2>
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
              onClick={() => handleAction(action.label)}
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
