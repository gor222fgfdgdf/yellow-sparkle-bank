import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, CreditCard, Eye, Lock, ShoppingBag, Gamepad2, Coffee, Settings, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  relation: "spouse" | "child" | "parent";
  phone: string;
  hasCard: boolean;
  cardLimit?: number;
  monthlySpent?: number;
  restrictions: {
    gambling: boolean;
    alcohol: boolean;
    online: boolean;
  };
}

interface FamilyTransaction {
  id: string;
  memberId: string;
  memberName: string;
  category: string;
  merchant: string;
  amount: number;
  date: string;
}

interface FamilyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Мария Петрова",
    relation: "spouse",
    phone: "+7 (999) 123-45-67",
    hasCard: true,
    cardLimit: 50000,
    monthlySpent: 32450,
    restrictions: { gambling: true, alcohol: false, online: false }
  },
  {
    id: "2",
    name: "Артём Петров",
    relation: "child",
    phone: "+7 (999) 765-43-21",
    hasCard: true,
    cardLimit: 10000,
    monthlySpent: 7800,
    restrictions: { gambling: true, alcohol: true, online: true }
  }
];

const familyTransactions: FamilyTransaction[] = [
  { id: "1", memberId: "1", memberName: "Мария", category: "Покупки", merchant: "Zara", amount: 8500, date: "Сегодня" },
  { id: "2", memberId: "2", memberName: "Артём", category: "Игры", merchant: "Steam", amount: 1200, date: "Сегодня" },
  { id: "3", memberId: "1", memberName: "Мария", category: "Продукты", merchant: "Азбука Вкуса", amount: 4500, date: "Вчера" },
  { id: "4", memberId: "2", memberName: "Артём", category: "Кафе", merchant: "Starbucks", amount: 450, date: "Вчера" },
];

const relationLabels = {
  spouse: "Супруг(а)",
  child: "Ребёнок",
  parent: "Родитель"
};

const FamilyAccessModal = ({ isOpen, onClose }: FamilyAccessModalProps) => {
  const [members, setMembers] = useState<FamilyMember[]>(familyMembers);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState<"spouse" | "child" | "parent">("child");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberPhone) {
      toast.error("Заполните все поля");
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName,
      relation: newMemberRelation,
      phone: newMemberPhone,
      hasCard: false,
      restrictions: { gambling: true, alcohol: newMemberRelation === "child", online: false }
    };

    setMembers([...members, newMember]);
    toast.success(`${newMemberName} добавлен в семью`);
    setIsProcessing(false);
    setIsAddingMember(false);
    setNewMemberName("");
    setNewMemberPhone("");
  };

  const handleOrderCard = async (member: FamilyMember) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMembers(members.map(m => 
      m.id === member.id ? { ...m, hasCard: true, cardLimit: 10000, monthlySpent: 0 } : m
    ));
    toast.success(`Карта для ${member.name} заказана!`);
    setIsProcessing(false);
  };

  const handleUpdateLimit = (memberId: string, limit: number) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, cardLimit: limit } : m
    ));
  };

  const handleUpdateRestriction = (memberId: string, key: keyof FamilyMember["restrictions"], value: boolean) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, restrictions: { ...m.restrictions, [key]: value } } : m
    ));
    toast.success("Ограничения обновлены");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Покупки": return ShoppingBag;
      case "Игры": return Gamepad2;
      case "Кафе": return Coffee;
      default: return CreditCard;
    }
  };

  const totalFamilySpent = members.reduce((sum, m) => sum + (m.monthlySpent || 0), 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
            Семейный доступ
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(90vh-100px)] overflow-y-auto space-y-4">
          {/* Family Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{members.length}</p>
              <p className="text-sm text-muted-foreground">Участников</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <CreditCard className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{totalFamilySpent.toLocaleString("ru-RU")} ₽</p>
              <p className="text-sm text-muted-foreground">За месяц</p>
            </div>
          </div>

          {isAddingMember ? (
            <div className="space-y-4">
              <button onClick={() => setIsAddingMember(false)} className="text-primary text-sm">
                ← Назад
              </button>

              <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
                <h3 className="font-semibold text-foreground">Добавить члена семьи</h3>

                <div>
                  <Label>Имя</Label>
                  <Input
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Иван Петров"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Телефон</Label>
                  <Input
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Кто это</Label>
                  <div className="flex gap-2 mt-2">
                    {(["spouse", "child", "parent"] as const).map(rel => (
                      <Button
                        key={rel}
                        variant={newMemberRelation === rel ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewMemberRelation(rel)}
                        className="flex-1"
                      >
                        {relationLabels[rel]}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddMember} className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Добавление..." : "Добавить"}
                </Button>
              </div>
            </div>
          ) : selectedMember ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedMember(null)} className="text-primary text-sm">
                ← Назад к семье
              </button>

              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {selectedMember.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedMember.name}</h3>
                    <p className="text-muted-foreground">{relationLabels[selectedMember.relation]}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Телефон</span>
                    <span className="text-foreground">{selectedMember.phone}</span>
                  </div>
                  {selectedMember.hasCard && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Лимит</span>
                        <span className="text-foreground">{selectedMember.cardLimit?.toLocaleString("ru-RU")} ₽</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Потрачено</span>
                        <span className="text-foreground">{selectedMember.monthlySpent?.toLocaleString("ru-RU")} ₽</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedMember.hasCard ? (
                <>
                  {/* Limit Settings */}
                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Лимит на месяц</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Текущий лимит</span>
                        <span className="font-bold text-foreground">{selectedMember.cardLimit?.toLocaleString("ru-RU")} ₽</span>
                      </div>
                      <Slider
                        value={[selectedMember.cardLimit || 0]}
                        onValueChange={([v]) => handleUpdateLimit(selectedMember.id, v)}
                        min={1000}
                        max={100000}
                        step={1000}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 000 ₽</span>
                        <span>100 000 ₽</span>
                      </div>
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="bg-card rounded-2xl p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Ограничения</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Азартные игры</p>
                            <p className="text-sm text-muted-foreground">Блокировка казино и ставок</p>
                          </div>
                        </div>
                        <Switch
                          checked={selectedMember.restrictions.gambling}
                          onCheckedChange={(v) => handleUpdateRestriction(selectedMember.id, "gambling", v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Алкоголь и табак</p>
                            <p className="text-sm text-muted-foreground">Блокировка покупок 18+</p>
                          </div>
                        </div>
                        <Switch
                          checked={selectedMember.restrictions.alcohol}
                          onCheckedChange={(v) => handleUpdateRestriction(selectedMember.id, "alcohol", v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Онлайн-покупки</p>
                            <p className="text-sm text-muted-foreground">Только офлайн операции</p>
                          </div>
                        </div>
                        <Switch
                          checked={selectedMember.restrictions.online}
                          onCheckedChange={(v) => handleUpdateRestriction(selectedMember.id, "online", v)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-card rounded-2xl p-6 border border-border text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Карта не выпущена</h3>
                  <p className="text-muted-foreground mb-4">Закажите карту для {selectedMember.name}</p>
                  <Button onClick={() => handleOrderCard(selectedMember)} disabled={isProcessing}>
                    {isProcessing ? "Заказ..." : "Заказать карту"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="members">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="members">Семья</TabsTrigger>
                <TabsTrigger value="expenses">Расходы</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-3">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{relationLabels[member.relation]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.hasCard && (
                        <div className="text-right mr-2">
                          <p className="text-sm font-medium text-foreground">
                            {member.monthlySpent?.toLocaleString("ru-RU")} ₽
                          </p>
                          <p className="text-xs text-muted-foreground">
                            из {member.cardLimit?.toLocaleString("ru-RU")}
                          </p>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}

                <Button onClick={() => setIsAddingMember(true)} variant="outline" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Добавить члена семьи
                </Button>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-3">
                {familyTransactions.map(tx => {
                  const IconComponent = getCategoryIcon(tx.category);
                  return (
                    <div key={tx.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{tx.merchant}</p>
                          <p className="text-sm text-muted-foreground">{tx.memberName} • {tx.date}</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{tx.amount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyAccessModal;
