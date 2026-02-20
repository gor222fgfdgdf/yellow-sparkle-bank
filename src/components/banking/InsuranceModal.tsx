import { useState } from "react";
import FullScreenModal from "./FullScreenModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Car, Plane, Heart, Home, ChevronRight, Check, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";

interface InsuranceProduct { id: string; name: string; icon: any; description: string; priceFrom: number; coverage: string[]; popular?: boolean; }
interface ActivePolicy { id: string; type: string; name: string; expiresAt: string; coverage: number; premium: number; }
interface InsuranceModalProps { isOpen: boolean; onClose: () => void; }

const insuranceProducts: InsuranceProduct[] = [
  { id: "osago", name: "ОСАГО", icon: Car, description: "Обязательное страхование автомобиля", priceFrom: 4500, coverage: ["Ущерб третьим лицам", "Выплата до 400 000 ₽", "Действует по всей России"], popular: true },
  { id: "kasko", name: "КАСКО", icon: Car, description: "Полная защита вашего автомобиля", priceFrom: 25000, coverage: ["Угон и хищение", "Ущерб при ДТП", "Стихийные бедствия"] },
  { id: "travel", name: "Путешествия", icon: Plane, description: "Страховка для поездок за границу", priceFrom: 350, coverage: ["Медицинская помощь", "Отмена поездки", "Потеря багажа"], popular: true },
  { id: "health", name: "Здоровье", icon: Heart, description: "Добровольное медицинское страхование", priceFrom: 15000, coverage: ["Амбулаторное лечение", "Стоматология", "Госпитализация"] },
  { id: "property", name: "Недвижимость", icon: Home, description: "Защита квартиры и имущества", priceFrom: 3000, coverage: ["Пожар и затопление", "Кража", "Гражданская ответственность"] }
];

const activePolicies: ActivePolicy[] = [
  { id: "1", type: "osago", name: "ОСАГО", expiresAt: "15 мар 2025", coverage: 400000, premium: 5600 },
  { id: "2", type: "travel", name: "Страховка ВЗР", expiresAt: "28 дек 2024", coverage: 50000, premium: 1200 }
];

const InsuranceModal = ({ isOpen, onClose }: InsuranceModalProps) => {
  const [selectedProduct, setSelectedProduct] = useState<InsuranceProduct | null>(null);
  const [step, setStep] = useState<"list" | "details" | "form">("list");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Полис оформлен! Документы отправлены на email");
    setIsProcessing(false);
    setStep("list");
    setSelectedProduct(null);
  };

  const getProductIcon = (type: string) => {
    const product = insuranceProducts.find(p => p.id === type);
    return product?.icon || Shield;
  };

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Страхование">
      <Tabs defaultValue="catalog">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="catalog">Каталог</TabsTrigger>
          <TabsTrigger value="policies">Мои полисы</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          {step === "list" && insuranceProducts.map(product => (
            <button key={product.id} onClick={() => { setSelectedProduct(product); setStep("details"); }} className="w-full bg-card rounded-2xl p-4 border border-border text-left hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${product.popular ? "bg-primary/10" : "bg-muted"}`}>
                  <product.icon className={`w-6 h-6 ${product.popular ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-semibold text-foreground">{product.name}</h3>{product.popular && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Популярно</span>}</div>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <p className="text-sm"><span className="text-muted-foreground">от </span><span className="font-bold text-foreground">{product.priceFrom.toLocaleString("ru-RU")} ₽</span></p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          ))}
          {step === "details" && selectedProduct && (
            <div className="space-y-6">
              <button onClick={() => setStep("list")} className="text-primary text-sm">← Назад к каталогу</button>
              <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><selectedProduct.icon className="w-8 h-8 text-primary" /></div><div><h2 className="text-xl font-bold text-foreground">{selectedProduct.name}</h2><p className="text-muted-foreground">{selectedProduct.description}</p></div></div>
              <div className="bg-card rounded-2xl p-4 border border-border"><h3 className="font-semibold text-foreground mb-3">Что покрывает</h3><div className="space-y-2">{selectedProduct.coverage.map((item, i) => (<div key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-foreground">{item}</span></div>))}</div></div>
              <div className="bg-muted rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-muted-foreground">Стоимость от</span><span className="text-2xl font-bold text-foreground">{selectedProduct.priceFrom.toLocaleString("ru-RU")} ₽</span></div></div>
              <Button onClick={() => setStep("form")} className="w-full">Оформить полис</Button>
            </div>
          )}
          {step === "form" && selectedProduct && (
            <div className="space-y-6">
              <button onClick={() => setStep("details")} className="text-primary text-sm">← Назад</button>
              <h2 className="text-xl font-bold text-foreground">Оформление {selectedProduct.name}</h2>
              <div className="space-y-4">
                <div><Label>ФИО страхователя</Label><Input defaultValue="Петров Александр Сергеевич" className="mt-2" /></div>
                <div><Label>Дата рождения</Label><Input type="date" defaultValue="1990-05-15" className="mt-2" /></div>
                <div><Label>Серия и номер паспорта</Label><Input placeholder="0000 000000" className="mt-2" /></div>
                {selectedProduct.id === "osago" && <div><Label>Госномер автомобиля</Label><Input placeholder="А000АА000" className="mt-2" /></div>}
                {selectedProduct.id === "travel" && <div><Label>Страна назначения</Label><Input placeholder="Турция" className="mt-2" /></div>}
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border"><div className="flex items-center justify-between mb-2"><span className="text-muted-foreground">К оплате</span><span className="text-xl font-bold text-foreground">{selectedProduct.priceFrom.toLocaleString("ru-RU")} ₽</span></div><p className="text-xs text-muted-foreground">Полис действует 1 год с момента оплаты</p></div>
              <Button onClick={handlePurchase} className="w-full" disabled={isProcessing}>{isProcessing ? "Оформление..." : "Оплатить и оформить"}</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          {activePolicies.length > 0 ? activePolicies.map(policy => {
            const IconComponent = getProductIcon(policy.type);
            return (
              <div key={policy.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><IconComponent className="w-6 h-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground">{policy.name}</h3><div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><Calendar className="w-4 h-4" /><span>до {policy.expiresAt}</span></div></div></div>
                <div className="grid grid-cols-2 gap-4 mt-4"><div><p className="text-sm text-muted-foreground">Покрытие</p><p className="font-semibold text-foreground">{(policy.coverage / 1000).toFixed(0)}K ₽</p></div><div><p className="text-sm text-muted-foreground">Премия</p><p className="font-semibold text-foreground">{policy.premium.toLocaleString("ru-RU")} ₽</p></div></div>
                <div className="flex gap-2 mt-4"><Button variant="outline" className="flex-1"><FileText className="w-4 h-4 mr-2" />Полис</Button><Button className="flex-1">Продлить</Button></div>
              </div>
            );
          }) : (
            <div className="text-center py-12"><Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="font-semibold text-foreground mb-2">Нет активных полисов</h3><p className="text-muted-foreground">Оформите страховку для защиты себя и имущества</p></div>
          )}
        </TabsContent>
      </Tabs>
    </FullScreenModal>
  );
};

export default InsuranceModal;
