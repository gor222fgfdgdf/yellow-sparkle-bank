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
    { month: "December 2024", size: "245 KB" },
    { month: "November 2024", size: "312 KB" },
    { month: "October 2024", size: "198 KB" },
    { month: "September 2024", size: "276 KB" },
  ];

  const handleDownloadStatement = (month: string) => {
    toast({ title: "Downloading", description: `${month} statement is being downloaded...` });
  };

  const handleShareReferral = () => {
    navigator.clipboard.writeText(`Join our bank with my code: ${referralCode}`);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  if (!isOpen) return null;

  // Statements Section
  if (activeSection === "statements") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Account Statements</h2>

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

  // Notifications Section
  if (activeSection === "notifications") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Notification Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-foreground">Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Every payment notification</p>
              </div>
              <Switch
                checked={notificationSettings.transactions}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, transactions: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-foreground">Low Balance</p>
                <p className="text-sm text-muted-foreground">Alert below $100</p>
              </div>
              <Switch
                checked={notificationSettings.lowBalance}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowBalance: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-foreground">Promotions</p>
                <p className="text-sm text-muted-foreground">Deals and offers</p>
              </div>
              <Switch
                checked={notificationSettings.promotions}
                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, promotions: checked })}
              />
            </div>
          </div>

          <Button className="w-full mt-6" onClick={() => { toast({ title: "Saved", description: "Notification settings updated" }); setActiveSection(null); }}>
            Save Settings
          </Button>
        </div>
      </div>
    );
  }

  // Referral Section
  if (activeSection === "referral") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Invite Friends</h2>
            <p className="text-muted-foreground mt-2">Share your code and earn $50 for each friend who joins!</p>
          </div>

          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center mb-2">Your Referral Code</p>
            <p className="text-2xl font-bold text-primary text-center">{referralCode}</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={handleShareReferral}>
              <Share2 className="w-5 h-5 mr-2" />
              Share Referral Link
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>You've earned: <span className="font-semibold text-foreground">$150</span> (3 referrals)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Security Section
  if (activeSection === "security") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Security & Privacy</h2>

          <div className="space-y-3">
            <button
              onClick={() => toast({ title: "Password", description: "Password change email sent!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Change Password</span>
              <Check className="w-5 h-5 text-green-500" />
            </button>
            <button
              onClick={() => toast({ title: "2FA", description: "Two-factor authentication enabled!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Enable 2FA</span>
              <Check className="w-5 h-5 text-green-500" />
            </button>
            <button
              onClick={() => toast({ title: "Privacy", description: "Privacy settings updated!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Privacy Settings</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Help Center Section
  if (activeSection === "help") {
    const helpTopics = [
      { title: "Getting Started", description: "New to our app? Start here" },
      { title: "Payments & Transfers", description: "How to send and receive money" },
      { title: "Card Management", description: "Freeze, limits, and more" },
      { title: "Security Tips", description: "Keep your account safe" },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">Help Center</h2>

          <div className="space-y-3">
            {helpTopics.map((topic) => (
              <button
                key={topic.title}
                onClick={() => toast({ title: topic.title, description: "Help article opened!" })}
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

  // Settings Section
  if (activeSection === "settings") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-primary mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">App Settings</h2>

          <div className="space-y-3">
            <button
              onClick={() => toast({ title: "Language", description: "Language settings updated!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Language</span>
              <span className="text-muted-foreground">English</span>
            </button>
            <button
              onClick={() => toast({ title: "Currency", description: "Currency set to USD!" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">Currency</span>
              <span className="text-muted-foreground">USD ($)</span>
            </button>
            <button
              onClick={() => toast({ title: "About", description: "Version 1.0.0" })}
              className="w-full flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-foreground">App Version</span>
              <span className="text-muted-foreground">1.0.0</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    { icon: FileText, label: "Statements", description: "Download account statements", section: "statements" },
    { icon: Bell, label: "Notifications", description: "Manage your alerts", section: "notifications" },
    { icon: Shield, label: "Security", description: "Privacy and security settings", section: "security" },
    { icon: Gift, label: "Referral Program", description: "Invite friends, earn rewards", section: "referral" },
    { icon: Settings, label: "Settings", description: "App preferences", section: "settings" },
    { icon: HelpCircle, label: "Help Center", description: "FAQs and support", section: "help" },
  ];

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
