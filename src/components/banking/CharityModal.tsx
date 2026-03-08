import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, ChevronRight, Check, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FullScreenModal from "./FullScreenModal";

interface CharityOrg {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  verified: boolean;
  totalRaised: number;
  donorsCount: number;
}

interface Donation {
  id: string;
  orgName: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
}

interface CharityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate?: (amount: number, orgName: string) => void;
}

const charityOrgs: CharityOrg[] = [
  { id: "1", name: "Подари жизнь", description: "Помощь детям с онкологическими заболеваниями", category: "Дети", logo: "🎗️", verified: true, totalRaised: 2500000000, donorsCount: 150000 },
  { id: "2", name: "Ночлежка", description: "Помощь бездомным людям", category: "Социальная помощь", logo: "🏠", verified: true, totalRaised: 450000000, donorsCount: 45000 },
  { id: "3", name: "WWF Россия", description: "Охрана природы и животных", category: "Экология", logo: "🐼", verified: true, totalRaised: 1200000000, donorsCount: 80000 },
  { id: "4", name: "Старость в радость", description: "Помощь пожилым людям", category: "Пожилые", logo: "👵", verified: true, totalRaised: 320000000, donorsCount: 35000 },
  { id: "5", name: "Дом с маяком", description: "Хоспис для детей", category: "Дети", logo: "🏥", verified: true, totalRaised: 890000000, donorsCount: 60000 },
];

const quickAmounts = [100, 500, 1000, 5000];

const CharityModal = ({ isOpen, onClose, onDonate }: CharityModalProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "detail" | "history">("list");
  const [selectedOrg, setSelectedOrg] = useState<CharityOrg | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [donations, setDonations] = useState<Donation[]>([
    { id: "1", orgName: "Подари жизнь", amount: 1000, date: new Date(Date.now() - 30 * 86400000), isRecurring: true },
    { id: "2", orgName: "WWF Россия", amount: 500, date: new Date(Date.now() - 60 * 86400000), isRecurring: false },
  ]);

  const categories = Array.from(new Set(charityOrgs.map(o => o.category)));

  const filteredOrgs = charityOrgs.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || org.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} млрд ₽`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)} млн ₽`;
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);
  };

  const handleDonate = () => {
    if (!selectedOrg || !donationAmount) return;
    const amount = Number(donationAmount);
    if (amount < 10) {
      toast({ title: "Ошибка", description: "Минимальная сумма пожертвования 10 ₽", variant: "destructive" });
      return;
    }
    setDonations([{ id: Date.now().toString(), orgName: selectedOrg.name, amount, date: new Date(), isRecurring }, ...donations]);
    onDonate?.(amount, selectedOrg.name);
    toast({ title: "Спасибо за помощь! ❤️", description: `${formatCurrency(amount)} отправлено в "${selectedOrg.name}"${isRecurring ? " (ежемесячно)" : ""}` });
    setView("list");
    setSelectedOrg(null);
    setDonationAmount("");
    setIsRecurring(false);
  };

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const recurringDonations = donations.filter(d => d.isRecurring);

  const handleClose = () => {
    setView("list");
    setSelectedOrg(null);
    onClose();
  };

  if (selectedOrg && view === "detail") {
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => { setView("list"); setSelectedOrg(null); }} title="Пожертвование">
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">{selectedOrg.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{selectedOrg.name}</p>
                  {selectedOrg.verified && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{selectedOrg.category}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{selectedOrg.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
              <div><p className="text-xs text-muted-foreground">Собрано</p><p className="font-semibold text-foreground">{formatCurrency(selectedOrg.totalRaised)}</p></div>
              <div><p className="text-xs text-muted-foreground">Доноров</p><p className="font-semibold text-foreground">{selectedOrg.donorsCount.toLocaleString("ru-RU")}</p></div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Сумма пожертвования</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(amount => (
                <Button key={amount} variant={donationAmount === String(amount) ? "default" : "outline"} size="sm" onClick={() => setDonationAmount(String(amount))}>{amount} ₽</Button>
              ))}
            </div>
            <Input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Другая сумма" />
          </div>
          <button onClick={() => setIsRecurring(!isRecurring)} className={`w-full p-4 rounded-xl border-2 transition-colors ${isRecurring ? "border-primary bg-primary/5" : "border-border"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isRecurring ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {isRecurring && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Ежемесячное пожертвование</p>
                <p className="text-sm text-muted-foreground">Автоматически каждый месяц</p>
              </div>
            </div>
          </button>
          <Button className="w-full" onClick={handleDonate} disabled={!donationAmount}>
            <Heart className="w-4 h-4 mr-2" />Пожертвовать {donationAmount && formatCurrency(Number(donationAmount))}
          </Button>
        </div>
      </FullScreenModal>
    );
  }

  if (view === "history") {
    return (
      <FullScreenModal isOpen={isOpen} onClose={() => setView("list")} title="История пожертвований">
        <div className="space-y-4">
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Всего пожертвовано</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDonated)}</p>
            {recurringDonations.length > 0 && <p className="text-sm text-muted-foreground mt-1">{recurringDonations.length} активных подписок</p>}
          </div>
          <div className="space-y-2">
            {donations.map(donation => (
              <div key={donation.id} className="p-4 bg-card rounded-xl border border-border">
                <div className="flex justify-between items-start">
                  <div><p className="font-medium text-foreground">{donation.orgName}</p><p className="text-sm text-muted-foreground">{donation.date.toLocaleDateString("ru-RU")}</p></div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(donation.amount)}</p>
                    {donation.isRecurring && <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Ежемесячно</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullScreenModal>
    );
  }

  return (
    <FullScreenModal isOpen={isOpen} onClose={handleClose} title="Благотворительность">
      <div className="space-y-4">
        {totalDonated > 0 && (
          <button onClick={() => setView("history")} className="w-full bg-primary/10 rounded-xl p-4 text-left hover:bg-primary/15 transition-colors">
            <div className="flex justify-between items-center">
              <div><p className="text-sm text-muted-foreground">Вы помогли на</p><p className="text-xl font-bold text-foreground">{formatCurrency(totalDonated)}</p></div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск фонда..." className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>Все</Button>
          {categories.map(cat => (<Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="whitespace-nowrap">{cat}</Button>))}
        </div>
        <div className="space-y-3">
          {filteredOrgs.map(org => (
            <button key={org.id} onClick={() => { setSelectedOrg(org); setView("detail"); }} className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">{org.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-semibold text-foreground truncate">{org.name}</p>{org.verified && <Check className="w-4 h-4 text-primary flex-shrink-0" />}</div>
                  <p className="text-sm text-muted-foreground truncate">{org.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </FullScreenModal>
  );
};

export default CharityModal;
