import { useState } from "react";
import { Bookmark, Eye, Heart, ArrowUpRight, Briefcase, Sparkles, Mountain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type SvoeTab = "services" | "journal";

const SvoePage = () => {
  const [activeTab, setActiveTab] = useState<SvoeTab>("services");
  const [activeCategory, setActiveCategory] = useState("Путешествия");

  const categories = [
    { label: "Путешествия", icon: Briefcase },
    { label: "Просто о вине", icon: Sparkles },
    { label: "Наследие", icon: Mountain },
  ];

  const serviceCards = [
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

  const articles = [
    { title: "Экотропы Краснодарского края: 10 самых красивых маршрутов", views: 532, likes: 45 },
    { title: "Провоз фруктов в ручной клади: правила, нормы, штрафы", views: 430, likes: 89 },
    { title: "Однодневные поездки из Шанхая: Сучжоу, Ханчжоу, Чжоучжуан", views: 1130, likes: 83 },
  ];

  const travelRoutes = [
    { title: "Псков — Изборск — Печоры: выходные на краю русской земли" },
  ];

  const regionArticles = [
    { title: "Секреты вологодского кружева: как древнее ремесло стало символом региона", views: 629, likes: 39 },
    { title: "Тропами Кирилло-Белозерского и Ферапонтова монастыря", views: 627, likes: 41 },
    { title: "Что попробовать зимой в Вологде: масло, творог, топлёное молоко, выпечка", views: 846, likes: 48 },
  ];

  const quizzes = [
    { title: "Зимние чудеса России — сможете угадать все?" },
  ];

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
            <span className="absolute -top-1 -right-3 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">1</span>
          </button>
        </div>
        <button className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-card" />
        </button>
      </div>

      {activeTab === "services" && (
        <div className="space-y-3 px-4 pt-2">
          {/* Promo slider placeholder */}
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-2xl h-48 flex items-end p-5">
            <p className="text-foreground text-sm">Как понять, что программа лояльности банка действительно выгодна</p>
          </div>

          {/* Service cards */}
          {serviceCards.map((card) => (
            <button key={card.title} className={`w-full ${card.color} rounded-2xl p-5 text-left min-h-[120px] relative overflow-hidden`}>
              <h3 className={`text-lg font-bold ${card.textColor}`}>{card.title}</h3>
              <p className={`text-sm mt-1 ${card.textColor} opacity-90`}>{card.subtitle}</p>
              {card.badge && (
                <span className={`inline-block mt-3 text-sm font-medium ${card.textColor} bg-card/20 px-3 py-1 rounded-full`}>
                  {card.badge}
                </span>
              )}
            </button>
          ))}

          {/* Grid cards */}
          <div className="grid grid-cols-2 gap-3">
            {serviceGrid.map((card) => (
              <button key={card.title} className={`${card.color} rounded-2xl p-4 h-36 flex flex-col justify-between text-left`}>
                <div>
                  <h3 className={`font-bold ${card.textColor}`}>{card.title}</h3>
                  {card.subtitle && <p className={`text-sm mt-1 ${card.textColor} opacity-80`}>{card.subtitle}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="space-y-0">
          {/* Hero article slider */}
          <div className="px-4 pt-2">
            <div className="bg-foreground rounded-2xl h-64 flex items-end p-5 relative overflow-hidden">
              <div>
                <h3 className="text-card font-bold text-lg">Как сэкономить на ж/д билетах</h3>
                <p className="text-card/70 text-sm mt-1">Рассказываем, как экономно путешествовать поездом</p>
              </div>
            </div>
          </div>

          {/* Category chips */}
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

          {/* Идеи для поездки */}
          <div className="bg-card mt-2 px-4 py-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">Идеи для поездки</h2>
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Подарите себе незабываемое приключение</p>

            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.title} className="bg-muted rounded-2xl overflow-hidden flex">
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <p className="font-medium text-foreground text-sm leading-tight">{article.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes}</span>
                    </div>
                  </div>
                  <div className="w-32 h-28 bg-accent shrink-0 rounded-r-2xl" />
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium h-12">
              Смотреть ещё
            </Button>
          </div>

          {/* Маршруты путешествий */}
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
                  <div key={route.title} className="w-72 shrink-0">
                    <div className="bg-accent rounded-2xl h-52 mb-3" />
                    <p className="font-medium text-foreground text-sm">{route.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Регион месяца */}
          <div className="bg-card mt-2 px-4 py-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-foreground">Регион месяца</h2>
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Открытия рядом с нами</p>

            <div className="space-y-3">
              {regionArticles.map((article) => (
                <div key={article.title} className="bg-muted rounded-2xl overflow-hidden flex">
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <p className="font-medium text-foreground text-sm leading-tight">{article.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes}</span>
                    </div>
                  </div>
                  <div className="w-32 h-28 bg-accent shrink-0 rounded-r-2xl" />
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-medium h-12">
              Смотреть ещё
            </Button>
          </div>

          {/* Викторины */}
          <div className="bg-card mt-2 px-4 py-5">
            <h2 className="text-xl font-bold text-foreground mb-1">Викторины</h2>
            <p className="text-muted-foreground text-sm mb-4">Проверьте свои знания</p>

            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3" style={{ width: "max-content" }}>
                {quizzes.map((quiz) => (
                  <div key={quiz.title} className="w-72 shrink-0">
                    <div className="bg-accent rounded-2xl h-52 mb-3" />
                    <p className="font-medium text-foreground text-sm">{quiz.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SvoePage;
