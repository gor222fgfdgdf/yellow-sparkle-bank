import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ServiceDetail {
  title: string;
  subtitle: string;
  features?: string[];
  price?: string;
}

interface SvoeServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceDetail | null;
}

const servicesData: Record<string, ServiceDetail & { features: string[]; price: string }> = {
  "Подписка Всё Своё": {
    title: "Подписка Всё Своё",
    subtitle: "Единая подписка на лучшие сервисы",
    features: [
      "Фильмы и сериалы без рекламы",
      "Скидка 10% на туры по России",
      "Бесплатная доставка фермерских продуктов",
      "Кэшбэк 5% на все покупки в Своём",
      "Приоритетная поддержка 24/7",
    ],
    price: "399 ₽/мес",
  },
  "Путешествия": {
    title: "Путешествия",
    subtitle: "Откройте Россию вместе с нами",
    features: [
      "Компенсация до 100% стоимости баллами",
      "Скидки до 30% на туры",
      "Бесплатная отмена бронирования",
      "Страховка путешественника в подарок",
      "Персональный менеджер по путешествиям",
    ],
    price: "от 0 ₽",
  },
  "Фермерские продукты": {
    title: "Фермерские продукты",
    subtitle: "Доставка напрямую от фермеров",
    features: [
      "Свежие продукты от проверенных фермеров",
      "Доставка на следующий день",
      "Гарантия качества и возврат",
      "Подписка на еженедельные наборы",
    ],
    price: "Доставка от 0 ₽",
  },
  "Дача и сад": {
    title: "Дача и сад",
    subtitle: "Всё для загородной жизни",
    features: [
      "Саженцы и семена с доставкой",
      "Консультации агрономов",
      "Инструменты и техника",
      "Скидки для подписчиков Всё Своё",
    ],
    price: "",
  },
  "Работа и учёба": {
    title: "Работа и учёба",
    subtitle: "Развивайтесь вместе с нами",
    features: [
      "Курсы повышения квалификации",
      "Вакансии от партнёров",
      "Стипендии и гранты",
      "Менторская программа",
    ],
    price: "",
  },
  "Ипотека": {
    title: "Ипотека",
    subtitle: "Лучшие условия на рынке",
    features: [
      "Ставка от 5.9% годовых",
      "Одобрение за 1 день",
      "Без первоначального взноса",
      "Страховка в подарок",
    ],
    price: "от 5.9%",
  },
};

const SvoeServiceDetailModal = ({ isOpen, onClose, service }: SvoeServiceDetailModalProps) => {
  const [isActivating, setIsActivating] = useState(false);

  if (!service) return null;

  const data = servicesData[service.title] || { ...service, features: [], price: "" };

  const handleActivate = () => {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      toast({ title: "Заявка отправлена", description: `Сервис «${data.title}» будет подключён в ближайшее время` });
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto h-[80vh] p-0 overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground ml-2">{data.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-primary rounded-2xl h-40 flex items-end p-5">
            <div>
              <h3 className="text-primary-foreground font-bold text-lg">{data.title}</h3>
              <p className="text-primary-foreground/80 text-sm mt-1">{data.subtitle}</p>
            </div>
          </div>

          {data.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-foreground">Что входит</h3>
              {data.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-foreground/80 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          )}

          {data.price && (
            <div className="bg-muted rounded-2xl p-4">
              <p className="text-muted-foreground text-sm">Стоимость</p>
              <p className="text-foreground font-bold text-lg">{data.price}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={handleActivate} disabled={isActivating} className="w-full h-12 rounded-xl font-medium">
            {isActivating ? "Подключаем..." : "Подключить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SvoeServiceDetailModal;
