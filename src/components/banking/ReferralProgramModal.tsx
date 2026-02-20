import { useState } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gift, Copy, Share2, Check, UserPlus, Wallet, Clock } from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  name: string;
  date: string;
  status: "pending" | "active" | "bonus_paid";
  bonus: number;
}

interface BonusHistory {
  id: string;
  type: "referral" | "bonus";
  description: string;
  amount: number;
  date: string;
}

interface ReferralProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const referrals: Referral[] = [
  { id: "1", name: "Иван С.", date: "10 дек", status: "bonus_paid", bonus: 1500 },
  { id: "2", name: "Мария К.", date: "5 дек", status: "active", bonus: 1500 },
  { id: "3", name: "Алексей П.", date: "1 дек", status: "pending", bonus: 0 },
];

const bonusHistory: BonusHistory[] = [
  { id: "1", type: "referral", description: "Бонус за Ивана С.", amount: 1500, date: "12 дек" },
  { id: "2", type: "bonus", description: "Приветственный бонус", amount: 500, date: "1 дек" },
  { id: "3", type: "referral", description: "Бонус за Ольгу М.", amount: 1500, date: "20 ноя" },
];

const ReferralProgramModal = ({ isOpen, onClose }: ReferralProgramModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const referralCode = "ALEX2024";
  const referralLink = `https://tinkoff.ru/invite/${referralCode}`;
  const totalEarned = 4500;
  const pendingBonus = 1500;
  const invitedCount = referrals.length;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Скопировано!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Присоединяйся к Россельхозбанку!",
        text: "Открой карту Union Pay и получи бонус 1500₽",
        url: referralLink,
      });
    } else {
      copyToClipboard(referralLink);
    }
  };

  const getStatusBadge = (status: Referral["status"]) => {
    switch (status) {
      case "bonus_paid":
        return <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Бонус начислен</span>;
      case "active":
        return <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Активен</span>;
      case "pending":
        return <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Ожидание</span>;
    }
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Пригласи друзей">
      <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{invitedCount}</p>
              <p className="text-xs text-muted-foreground">Приглашено</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Wallet className="w-6 h-6 text-success mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{totalEarned.toLocaleString("ru-RU")}₽</p>
              <p className="text-xs text-muted-foreground">Получено</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{pendingBonus.toLocaleString("ru-RU")}₽</p>
              <p className="text-xs text-muted-foreground">Ожидается</p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-primary/10 rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Ваша реферальная ссылка</h3>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="bg-background"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={shareLink} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Как это работает</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Поделитесь ссылкой</p>
                  <p className="text-sm text-muted-foreground">Отправьте ссылку друзьям</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Друг открывает карту</p>
                  <p className="text-sm text-muted-foreground">По вашей ссылке оформляет Union Pay</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Получите бонус</p>
                  <p className="text-sm text-muted-foreground">1500₽ вам и 1000₽ другу после первой покупки</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="friends">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="friends">Друзья</TabsTrigger>
              <TabsTrigger value="history">История бонусов</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-3">
              {referrals.length > 0 ? (
                referrals.map(referral => (
                  <div key={referral.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">{referral.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(referral.status)}
                      {referral.status === "bonus_paid" && (
                        <p className="text-sm font-medium text-success mt-1">+{referral.bonus}₽</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Пока нет приглашённых</h3>
                  <p className="text-muted-foreground">Поделитесь ссылкой и получайте бонусы</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {bonusHistory.map(bonus => (
                <div key={bonus.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      bonus.type === "referral" ? "bg-success/10" : "bg-primary/10"
                    }`}>
                      <Gift className={`w-5 h-5 ${bonus.type === "referral" ? "text-success" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{bonus.description}</p>
                      <p className="text-sm text-muted-foreground">{bonus.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-success">+{bonus.amount.toLocaleString("ru-RU")}₽</span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
      </div>
    </FullScreenModal>
  );
};

export default ReferralProgramModal;
