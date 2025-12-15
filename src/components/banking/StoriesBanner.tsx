import { useState, useEffect, useCallback } from "react";
import { Percent, Crown, Gift, Zap, Plane, X, Check, Diamond, CreditCard, Users, Globe, Shield, GraduationCap, Calendar, Heart, Wallet, TrendingUp, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Story {
  id: number;
  icon: any;
  title: string;
  subtitle: string;
  gradient: string;
  actionType: "cashback" | "premium" | "referral" | "sbp" | "loyalty" | "virtual_cards" | "deposits" | "investment" | "insurance" | "education" | "calendar" | "charity" | "government";
  content: {
    heading: string;
    description: string;
    cta: string;
    details: string[];
  };
}

const stories: Story[] = [
  { 
    id: 1, 
    icon: Percent, 
    title: "Кэшбэк 5%", 
    subtitle: "На продукты", 
    gradient: "from-primary to-amber-400",
    actionType: "cashback",
    content: {
      heading: "5% кэшбэк на продукты!",
      description: "Получайте 5% возврата со всех покупок в супермаркетах в этом месяце.",
      cta: "Управлять кэшбэком",
      details: ["Действует до 31 декабря", "Все супермаркеты", "Максимум 3 000 ₽ в месяц"],
    }
  },
  { 
    id: 2, 
    icon: CreditCard, 
    title: "Виртуальная", 
    subtitle: "Карта", 
    gradient: "from-violet-500 to-purple-400",
    actionType: "virtual_cards",
    content: {
      heading: "Виртуальные карты",
      description: "Создавайте виртуальные карты для безопасных онлайн-покупок.",
      cta: "Создать карту",
      details: ["Мгновенный выпуск", "Отдельный лимит", "Одноразовые карты"],
    }
  },
  { 
    id: 3, 
    icon: Gift, 
    title: "Пригласи", 
    subtitle: "Получи 1000 ₽", 
    gradient: "from-emerald-500 to-teal-400",
    actionType: "referral",
    content: {
      heading: "Приведи друга — получи 1000 ₽",
      description: "Поделитесь кодом приглашения и получите бонус за каждого друга.",
      cta: "Пригласить друзей",
      details: ["Без ограничений по количеству", "Друг тоже получит 500 ₽", "Начисление в течение 24 часов"],
    }
  },
  { 
    id: 4, 
    icon: Zap, 
    title: "СБП", 
    subtitle: "Мгновенно", 
    gradient: "from-primary to-orange-400",
    actionType: "sbp",
    content: {
      heading: "Переводы через СБП",
      description: "Мгновенные бесплатные переводы по номеру телефона в любой банк.",
      cta: "Перевести",
      details: ["Моментальное зачисление", "Бесплатно до 100 000 ₽/мес", "В любой банк России"],
    }
  },
  { 
    id: 5, 
    icon: Wallet, 
    title: "Вклады", 
    subtitle: "До 18%", 
    gradient: "from-sky-500 to-blue-400",
    actionType: "deposits",
    content: {
      heading: "Выгодные вклады",
      description: "Откройте вклад с высокой процентной ставкой и приумножьте сбережения.",
      cta: "Открыть вклад",
      details: ["Ставка до 18% годовых", "Гибкие сроки", "Капитализация процентов"],
    }
  },
  { 
    id: 6, 
    icon: TrendingUp, 
    title: "Инвестиции", 
    subtitle: "Начать", 
    gradient: "from-indigo-500 to-blue-400",
    actionType: "investment",
    content: {
      heading: "Инвестиционный портфель",
      description: "Инвестируйте в акции, облигации и фонды прямо из приложения.",
      cta: "Начать инвестировать",
      details: ["Акции и облигации", "Автоматический портфель", "Аналитика в реальном времени"],
    }
  },
  { 
    id: 7, 
    icon: Shield, 
    title: "Страхование", 
    subtitle: "Защита", 
    gradient: "from-emerald-500 to-green-400",
    actionType: "insurance",
    content: {
      heading: "Страховые продукты",
      description: "Защитите себя и близких с помощью страховых программ.",
      cta: "Оформить страховку",
      details: ["Страхование жизни", "ОСАГО и КАСКО", "Страхование имущества"],
    }
  },
  { 
    id: 8, 
    icon: Diamond, 
    title: "Лояльность", 
    subtitle: "Бонусы", 
    gradient: "from-amber-500 to-yellow-400",
    actionType: "loyalty",
    content: {
      heading: "Программа лояльности",
      description: "Накапливайте бонусы и получайте скидки у партнёров банка.",
      cta: "Мои бонусы",
      details: ["Скидки до 30%", "1000+ партнёров", "Обмен на рубли"],
    }
  },
  { 
    id: 9, 
    icon: Building2, 
    title: "Госуслуги", 
    subtitle: "Штрафы", 
    gradient: "from-blue-600 to-blue-400",
    actionType: "government",
    content: {
      heading: "Госуслуги и штрафы",
      description: "Оплачивайте штрафы ГИБДД, налоги и услуги ЖКХ без комиссии.",
      cta: "Оплатить",
      details: ["Штрафы со скидкой 50%", "Налоги и пошлины", "Услуги ЖКХ"],
    }
  },
  { 
    id: 10, 
    icon: Heart, 
    title: "Помощь", 
    subtitle: "Благотворительность", 
    gradient: "from-pink-500 to-rose-400",
    actionType: "charity",
    content: {
      heading: "Благотворительность",
      description: "Помогайте нуждающимся через проверенные благотворительные фонды.",
      cta: "Помочь",
      details: ["Проверенные фонды", "Отчёты о помощи", "Регулярные пожертвования"],
    }
  },
  { 
    id: 11, 
    icon: Calendar, 
    title: "Календарь", 
    subtitle: "Платежи", 
    gradient: "from-orange-500 to-amber-400",
    actionType: "calendar",
    content: {
      heading: "Финансовый календарь",
      description: "Планируйте свои финансы и не пропускайте важные платежи.",
      cta: "Открыть календарь",
      details: ["Напоминания о платежах", "График зарплаты", "Планирование расходов"],
    }
  },
  { 
    id: 12, 
    icon: GraduationCap, 
    title: "Обучение", 
    subtitle: "Финграмотность", 
    gradient: "from-teal-500 to-cyan-400",
    actionType: "education",
    content: {
      heading: "Финансовое образование",
      description: "Повысьте свою финансовую грамотность с нашими курсами.",
      cta: "Начать обучение",
      details: ["Бесплатные курсы", "Практические советы", "Сертификаты"],
    }
  },
];

interface StoriesBannerProps {
  onOpenCashback?: () => void;
  onOpenReferral?: () => void;
  onOpenSBP?: () => void;
  onOpenLoyalty?: () => void;
  onOpenVirtualCards?: () => void;
  onOpenDeposits?: () => void;
  onOpenInvestment?: () => void;
  onOpenInsurance?: () => void;
  onOpenEducation?: () => void;
  onOpenCalendar?: () => void;
  onOpenCharity?: () => void;
  onOpenGovernment?: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoriesBanner = ({
  onOpenCashback,
  onOpenReferral,
  onOpenSBP,
  onOpenLoyalty,
  onOpenVirtualCards,
  onOpenDeposits,
  onOpenInvestment,
  onOpenInsurance,
  onOpenEducation,
  onOpenCalendar,
  onOpenCharity,
  onOpenGovernment,
}: StoriesBannerProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = currentStoryIndex !== null ? stories[currentStoryIndex] : null;

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex !== null && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      setCurrentStoryIndex(null);
      setProgress(0);
    }
  }, [currentStoryIndex]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex !== null && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentStoryIndex === 0) {
      setProgress(0);
    }
  }, [currentStoryIndex]);

  // Auto-progress timer
  useEffect(() => {
    if (currentStoryIndex === null || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextStory();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStoryIndex, isPaused, goToNextStory]);

  const handleStoryClick = (index: number) => {
    setCurrentStoryIndex(index);
    setProgress(0);
  };

  const handleCTA = (story: Story) => {
    setCurrentStoryIndex(null);
    setProgress(0);
    
    setTimeout(() => {
      switch (story.actionType) {
        case "cashback":
          onOpenCashback?.();
          break;
        case "referral":
          onOpenReferral?.();
          break;
        case "sbp":
          onOpenSBP?.();
          break;
        case "loyalty":
          onOpenLoyalty?.();
          break;
        case "virtual_cards":
          onOpenVirtualCards?.();
          break;
        case "deposits":
          onOpenDeposits?.();
          break;
        case "investment":
          onOpenInvestment?.();
          break;
        case "insurance":
          onOpenInsurance?.();
          break;
        case "education":
          onOpenEducation?.();
          break;
        case "calendar":
          onOpenCalendar?.();
          break;
        case "charity":
          onOpenCharity?.();
          break;
        case "government":
          onOpenGovernment?.();
          break;
      }
    }, 100);
  };

  const handleClose = () => {
    setCurrentStoryIndex(null);
    setProgress(0);
  };

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      goToPrevStory();
    } else if (x > (width * 2) / 3) {
      goToNextStory();
    }
  };

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 pb-2">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(index)}
              className="flex-shrink-0 w-20 group"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${story.gradient} p-[3px] group-hover:scale-105 transition-transform`}>
                <div className="w-full h-full rounded-[13px] bg-card flex items-center justify-center">
                  <story.icon className="w-8 h-8 text-foreground" />
                </div>
              </div>
              <p className="text-xs font-medium text-foreground mt-2 text-center truncate">{story.title}</p>
              <p className="text-[10px] text-muted-foreground text-center truncate">{story.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Story Modal with Instagram-style progress */}
      {currentStory && currentStoryIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2 pt-3">
            {stories.map((_, index) => (
              <div
                key={index}
                className="h-[3px] flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
                  style={{
                    width: index < currentStoryIndex 
                      ? "100%" 
                      : index === currentStoryIndex 
                        ? `${progress}%` 
                        : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-12 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Story counter */}
          <div className="absolute top-12 left-4 z-20 text-white/70 text-sm font-medium">
            {currentStoryIndex + 1} / {stories.length}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goToPrevStory}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors opacity-60 hover:opacity-100"
            disabled={currentStoryIndex === 0}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNextStory}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors opacity-60 hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Story content */}
          <div 
            className="h-full flex flex-col items-center justify-center p-6"
            onClick={handleAreaClick}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div 
              className={`w-full max-w-sm bg-gradient-to-br ${currentStory.gradient} rounded-3xl overflow-hidden animate-scale-in`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                  <currentStory.icon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentStory.content.heading}</h2>
                <p className="text-white/80">{currentStory.content.description}</p>
              </div>

              {/* Details */}
              <div className="bg-card rounded-t-3xl p-6 space-y-4">
                <div className="space-y-3">
                  {currentStory.content.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-sm text-foreground">{detail}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full h-12 text-lg font-semibold"
                  onClick={() => handleCTA(currentStory)}
                >
                  {currentStory.content.cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBanner;
