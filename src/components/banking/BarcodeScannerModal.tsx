import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scan, Camera, FileText, Check, Clock, Zap, Droplets, Flame, Home } from "lucide-react";
import { toast } from "sonner";

interface ScannedBill {
  id: string;
  provider: string;
  category: string;
  accountNumber: string;
  amount: number;
  period: string;
  icon: any;
}

interface ScanHistory {
  id: string;
  provider: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (amount: number, provider: string) => void;
}

const scanHistory: ScanHistory[] = [
  { id: "1", provider: "Мосэнергосбыт", amount: 2340, date: "10 дек", status: "paid" },
  { id: "2", provider: "Мосводоканал", amount: 890, date: "5 дек", status: "paid" },
  { id: "3", provider: "Мосгаз", amount: 450, date: "1 дек", status: "paid" },
];

const BarcodeScannerModal = ({ isOpen, onClose, onPayment }: BarcodeScannerModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBill, setScannedBill] = useState<ScannedBill | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful scan
    const bill: ScannedBill = {
      id: "1",
      provider: "Мосэнергосбыт",
      category: "Электричество",
      accountNumber: "1234567890",
      amount: 2450,
      period: "Декабрь 2024",
      icon: Zap
    };
    
    setScannedBill(bill);
    setIsScanning(false);
    toast.success("Квитанция распознана!");
  };

  const handleManualEntry = () => {
    if (!manualCode || manualCode.length < 10) {
      toast.error("Введите корректный код");
      return;
    }

    // Simulate finding bill by code
    const bill: ScannedBill = {
      id: "2",
      provider: "Мосводоканал",
      category: "Водоснабжение",
      accountNumber: manualCode,
      amount: 1230,
      period: "Декабрь 2024",
      icon: Droplets
    };

    setScannedBill(bill);
    setManualEntry(false);
    toast.success("Квитанция найдена!");
  };

  const handlePayment = async () => {
    if (!scannedBill) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onPayment(scannedBill.amount, scannedBill.provider);
    toast.success(`Оплачено ${scannedBill.amount.toLocaleString("ru-RU")} ₽`);
    
    setIsProcessing(false);
    setScannedBill(null);
  };

  const getCategoryIcon = (provider: string) => {
    if (provider.includes("энерго") || provider.includes("Электр")) return Zap;
    if (provider.includes("водо") || provider.includes("Водо")) return Droplets;
    if (provider.includes("газ") || provider.includes("Газ")) return Flame;
    return Home;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">Оплата по штрихкоду</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="scan" className="h-[calc(90vh-100px)]">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="scan">Сканер</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {scannedBill ? (
              <div className="space-y-4">
                <button onClick={() => setScannedBill(null)} className="text-primary text-sm">
                  ← Сканировать другую квитанцию
                </button>

                <div className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <scannedBill.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{scannedBill.provider}</h3>
                      <p className="text-sm text-muted-foreground">{scannedBill.category}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Лицевой счёт</span>
                      <span className="font-medium text-foreground">{scannedBill.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Период</span>
                      <span className="font-medium text-foreground">{scannedBill.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">К оплате</span>
                      <span className="text-xl font-bold text-foreground">{scannedBill.amount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-success/10 rounded-xl p-3">
                  <Check className="w-5 h-5 text-success" />
                  <span className="text-sm text-foreground">Реквизиты проверены</span>
                </div>

                <Button onClick={handlePayment} className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Оплата..." : `Оплатить ${scannedBill.amount.toLocaleString("ru-RU")} ₽`}
                </Button>
              </div>
            ) : manualEntry ? (
              <div className="space-y-4">
                <button onClick={() => setManualEntry(false)} className="text-primary text-sm">
                  ← Назад к сканеру
                </button>

                <div className="space-y-4">
                  <div>
                    <Label>Номер лицевого счёта или ЕПД</Label>
                    <Input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Введите номер с квитанции"
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleManualEntry} className="w-full">
                    Найти квитанцию
                  </Button>
                </div>

                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    Введите номер лицевого счёта или единый платёжный документ (ЕПД) с бумажной квитанции
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scanner Area */}
                <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isScanning ? (
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-foreground font-medium">Сканирование...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Наведите камеру на штрихкод</p>
                      </div>
                    )}
                  </div>
                  {/* Scan Frame */}
                  <div className="absolute inset-8 border-2 border-dashed border-primary/50 rounded-xl" />
                  <div className="absolute top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-xl" />
                  <div className="absolute top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-xl" />
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-xl" />
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-xl" />
                </div>

                <div className="flex gap-3">
                  <Button onClick={simulateScan} className="flex-1" disabled={isScanning}>
                    <Scan className="w-4 h-4 mr-2" />
                    {isScanning ? "Сканирование..." : "Сканировать"}
                  </Button>
                  <Button variant="outline" onClick={() => setManualEntry(true)} className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Ввести вручную
                  </Button>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Поддерживаемые квитанции</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Электричество</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Водоснабжение</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Газ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">ЖКХ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 overflow-y-auto max-h-[calc(90vh-180px)]">
            {scanHistory.length > 0 ? (
              scanHistory.map(item => {
                const IconComponent = getCategoryIcon(item.provider);
                return (
                  <div key={item.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.provider}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{item.amount.toLocaleString("ru-RU")} ₽</p>
                      {item.status === "paid" ? (
                        <span className="text-xs text-success">Оплачено</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Ожидает</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Scan className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">История пуста</h3>
                <p className="text-muted-foreground">Отсканируйте первую квитанцию</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default BarcodeScannerModal;
