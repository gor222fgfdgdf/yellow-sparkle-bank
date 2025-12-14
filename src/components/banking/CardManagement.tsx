import { useState } from "react";
import { 
  CreditCard, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Settings, 
  Plus, 
  ChevronRight,
  Shield,
  ShoppingCart,
  Plane,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CardManagementProps {
  onClose: () => void;
}

const CardManagement = ({ onClose }: CardManagementProps) => {
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [showOrderCard, setShowOrderCard] = useState(false);
  
  const [limits, setLimits] = useState({
    daily: 2000,
    online: 1000,
    international: 500,
    atm: 500,
  });

  const cardPin = "4829";

  const handleFreezeToggle = () => {
    setIsCardFrozen(!isCardFrozen);
    toast.success(isCardFrozen ? "Card unfrozen" : "Card frozen temporarily");
  };

  const handleOrderCard = () => {
    toast.success("New card ordered! Delivery in 3-5 business days.");
    setShowOrderCard(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (showLimits) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="max-w-lg mx-auto min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => setShowLimits(false)}
                className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 text-foreground" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Spending Limits</h1>
            </div>
          </header>

          <div className="p-4 space-y-6">
            {/* Daily Limit */}
            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Daily Limit</p>
                  <p className="text-sm text-muted-foreground">Maximum per day</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.daily)}</p>
              </div>
              <Slider
                value={[limits.daily]}
                onValueChange={(value) => setLimits({ ...limits, daily: value[0] })}
                max={10000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Online Purchases */}
            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Online Purchases</p>
                  <p className="text-sm text-muted-foreground">Per transaction limit</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.online)}</p>
              </div>
              <Slider
                value={[limits.online]}
                onValueChange={(value) => setLimits({ ...limits, online: value[0] })}
                max={5000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$5,000</span>
              </div>
            </div>

            {/* International */}
            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">International</p>
                  <p className="text-sm text-muted-foreground">Daily foreign limit</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.international)}</p>
              </div>
              <Slider
                value={[limits.international]}
                onValueChange={(value) => setLimits({ ...limits, international: value[0] })}
                max={3000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$3,000</span>
              </div>
            </div>

            {/* ATM Withdrawals */}
            <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">ATM Withdrawals</p>
                  <p className="text-sm text-muted-foreground">Daily cash limit</p>
                </div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(limits.atm)}</p>
              </div>
              <Slider
                value={[limits.atm]}
                onValueChange={(value) => setLimits({ ...limits, atm: value[0] })}
                max={2000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$2,000</span>
              </div>
            </div>

            <Button
              onClick={() => {
                toast.success("Spending limits updated");
                setShowLimits(false);
              }}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showOrderCard) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="max-w-lg mx-auto min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => setShowOrderCard(false)}
                className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 text-foreground" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Order New Card</h1>
            </div>
          </header>

          <div className="p-4 space-y-6">
            {/* Card Preview */}
            <div className="bg-gradient-to-br from-foreground to-neutral-700 rounded-2xl p-6 aspect-[1.6/1] relative overflow-hidden">
              <div className="absolute top-6 left-6">
                <p className="text-card text-sm opacity-70">TinkBank</p>
              </div>
              <div className="absolute bottom-16 left-6">
                <p className="text-card text-lg tracking-widest font-mono">•••• •••• •••• ••••</p>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="text-card/70 text-xs">CARDHOLDER</p>
                <p className="text-card text-sm">ALEX JOHNSON</p>
              </div>
              <div className="absolute bottom-6 right-6">
                <p className="text-card/70 text-xs">VALID THRU</p>
                <p className="text-card text-sm">12/28</p>
              </div>
              <div className="absolute top-6 right-6 w-12 h-8 bg-primary rounded-md" />
            </div>

            {/* Card Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-1">Select card type</p>
              
              {[
                { name: "Standard Debit", desc: "Free delivery", price: "Free" },
                { name: "Gold Debit", desc: "Premium benefits", price: "$9.99/mo" },
                { name: "Platinum Debit", desc: "Exclusive perks", price: "$19.99/mo" },
              ].map((card, index) => (
                <button
                  key={card.name}
                  className={`w-full bg-card rounded-2xl p-4 shadow-sm flex items-center gap-4 text-left transition-all ${
                    index === 0 ? "ring-2 ring-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-12 h-8 bg-gradient-to-br from-foreground to-neutral-600 rounded-md" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{card.name}</p>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                  <p className="font-semibold text-foreground">{card.price}</p>
                </button>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="bg-card rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">Delivery Address</p>
              <p className="text-foreground">123 Main Street, Apt 4B</p>
              <p className="text-muted-foreground">New York, NY 10001</p>
            </div>

            <Button
              onClick={handleOrderCard}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90"
            >
              Order Card - Free
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="max-w-lg mx-auto min-h-screen pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Card Management</h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* Card Visual */}
          <div className={`relative transition-all ${isCardFrozen ? "opacity-60 grayscale" : ""}`}>
            <div className="bg-gradient-to-br from-primary to-amber-400 rounded-2xl p-6 aspect-[1.6/1] relative overflow-hidden shadow-lg">
              <div className="absolute top-6 left-6">
                <p className="text-primary-foreground text-sm font-medium">TinkBank</p>
              </div>
              <div className="absolute bottom-16 left-6">
                <p className="text-primary-foreground text-lg tracking-widest font-mono">•••• •••• •••• 4582</p>
              </div>
              <div className="absolute bottom-6 left-6">
                <p className="text-primary-foreground/70 text-xs">CARDHOLDER</p>
                <p className="text-primary-foreground text-sm font-medium">ALEX JOHNSON</p>
              </div>
              <div className="absolute bottom-6 right-6">
                <p className="text-primary-foreground/70 text-xs">VALID THRU</p>
                <p className="text-primary-foreground text-sm font-medium">12/28</p>
              </div>
              <div className="absolute top-6 right-6 w-12 h-12">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/30 absolute right-0" />
                <div className="w-8 h-8 rounded-full bg-primary-foreground/30 absolute right-4" />
              </div>
            </div>
            {isCardFrozen && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-foreground/80 text-card px-4 py-2 rounded-full flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Card Frozen</span>
                </div>
              </div>
            )}
          </div>

          {/* Freeze Card */}
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isCardFrozen ? "bg-destructive/10" : "bg-success/10"
              }`}>
                {isCardFrozen ? (
                  <Lock className="w-6 h-6 text-destructive" />
                ) : (
                  <Unlock className="w-6 h-6 text-success" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Freeze Card</p>
                <p className="text-sm text-muted-foreground">
                  {isCardFrozen ? "Card is temporarily frozen" : "Temporarily disable your card"}
                </p>
              </div>
              <Switch
                checked={isCardFrozen}
                onCheckedChange={handleFreezeToggle}
              />
            </div>
            {isCardFrozen && (
              <div className="px-4 pb-4">
                <div className="bg-destructive/10 rounded-xl p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    All transactions are blocked while your card is frozen.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* View PIN */}
          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Card PIN</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-muted-foreground tracking-widest">
                    {showPin ? cardPin : "••••"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPin(!showPin)}
                className="p-3 hover:bg-muted rounded-full transition-colors"
              >
                {showPin ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowLimits(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Settings className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Spending Limits</p>
                <p className="text-sm text-muted-foreground">Set daily and transaction limits</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="h-px bg-border mx-4" />

            <button
              onClick={() => setShowOrderCard(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Order New Card</p>
                <p className="text-sm text-muted-foreground">Get a replacement or additional card</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Card Details */}
          <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Card Details</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Card Number</p>
                <p className="font-medium text-foreground">•••• 4582</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Expiry Date</p>
                <p className="font-medium text-foreground">12/2028</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Card Type</p>
                <p className="font-medium text-foreground">Visa Debit</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Status</p>
                <p className={`font-medium ${isCardFrozen ? "text-destructive" : "text-success"}`}>
                  {isCardFrozen ? "Frozen" : "Active"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardManagement;
