import { useState } from "react";
import { X, Smartphone, Zap, Droplets, Wifi, Car, Home, CreditCard, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { icon: any; label: string; color: string } | null;
  onPayment: (amount: number, provider: string) => void;
}

const PaymentModal = ({ isOpen, onClose, category, onPayment }: PaymentModalProps) => {
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const providers: Record<string, string[]> = {
    "Mobile": ["Verizon", "AT&T", "T-Mobile", "Sprint"],
    "Electricity": ["ConEdison", "Pacific Gas", "Duke Energy", "National Grid"],
    "Water": ["City Water", "American Water", "Aqua America"],
    "Internet": ["Comcast", "Spectrum", "Verizon Fios", "AT&T Internet"],
    "Transport": ["MTA", "Uber Pass", "Lyft Pink", "Transit Card"],
    "Rent": ["Property Manager", "Landlord Direct", "RentPay"],
    "Loans": ["Bank of America", "Chase", "Wells Fargo", "Discover"],
  };

  const handlePay = () => {
    if (!provider) {
      toast({ title: "Error", description: "Please select a provider", variant: "destructive" });
      return;
    }
    if (!accountNumber) {
      toast({ title: "Error", description: "Please enter account number", variant: "destructive" });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    onPayment(parseFloat(amount), provider);
    toast({ title: "Payment Successful!", description: `$${parseFloat(amount).toFixed(2)} paid to ${provider}` });
    setProvider("");
    setAccountNumber("");
    setAmount("");
    onClose();
  };

  if (!isOpen || !category) return null;

  const IconComponent = category.icon;
  const categoryProviders = providers[category.label] || ["Provider 1", "Provider 2", "Provider 3"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{category.label} Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Select Provider</p>
          <div className="grid grid-cols-2 gap-2">
            {categoryProviders.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === p ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium text-foreground">{p}</span>
                {provider === p && <Check className="inline-block ml-2 w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Account Number</p>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter account number"
            className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Amount */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-muted-foreground">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Button onClick={handlePay} className="w-full h-14 text-lg font-semibold">
          Pay Now
        </Button>
      </div>
    </div>
  );
};

interface PaymentsPageProps {
  onPayment: (amount: number, provider: string) => void;
}

const PaymentsPage = ({ onPayment }: PaymentsPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{ icon: any; label: string; color: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const categories = [
    { icon: Smartphone, label: "Mobile", color: "bg-blue-500/10 text-blue-600" },
    { icon: Zap, label: "Electricity", color: "bg-yellow-500/10 text-yellow-600" },
    { icon: Droplets, label: "Water", color: "bg-cyan-500/10 text-cyan-600" },
    { icon: Wifi, label: "Internet", color: "bg-purple-500/10 text-purple-600" },
    { icon: Car, label: "Transport", color: "bg-green-500/10 text-green-600" },
    { icon: Home, label: "Rent", color: "bg-orange-500/10 text-orange-600" },
    { icon: CreditCard, label: "Loans", color: "bg-red-500/10 text-red-600" },
    { icon: Plus, label: "More", color: "bg-muted text-muted-foreground" },
  ];

  const recentPayments = [
    { name: "Verizon Wireless", amount: 85.00, date: "Dec 10", category: "Mobile" },
    { name: "Electric Company", amount: 124.50, date: "Dec 8", category: "Electricity" },
    { name: "Water Utility", amount: 45.00, date: "Dec 5", category: "Water" },
  ];

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground px-1">Pay Bills</h2>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleCategoryClick(cat)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-foreground">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground px-1">Recent Payments</h3>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {recentPayments.map((payment, idx) => (
            <button
              key={idx}
              onClick={() => {
                const cat = categories.find(c => c.label === payment.category);
                if (cat) handleCategoryClick(cat);
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
            >
              <div>
                <p className="font-medium text-foreground">{payment.name}</p>
                <p className="text-sm text-muted-foreground">{payment.date}</p>
              </div>
              <span className="font-semibold text-foreground">${payment.amount.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        category={selectedCategory}
        onPayment={onPayment}
      />
    </div>
  );
};

export default PaymentsPage;
