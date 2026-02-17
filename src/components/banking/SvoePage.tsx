import { useState } from "react";
import { Bookmark, Eye, Heart, ArrowUpRight, Briefcase, Sparkles, Mountain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SvoeArticleModal from "./SvoeArticleModal";
import SvoeServiceDetailModal from "./SvoeServiceDetailModal";
import { toast } from "@/hooks/use-toast";

type SvoeTab = "services" | "journal";

interface Article {
  title: string;
  views: number;
  likes: number;
  content?: string;
}

interface ServiceCard {
  title: string;
  subtitle: string;
  badge?: string;
  color: string;
  textColor: string;
}

const categories = [
  { label: "Путешествия", icon: Briefcase },
  { label: "Просто о вине", icon: Sparkles },
  { label: "Наследие", icon: Mountain },
];

const serviceCards: ServiceCard[] = [
  {
    title: "Подписка Всё Своё",
    subtitle: "Фильмы и сериалы, 10% скидка на туры, доставка продуктов 0₽",
    color: "bg-primary",
    textColor: "text-primary-foreground",
  },
  {
    title: "Путешествия",
    subtitle: "Компенсация до 100% стоимости баллами программы лояльности",
    badge: "Скидки до 30%",
    color: "bg-purple-500",
    textColor: "text-white",
  },
];

const serviceGrid = [
  { title: "Фермерские продукты", subtitle: "Доставка напрямую от фермеров", color: "bg-lime-400", textColor: "text-foreground" },
  { title: "Дача и сад", subtitle: "", color: "bg-orange-500", textColor: "text-white" },
  { title: "Работа и учёба", subtitle: "", color: "bg-foreground", textColor: "text-card" },
  { title: "Ипотека", subtitle: "Лучшие условия", color: "bg-blue-100 dark:bg-blue-900", textColor: "text-foreground" },
];

const articlesByCategory: Record<string, Article[]> = {
  "Путешествия": [
    { title: "Экотропы Краснодарского края: 10 самых красивых маршрутов", views: 532, likes: 45, content: "Краснодарский край — настоящий рай для любителей пеших прогулок. Мы отобрали 10 самых живописных экотроп, которые подарят незабываемые впечатления.\n\nОт побережья Чёрного моря до горных перевалов — каждый маршрут уникален и доступен для путешественников с разным уровнем подготовки.\n\nНе забудьте взять с собой удобную обувь, запас воды и хорошее настроение!" },
    { title: "Провоз фруктов в ручной клади: правила, нормы, штрафы", views: 430, likes: 89, content: "Многие путешественники хотят привезти домой экзотические фрукты, но не знают правил провоза.\n\nВ этой статье мы подробно разберём, какие фрукты можно перевозить, в каком количестве и какие документы могут понадобиться.\n\nОсобое внимание уделим штрафам за нарушение правил провоза." },
    { title: "Однодневные поездки из Шанхая: Сучжоу, Ханчжоу, Чжоучжуан", views: 1130, likes: 83, content: "Шанхай — отличная база для исследования окрестностей. За один день вы можете побывать в древних городах на воде.\n\nСучжоу славится своими садами, Ханчжоу — озером Сиху, а Чжоучжуан — каналами и мостами.\n\nМы составили подробные маршруты с расписанием поездов и ценами." },
  ],
  "Просто о вине": [
    { title: "Винные маршруты Крыма: от Массандры до Нового Света", views: 412, likes: 67, content: "Крымское виноделие имеет многовековую историю. Мы предлагаем маршрут по лучшим винодельням полуострова.\n\nОт легендарной Массандры до уникальных пещерных погребов Нового Света — каждая остановка подарит новые вкусовые открытия." },
    { title: "Как правильно дегустировать вино: гид для начинающих", views: 890, likes: 112, content: "Дегустация вина — это не просто процесс питья, а целое искусство. Мы расскажем о правилах, которые помогут раскрыть все оттенки вкуса.\n\nОт визуального анализа до послевкусия — каждый этап важен для полного понимания напитка." },
  ],
  "Наследие": [
    { title: "Деревянное зодчество Русского Севера: что посмотреть", views: 345, likes: 56, content: "Русский Север хранит уникальные памятники деревянного зодчества. Кижи, Малые Корелы, старинные церкви Вологодчины.\n\nМы собрали маршрут по самым интересным объектам, которые обязательно стоит увидеть." },
    { title: "Усадьбы Подмосковья: путешествие в прошлое", views: 567, likes: 78, content: "Подмосковные усадьбы — это окно в историю русской культуры. Архангельское, Кусково, Остафьево — каждая усадьба рассказывает свою историю.\n\nМы подготовили гид по лучшим усадьбам, открытым для посещения." },
  ],
};

const travelRoutes = [
  { title: "Псков — Изборск — Печоры: выходные на краю русской земли" },
  { title: "Золотое кольцо за 5 дней: оптимальный маршрут" },
  { title: "Байкал зимой: лёд, нерпы и горячие источники" },
];

const regionArticles: Article[] = [
  { title: "Секреты вологодского кружева: как древнее ремесло стало символом региона", views: 629, likes: 39, content: "Вологодское кружево — один из самых узнаваемых символов русского народного искусства.\n\nМы побывали в мастерских и узнали, как создаются эти удивительные произведения." },
  { title: "Тропами Кирилло-Белозерского и Ферапонтова монастыря", views: 627, likes: 41, content: "Два великих монастыря Вологодской земли хранят бесценные фрески Дионисия и уникальную атмосферу средневековой Руси.\n\nМы составили подробный маршрут посещения с практическими советами." },
  { title: "Что попробовать зимой в Вологде: масло, творог, топлёное молоко, выпечка", views: 846, likes: 48, content: "Вологодская кухня — это настоящий праздник вкуса. Знаменитое вологодское масло, ароматная выпечка и молочные продукты.\n\nМы собрали гастрономический путеводитель по лучшим местам." },
];

const quizzes = [
  { title: "Зимние чудеса России — сможете угадать все?", questions: 10 },
  { title: "Угадай регион по фотографии", questions: 8 },
];

const SvoePage = () => {
  const [activeTab, setActiveTab] = useState<SvoeTab>("services");
  const [activeCategory, setActiveCategory] = useState("Путешествия");
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCard | null>(null);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [showMoreArticles, setShowMoreArticles] = useState(false);
  const [showMoreRegion, setShowMoreRegion] = useState(false);

  const toggleBookmark = (title: string) => {
    setSavedArticles(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
        toast({ title: "Удалено из закладок" });
      } else {
        next.add(title);
        toast({ title: "Добавлено в закладки" });
      }
      return next;
    });
  };

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsArticleOpen(true);
  };

  const openService = (card: ServiceCard) => {
    setSelectedService(card);
    setIsServiceOpen(true);
  };

  const openGridService = (card: { title: string; subtitle: string }) => {
    setSelectedService({ ...card, color: "", textColor: "" });
    setIsServiceOpen(true);
  };

  const currentArticles = articlesByCategory[activeCategory] || [];
  const displayedRegion = showMoreRegion ? regionArticles : regionArticles.slice(0, 2);

  const handleQuizStart = (quiz: { title: string; questions: number }) => {
    toast({ title: "Викторина", description: `«${quiz.title}» — ${quiz.questions} вопросов. Скоро будет доступно!` });
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("services")}
            className={`text-2xl font-bold transition-colors ${activeTab === "services" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Сервисы
          </button>
          <button
            onClick={() => setActiveTab("journal")}
            className={`text-2xl font-bold transition-colors relative ${activeTab === "journal" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Журнал
            {savedArticles.size > 0 && (
              <span className="absolute -top-1 -right-3 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                {savedArticles.size}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => {
            if (savedArticles.size > 0) {
              toast({ title: "Закладки", description: `Сохранено статей: ${savedArticles.size}` });
            } else {
              toast({ title: "Закладки", description: "Пока ничего не сохранено" });
            }
          }}
          className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center"
        >
          <Bookmark className="w-5 h-5 text-card" />
        </button>
      </div>

      {activeTab === "services" && (
        <div className="space-y-3 px-4 pt-2">
          <button
            onClick={() => openArticle({
              title: "Как понять, что программа лояльности банка действительно выгодна",
              views: 1240,
              likes: 156,
              content: "Программы лояльности банков бывают очень разными — от простого кэшбэка до сложных балльных систем.\n\nМы разобрали ключевые критерии, по которым можно оценить реальную выгоду:\n\n• Процент начисления баллов\n• Условия списания\n• Срок действия баллов\n• Партнёрская сеть\n\nВывод: лучшая программа — та, которая совпадает с вашими привычками трат.",
            })}
            className="w-full bg-amber-100 dark:bg-amber-900/30 rounded-2xl h-48 flex items-end p-5 text-left"
          >
            <p className="text-foreground text-sm">Как понять, что программа лояльности банка действительно выгодна</p>
          </button>

          {serviceCards.map((card) => (
            <button
              key={card.title}
              onClick={() => openService(card)}
              className={`w-full ${card.color} rounded-2xl p-5 text-left min-h-[120px] relative overflow-hidden`}
            >
              <h3 className={`text-lg font-bold ${card.textColor}`}>{card.title}</h3>
              <p className={`text-sm mt-1 ${card.textColor} opacity-90`}>{card.subtitle}</p>
              {card.badge && (
                <span className={`inline-block mt-3 text-sm font-medium ${card.textColor} bg-card/20 px-3 py-1 rounded-full`}>
                  {card.badge}
                </span>
              )}
              <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${card.textColor} opacity-60`} />
            </button>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {serviceGrid.map((card) => (
              <button
                key={card.title}
                onClick={() => openGridService(card)}
                className={`${card.color} rounded-2xl p-4 h-36 flex flex-col justify-between text-left`}
              >
                <div>
                  <h3 className={`font-bold ${card.textColor}`}>{card.title}</h3>
                  {card.subtitle && <p className={`text-sm mt-1 ${card.textColor} opacity-80`}>{card.subtitle}</p>}
                </div>
                <ChevronRight className={`w-4 h-4 ${card.textColor} opacity-60 self-end`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="space-y-0">
          <div className="px-4 pt-2">
            <button
              onClick={() => openArticle({
                title: "Как сэкономить на ж/д билетах",
                views: 2450,
                likes: 312,
                content: "Путешествие поездом — один из самых комфортных и экологичных способов передвижения по России.\n\nМы собрали проверенные советы, которые помогут сэкономить до 50% на билетах:\n\n1. Покупайте билеты заранее — за 45-60 дней самые низкие цены\n2. Используйте бонусные программы РЖД\n3. Следите за акциями и распродажами\n4. Рассмотрите плацкарт в несезон\n5. Оформляйте групповые билеты\n\nТакже расскажем о скрытых функциях приложения РЖД, которые знают немногие.",
              })}
              className="w-full bg-foreground rounded-2xl h-64 flex items-end p-5 relative overflow-hidden text-left"
            >
              <div>
                <h3 className="text-card font-bold text-lg">Как сэкономить на ж/д билетах</h3>
                <p className="text-card/70 text-sm mt-1">Рассказываем, как экономно путешествовать поездом</p>
              </div>
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide px-4 pt-4 pb-2">
            <div className="flex gap-2" style={{ width: "max-content" }}>
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat.label
                      ? "bg-foreground text-card"
                      : "bg-card text-muted-foreground"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles for active category */}
          <div className="bg-card mt-2 px-4 py-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">Идеи для поездки</h2>
              <button
                onClick={() => setShowMoreArticles(!showMoreArticles)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center"
              >
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Подарите себе незабываемое приключение</p>

            <div className="space-y-3">
              {currentArticles.map((article) => (
                <button
                  key={article.title}
                  onClick={() => openArticle(article)}
                  className="w-full bg-muted rounded-2xl overflow-hidden flex text-left"
                >
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <p className="font-medium text-foreground text-sm leading-tight">{article.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes}</span>
                    </div>
                  </div>
                  <div className="w-32 h-28 bg-accent shrink-0 rounded-r-2xl" />
                </button>
              ))}
            </div>
          </div>

          {/* Travel routes */}
          <div className="bg-card mt-2 px-4 py-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">Маршруты путешествий</h2>
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Предлагаем идеи путешествий по России на любой вкус</p>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3" style={{ width: "max-content" }}>
                {travelRoutes.map((route) => (
                  <button
                    key={route.title}
                    onClick={() => openArticle({ title: route.title, views: Math.floor(Math.random() * 1000 + 200), likes: Math.floor(Math.random() * 100 + 20), content: `${route.title}\n\nЭтот маршрут идеально подходит для путешественников, которые хотят увидеть настоящую Россию. Мы подготовили подробное описание с рекомендациями по проживанию, питанию и достопримечательностям.\n\nРекомендуемая продолжительность: 3-5 дней.` })}
                    className="w-72 shrink-0 text-left"
                  >
                    <div className="bg-accent rounded-2xl h-52 mb-3" />
                    <p className="font-medium text-foreground text-sm">{route.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Region of the month */}
          <div className="bg-card mt-2 px-4 py-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">Регион месяца</h2>
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Открытия рядом с нами</p>

            <div className="space-y-3">
              {displayedRegion.map((article) => (
                <button
                  key={article.title}
                  onClick={() => openArticle(article)}
                  className="w-full bg-muted rounded-2xl overflow-hidden flex text-left"
                >
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <p className="font-medium text-foreground text-sm leading-tight">{article.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes}</span>
                    </div>
                  </div>
                  <div className="w-32 h-28 bg-accent shrink-0 rounded-r-2xl" />
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowMoreRegion(!showMoreRegion)}
              className="w-full mt-4 rounded-xl font-medium h-12"
              variant="secondary"
            >
              {showMoreRegion ? "Свернуть" : "Смотреть ещё"}
            </Button>
          </div>

          {/* Quizzes */}
          <div className="bg-card mt-2 px-4 py-5">
            <h2 className="text-xl font-bold text-foreground mb-1">Викторины</h2>
            <p className="text-muted-foreground text-sm mb-4">Проверьте свои знания</p>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3" style={{ width: "max-content" }}>
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.title}
                    onClick={() => handleQuizStart(quiz)}
                    className="w-72 shrink-0 text-left"
                  >
                    <div className="bg-accent rounded-2xl h-52 mb-3 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">{quiz.questions} вопросов</span>
                    </div>
                    <p className="font-medium text-foreground text-sm">{quiz.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <SvoeArticleModal
        isOpen={isArticleOpen}
        onClose={() => setIsArticleOpen(false)}
        article={selectedArticle}
      />
      <SvoeServiceDetailModal
        isOpen={isServiceOpen}
        onClose={() => setIsServiceOpen(false)}
        service={selectedService}
      />
    </div>
  );
};

export default SvoePage;
