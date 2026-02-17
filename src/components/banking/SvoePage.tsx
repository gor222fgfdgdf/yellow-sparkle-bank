import { useState } from "react";
import { Bookmark, Eye, Heart, ArrowUpRight, Briefcase, Sparkles, Mountain, ChevronRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SvoeArticleModal from "./SvoeArticleModal";
import SvoeServiceDetailModal from "./SvoeServiceDetailModal";
import SvoeQuizModal from "./SvoeQuizModal";
import SvoeBookmarksModal from "./SvoeBookmarksModal";
import { toast } from "@/hooks/use-toast";

import svoeTravel from "@/assets/svoe-travel.jpg";
import svoeWinter from "@/assets/svoe-winter.jpg";
import svoeWine from "@/assets/svoe-wine.jpg";
import svoeHeritage from "@/assets/svoe-heritage.jpg";
import svoeTrain from "@/assets/svoe-train.jpg";
import svoeFarm from "@/assets/svoe-farm.jpg";

type SvoeTab = "services" | "journal";

interface Article {
  title: string;
  views: number;
  likes: number;
  content?: string;
  image?: string;
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
  { title: "Фермерские продукты", subtitle: "Доставка напрямую от фермеров", color: "bg-lime-400", textColor: "text-foreground", image: svoeFarm },
  { title: "Дача и сад", subtitle: "", color: "bg-orange-500", textColor: "text-white", image: "" },
  { title: "Работа и учёба", subtitle: "", color: "bg-foreground", textColor: "text-card", image: "" },
  { title: "Ипотека", subtitle: "Лучшие условия", color: "bg-blue-100 dark:bg-blue-900", textColor: "text-foreground", image: "" },
];

const categoryImages: Record<string, string> = {
  "Путешествия": svoeTravel,
  "Просто о вине": svoeWine,
  "Наследие": svoeHeritage,
};

const articlesByCategory: Record<string, Article[]> = {
  "Путешествия": [
    { title: "Экотропы Краснодарского края: 10 самых красивых маршрутов", views: 532, likes: 45, image: svoeTravel, content: "Краснодарский край — настоящий рай для любителей пеших прогулок. Мы отобрали 10 самых живописных экотроп, которые подарят незабываемые впечатления.\n\n**1. Тропа здоровья** — лёгкий маршрут вдоль побережья Чёрного моря протяжённостью 5 км.\n\n**2. Каньон Псахо** — живописное ущелье с водопадами и реликтовым лесом.\n\n**3. Агурские водопады** — три каскада водопадов высотой до 23 метров.\n\n**4. Орлиные скалы** — панорамный маршрут с видом на горы и море.\n\n**5. Тисо-самшитовая роща** — уникальный реликтовый лес, сохранившийся с доледниковой эпохи.\n\nНе забудьте взять с собой удобную обувь, запас воды и хорошее настроение!" },
    { title: "Провоз фруктов в ручной клади: правила, нормы, штрафы", views: 430, likes: 89, content: "Многие путешественники хотят привезти домой экзотические фрукты, но не знают правил провоза.\n\n**Что можно перевозить:**\n• Большинство свежих фруктов в небольших количествах\n• Сухофрукты и орехи\n• Консервированные фрукты\n\n**Ограничения:**\n• Не более 5 кг на человека для внутренних рейсов\n• Некоторые тропические фрукты запрещены при международных перелётах\n\n**Штрафы:** от 1,000 до 5,000 ₽ за нарушение правил провоза.\n\nОсобое внимание уделим документам, которые могут понадобиться при прохождении контроля." },
    { title: "Однодневные поездки из Шанхая: Сучжоу, Ханчжоу, Чжоучжуан", views: 1130, likes: 83, content: "Шанхай — отличная база для исследования окрестностей. За один день вы можете побывать в древних городах на воде.\n\n**Сучжоу** (30 мин на скоростном поезде)\nСлавится своими классическими садами — объектами ЮНЕСКО. Билет от 39.5 юаней.\n\n**Ханчжоу** (45 мин на скоростном поезде)\nОзеро Сиху — жемчужина города. Прогулка на лодке стоит 45 юаней.\n\n**Чжоучжуан** (1.5 часа на автобусе)\nСамый красивый водный город. Входной билет 100 юаней.\n\nМы составили подробные маршруты с расписанием поездов и ценами." },
  ],
  "Просто о вине": [
    { title: "Винные маршруты Крыма: от Массандры до Нового Света", views: 412, likes: 67, image: svoeWine, content: "Крымское виноделие имеет многовековую историю.\n\n**Массандра**\nЛегендарный завод с коллекцией из миллиона бутылок. Дегустация от 500 ₽.\n\n**Инкерман**\nПодземные погреба в штольнях, где вино созревает при идеальной температуре.\n\n**Новый Свет**\nЗнаменитое шампанское по классической технологии. Экскурсия с дегустацией — 1,200 ₽.\n\n**Золотая Балка**\nСовременная винодельня с панорамным рестораном и виноградниками.\n\nКаждая остановка подарит новые вкусовые открытия." },
    { title: "Как правильно дегустировать вино: гид для начинающих", views: 890, likes: 112, image: svoeWine, content: "Дегустация вина — целое искусство.\n\n**Этап 1: Визуальный анализ**\nНаклоните бокал на 45° и оцените цвет и прозрачность.\n\n**Этап 2: Аромат**\nПокрутите бокал и вдохните. Первый нос — фруктовые ноты, второй — более сложные ароматы.\n\n**Этап 3: Вкус**\nСделайте небольшой глоток и подержите вино во рту 3-5 секунд.\n\n**Этап 4: Послевкусие**\nОцените, как долго сохраняется вкус после глотка. Долгое послевкусие — признак качественного вина.\n\n**Температура подачи:**\n• Белое сухое: 8-12°C\n• Красное: 16-18°C\n• Игристое: 6-8°C" },
    { title: "Российские винодельни, которые стоит посетить в 2026", views: 645, likes: 91, image: svoeWine, content: "Российское виноделие переживает настоящий ренессанс.\n\n**1. Лефкадия** (Краснодарский край)\nПремиальные вина и гастрономический ресторан.\n\n**2. Фанагория** (Тамань)\nОдна из крупнейших виноделен с историей более 60 лет.\n\n**3. Усадьба Дивноморское**\nБутиковая винодельня с авторскими винами.\n\n**4. Галицкий и Галицкий** (Геленджик)\nМолодая винодельня с современным подходом.\n\nВсе винодельни предлагают экскурсии и дегустации." },
  ],
  "Наследие": [
    { title: "Деревянное зодчество Русского Севера: что посмотреть", views: 345, likes: 56, image: svoeHeritage, content: "Русский Север хранит уникальные памятники деревянного зодчества.\n\n**Кижи** (Карелия)\n22-главая Преображенская церковь — шедевр без единого гвоздя. ЮНЕСКО.\n\n**Малые Корелы** (Архангельская обл.)\nМузей под открытым небом с более чем 100 постройками.\n\n**Вологда**\nДеревянные дома с ажурной резьбой — «вологодское кружево» в архитектуре.\n\n**Каргополь**\nДревний город с белокаменными храмами и деревянными домами.\n\nКаждый объект — окно в прошлое русской культуры." },
    { title: "Усадьбы Подмосковья: путешествие в прошлое", views: 567, likes: 78, image: svoeHeritage, content: "Подмосковные усадьбы — это окно в историю русской культуры.\n\n**Архангельское**\n«Подмосковный Версаль» — дворец Юсуповых с великолепным парком.\n\n**Кусково**\nЛетняя резиденция Шереметевых. Уникальный ансамбль XVIII века.\n\n**Остафьево**\n«Русский Парнас» — здесь бывали Пушкин, Карамзин, Грибоедов.\n\n**Абрамцево**\nМамонтовский художественный кружок — Репин, Васнецов, Серов творили здесь.\n\nВсе усадьбы открыты для посещения круглый год." },
    { title: "Древние крепости России: от Изборска до Дербента", views: 423, likes: 65, image: svoeHeritage, content: "Россия богата древними укреплениями.\n\n**Изборская крепость** (XIV век)\nОдна из наиболее сохранившихся крепостей Северо-Запада.\n\n**Псковский Кром**\nМощные стены защищали город веками. Включён в список ЮНЕСКО.\n\n**Нижегородский Кремль**\n13 башен и 2 км стен на высоком берегу Волги.\n\n**Дербентская крепость Нарын-Кала**\nСтарейшая крепость России, ей более 5000 лет." },
  ],
};

const travelRoutes = [
  { title: "Псков — Изборск — Печоры: выходные на краю русской земли", image: svoeHeritage },
  { title: "Золотое кольцо за 5 дней: оптимальный маршрут", image: svoeTravel },
  { title: "Байкал зимой: лёд, нерпы и горячие источники", image: svoeWinter },
];

const regionArticles: Article[] = [
  { title: "Секреты вологодского кружева: как древнее ремесло стало символом региона", views: 629, likes: 39, image: svoeHeritage, content: "Вологодское кружево — один из самых узнаваемых символов русского народного искусства.\n\nИстория промысла начинается в XVI веке. Мы побывали в мастерских и узнали, как создаются эти удивительные произведения.\n\n**Техника «сколок»** — основа вологодского кружевоплетения. Мастерица работает с десятками коклюшек одновременно.\n\nВ Музее кружева в Вологде можно увидеть лучшие образцы и даже попробовать себя в этом искусстве." },
  { title: "Тропами Кирилло-Белозерского и Ферапонтова монастыря", views: 627, likes: 41, image: svoeHeritage, content: "Два великих монастыря Вологодской земли.\n\n**Кирилло-Белозерский монастырь**\nКрупнейший монастырь Европы. Стены протяжённостью 2 км. Основан в 1397 году.\n\n**Ферапонтов монастырь**\nЗдесь сохранились фрески Дионисия (1502 год) — единственный полностью сохранившийся ансамбль. ЮНЕСКО.\n\nМаршрут между монастырями — 20 км живописной дороги через деревни." },
  { title: "Что попробовать зимой в Вологде: масло, творог, топлёное молоко, выпечка", views: 846, likes: 48, image: svoeFarm, content: "Вологодская кухня — праздник вкуса.\n\n**Вологодское масло**\nПроизводится по особой технологии из топлёных сливок. Характерный ореховый привкус.\n\n**Местный творог**\nЖирный, зернистый, невероятно нежный.\n\n**Топлёное молоко**\nТомится в печи до золотистого цвета.\n\n**Шаньга**\nТрадиционная выпечка с картофелем или творогом.\n\n**Где пробовать:** ресторан «Паровозовъ», кафе «Огород»." },
];

const quizzes = [
  { title: "Зимние чудеса России — сможете угадать все?", questions: 10 },
  { title: "Угадай регион по фотографии", questions: 8 },
];

// Gather all articles for bookmarks search
const getAllArticles = (): Article[] => {
  const all: Article[] = [];
  Object.values(articlesByCategory).forEach((arts) => all.push(...arts));
  all.push(...regionArticles);
  return all;
};

const SvoePage = () => {
  const [activeTab, setActiveTab] = useState<SvoeTab>("services");
  const [activeCategory, setActiveCategory] = useState("Путешествия");
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCard | null>(null);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [showMoreRegion, setShowMoreRegion] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<{ title: string; questions: number } | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

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

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({ title, text: `Читайте: ${title}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${title} — ${window.location.href}`);
      toast({ title: "Ссылка скопирована" });
    }
  };

  const currentArticles = articlesByCategory[activeCategory] || [];
  const displayedRegion = showMoreRegion ? regionArticles : regionArticles.slice(0, 2);

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
          onClick={() => setIsBookmarksOpen(true)}
          className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center relative"
        >
          <Bookmark className="w-5 h-5 text-card" />
          {savedArticles.size > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
              {savedArticles.size}
            </span>
          )}
        </button>
      </div>

      {activeTab === "services" && (
        <div className="space-y-3 px-4 pt-2">
          <button
            onClick={() => openArticle({
              title: "Как понять, что программа лояльности банка действительно выгодна",
              views: 1240,
              likes: 156,
              image: svoeFarm,
              content: "Программы лояльности банков бывают очень разными — от простого кэшбэка до сложных балльных систем.\n\nМы разобрали ключевые критерии, по которым можно оценить реальную выгоду:\n\n**Процент начисления баллов**\nСравните: 1 балл за каждые 100 ₽ — это 1%, а 1 балл за 50 ₽ — уже 2%.\n\n**Условия списания**\nНекоторые программы позволяют оплачивать до 100% покупки баллами, другие — только 30%.\n\n**Срок действия баллов**\nИдеально — бессрочные баллы. Избегайте программ со сгоранием через 3 месяца.\n\n**Партнёрская сеть**\nЧем больше партнёров — тем больше возможностей потратить баллы.\n\nВывод: лучшая программа — та, которая совпадает с вашими привычками трат.",
            })}
            className="w-full rounded-2xl h-48 flex items-end p-5 text-left relative overflow-hidden"
          >
            <img src={svoeFarm} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="relative text-white text-sm font-medium">Как понять, что программа лояльности банка действительно выгодна</p>
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
                className={`${card.color} rounded-2xl p-4 h-36 flex flex-col justify-between text-left relative overflow-hidden`}
              >
                {card.image && (
                  <>
                    <img src={card.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                )}
                <div className="relative">
                  <h3 className={`font-bold ${card.image ? "text-white" : card.textColor}`}>{card.title}</h3>
                  {card.subtitle && <p className={`text-sm mt-1 ${card.image ? "text-white/80" : card.textColor} opacity-80`}>{card.subtitle}</p>}
                </div>
                <ChevronRight className={`w-4 h-4 ${card.image ? "text-white" : card.textColor} opacity-60 self-end relative`} />
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
                image: svoeTrain,
                content: "Путешествие поездом — один из самых комфортных и экологичных способов передвижения по России.\n\nМы собрали проверенные советы, которые помогут сэкономить до 50% на билетах:\n\n**1. Покупайте заранее**\nЗа 45-60 дней — самые низкие цены. Динамическое ценообразование РЖД поднимает цены ближе к дате.\n\n**2. Бонусная программа «РЖД Бонус»**\nНакапливайте баллы за каждую поездку. 1 балл = 3.34 ₽ на премиальный билет.\n\n**3. Акции и распродажи**\nРЖД регулярно проводит акции: «Счастливые билеты», «В Новый год — за полцены».\n\n**4. Плацкарт в несезон**\nС октября по апрель цены на 30-40% ниже.\n\n**5. Групповые билеты**\nОт 10 человек — скидка до 20%.\n\n**Лайфхак:** используйте приложение «Туту» для сравнения цен на разные даты.",
              })}
              className="w-full rounded-2xl h-64 flex items-end p-5 relative overflow-hidden text-left"
            >
              <img src={svoeTrain} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative">
                <h3 className="text-white font-bold text-lg">Как сэкономить на ж/д билетах</h3>
                <p className="text-white/70 text-sm mt-1">Рассказываем, как экономно путешествовать поездом</p>
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
              <h2 className="text-xl font-bold text-foreground">
                {activeCategory === "Путешествия" ? "Идеи для поездки" : activeCategory === "Просто о вине" ? "Мир вина" : "Культурное наследие"}
              </h2>
              <button
                onClick={() => handleShare(activeCategory)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {activeCategory === "Путешествия" ? "Подарите себе незабываемое приключение" : activeCategory === "Просто о вине" ? "Откройте мир виноделия" : "Сохраним историю вместе"}
            </p>

            <div className="space-y-3">
              {currentArticles.map((article) => (
                <div key={article.title} className="relative">
                  <button
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
                    <div className="w-32 h-28 shrink-0 rounded-r-2xl overflow-hidden">
                      {article.image ? (
                        <img src={article.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-accent" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => toggleBookmark(article.title)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Bookmark className={`w-4 h-4 ${savedArticles.has(article.title) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Travel routes */}
          <div className="bg-card mt-2 px-4 py-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">Маршруты путешествий</h2>
              <button
                onClick={() => handleShare("Маршруты путешествий")}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center"
              >
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Предлагаем идеи путешествий по России на любой вкус</p>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3" style={{ width: "max-content" }}>
                {travelRoutes.map((route) => (
                  <button
                    key={route.title}
                    onClick={() => openArticle({ title: route.title, views: Math.floor(Math.random() * 1000 + 200), likes: Math.floor(Math.random() * 100 + 20), image: route.image, content: `${route.title}\n\nЭтот маршрут идеально подходит для путешественников, которые хотят увидеть настоящую Россию.\n\n**Что включено:**\n• Подробное описание маршрута\n• Рекомендации по проживанию\n• Лучшие рестораны и кафе\n• Достопримечательности по пути\n\n**Рекомендуемая продолжительность:** 3-5 дней.\n\n**Лучшее время:** май-сентябрь для летних маршрутов, декабрь-февраль для зимних.` })}
                    className="w-72 shrink-0 text-left"
                  >
                    <div className="rounded-2xl h-52 mb-3 overflow-hidden">
                      <img src={route.image} alt="" className="w-full h-full object-cover" />
                    </div>
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
              <button
                onClick={() => handleShare("Вологодская область")}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center"
              >
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Вологодская область</p>
            <p className="text-muted-foreground text-xs mb-4">Открытия рядом с нами</p>

            <div className="space-y-3">
              {displayedRegion.map((article) => (
                <div key={article.title} className="relative">
                  <button
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
                    <div className="w-32 h-28 shrink-0 rounded-r-2xl overflow-hidden">
                      {article.image ? (
                        <img src={article.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-accent" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => toggleBookmark(article.title)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Bookmark className={`w-4 h-4 ${savedArticles.has(article.title) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                </div>
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
            <p className="text-muted-foreground text-sm mb-4">Проверьте свои знания о России</p>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3" style={{ width: "max-content" }}>
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.title}
                    onClick={() => { setSelectedQuiz(quiz); setIsQuizOpen(true); }}
                    className="w-72 shrink-0 text-left"
                  >
                    <div className="rounded-2xl h-52 mb-3 overflow-hidden relative">
                      <img
                        src={quiz.title.includes("Зимние") ? svoeWinter : svoeTravel}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {quiz.questions} вопросов
                        </span>
                      </div>
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
        isSaved={selectedArticle ? savedArticles.has(selectedArticle.title) : false}
        onToggleBookmark={(title) => toggleBookmark(title)}
      />
      <SvoeServiceDetailModal
        isOpen={isServiceOpen}
        onClose={() => setIsServiceOpen(false)}
        service={selectedService}
      />
      <SvoeQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        quiz={selectedQuiz}
      />
      <SvoeBookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        savedArticles={savedArticles}
        allArticles={getAllArticles()}
        onRemove={(title) => toggleBookmark(title)}
        onOpenArticle={(article) => openArticle(article)}
      />
    </div>
  );
};

export default SvoePage;
