import { Smartphone, Zap, Droplets, Wifi, Car, Home, CreditCard, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentsPage = () => {
  const { toast } = useToast();

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
    { name: "Verizon Wireless", amount: 85.00, date: "Dec 10" },
    { name: "Electric Company", amount: 124.50, date: "Dec 8" },
    { name: "Water Utility", amount: 45.00, date: "Dec 5" },
  ];

  const handlePayment = (label: string) => {
    toast({
      title: "Payment",
      description: `${label} payment feature coming soon!`,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground px-1">Pay Bills</h2>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handlePayment(cat.label)}
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
            <div key={idx} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">{payment.name}</p>
                <p className="text-sm text-muted-foreground">{payment.date}</p>
              </div>
              <span className="font-semibold text-foreground">${payment.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
