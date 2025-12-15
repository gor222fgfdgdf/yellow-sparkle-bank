import { useState } from "react";
import { Percent, Crown, Gift, Zap, Plane, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: number;
  icon: any;
  title: string;
  subtitle: string;
  gradient: string;
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
    content: {
      heading: "5% кэшбэк на продукты!",
      description: "Получайте 5% возврата со всех покупок в супермаркетах в этом месяце.",
      cta: "Активировать",
      details: ["Действует до 31 декабря", "Все супермаркеты", "Максимум 3 000 ₽ в месяц"],
    }
  },
  { 
    id: 2, 
    icon: Crown, 
    title: "Premium", 
    subtitle: "Подключить", 
    gradient: "from-foreground to-neutral-600",
    content: {
      heading: "РСХБ Premium",
      description: "Получите эксклюзивные привилегии с премиальным обслуживанием.",
      cta: "Подключить за 990 ₽/мес",
      details: ["Повышенный кэшбэк до 10%", "Приоритетная поддержка", "Бесплатные переводы"],
    }
  },
  { 
    id: 3, 
    icon: Gift, 
    title: "Пригласи", 
    subtitle: "Получи 1000 ₽", 
    gradient: "from-emerald-500 to-teal-400",
    content: {
      heading: "Приведи друга — получи 1000 ₽",
      description: "Поделитесь кодом приглашения и получите бонус за каждого друга.",
      cta: "Поделиться",
      details: ["Без ограничений по количеству", "Друг тоже получит 500 ₽", "Начисление в течение 24 часов"],
    }
  },
  { 
    id: 4, 
    icon: Zap, 
    title: "СБП", 
    subtitle: "Мгновенно", 
    gradient: "from-primary to-orange-400",
    content: {
      heading: "Переводы через СБП",
      description: "Мгновенные бесплатные переводы по номеру телефона в любой банк.",
      cta: "Перевести",
      details: ["Моментальное зачисление", "Бесплатно до 100 000 ₽/мес", "В любой банк России"],
    }
  },
  { 
    id: 5, 
    icon: Plane, 
    title: "Путешествия", 
    subtitle: "Мили x2", 
    gradient: "from-sky-500 to-blue-400",
    content: {
      heading: "Двойные мили за путешествия",
      description: "Получайте х2 мили за все покупки связанные с путешествиями.",
      cta: "Подробнее",
      details: ["Отели, авиабилеты, ж/д", "Мили не сгорают", "Обмен на любые авиакомпании"],
    }
  },
];

const StoriesBanner = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { toast } = useToast();

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleCTA = (story: Story) => {
    toast({ 
      title: "Готово!", 
      description: `${story.content.cta} — ${story.title}` 
    });
    setSelectedStory(null);
  };

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 pb-2">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
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

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-br ${selectedStory.gradient} p-6 text-center`}>
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-card/20 hover:bg-card/30 transition-colors"
              >
                <X className="w-5 h-5 text-card" />
              </button>
              <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center mx-auto mb-4">
                <selectedStory.icon className="w-8 h-8 text-card" />
              </div>
              <h2 className="text-xl font-bold text-card">{selectedStory.content.heading}</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground text-center">{selectedStory.content.description}</p>
              
              <div className="space-y-2">
                {selectedStory.content.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">{detail}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full h-12 text-lg font-semibold"
                onClick={() => handleCTA(selectedStory)}
              >
                {selectedStory.content.cta}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBanner;
