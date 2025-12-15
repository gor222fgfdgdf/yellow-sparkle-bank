import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Play, CheckCircle, Clock, ChevronRight, Star, Trophy, Target, PiggyBank, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  isCompleted: boolean;
  content: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  icon: any;
  lessons: Lesson[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface FinancialEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const courses: Course[] = [
  {
    id: "1",
    title: "Основы бюджетирования",
    description: "Научитесь планировать доходы и расходы",
    icon: PiggyBank,
    category: "Бюджет",
    difficulty: "beginner",
    lessons: [
      {
        id: "1-1",
        title: "Что такое бюджет?",
        description: "Введение в личные финансы",
        duration: 5,
        isCompleted: true,
        content: [
          "Бюджет — это план ваших доходов и расходов на определённый период.",
          "Правильный бюджет помогает контролировать финансы и достигать целей.",
          "Основное правило: тратьте меньше, чем зарабатываете.",
          "Начните с записи всех доходов и расходов за месяц.",
        ],
      },
      {
        id: "1-2",
        title: "Правило 50/30/20",
        description: "Простая система распределения",
        duration: 7,
        isCompleted: true,
        content: [
          "50% дохода — на необходимые расходы (жильё, еда, транспорт)",
          "30% дохода — на желания (развлечения, хобби)",
          "20% дохода — на сбережения и погашение долгов",
          "Это правило легко адаптировать под ваши потребности.",
        ],
      },
      {
        id: "1-3",
        title: "Категории расходов",
        description: "Как группировать траты",
        duration: 8,
        isCompleted: false,
        content: [
          "Обязательные: аренда, коммунальные услуги, продукты",
          "Переменные: одежда, развлечения, рестораны",
          "Финансовые цели: накопления, инвестиции, погашение кредитов",
          "Отслеживайте каждую категорию отдельно для лучшего контроля.",
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Инвестиции для начинающих",
    description: "Первые шаги на фондовом рынке",
    icon: TrendingUp,
    category: "Инвестиции",
    difficulty: "beginner",
    lessons: [
      {
        id: "2-1",
        title: "Зачем инвестировать?",
        description: "Преимущества инвестирования",
        duration: 6,
        isCompleted: false,
        content: [
          "Инвестиции помогают сохранить деньги от инфляции.",
          "Сложный процент — ваш главный союзник.",
          "Даже небольшие суммы могут вырасти со временем.",
          "Чем раньше начнёте, тем лучше результат.",
        ],
      },
      {
        id: "2-2",
        title: "Виды инвестиций",
        description: "Акции, облигации, фонды",
        duration: 10,
        isCompleted: false,
        content: [
          "Акции — доли в компаниях, высокий риск и доходность",
          "Облигации — займы компаниям/государству, стабильный доход",
          "ETF — фонды, следующие за индексами, хорошая диверсификация",
          "Депозиты — низкий риск, гарантированный доход",
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Защита от мошенников",
    description: "Как сохранить деньги в безопасности",
    icon: Shield,
    category: "Безопасность",
    difficulty: "beginner",
    lessons: [
      {
        id: "3-1",
        title: "Виды финансового мошенничества",
        description: "Как распознать обман",
        duration: 8,
        isCompleted: false,
        content: [
          "Фишинг — поддельные сайты и письма для кражи данных",
          "Телефонное мошенничество — звонки от «службы безопасности»",
          "Социальная инженерия — манипуляции для получения информации",
          "Никогда не сообщайте коды из СМС и данные карты!",
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Постановка финансовых целей",
    description: "SMART-подход к накоплениям",
    icon: Target,
    category: "Планирование",
    difficulty: "intermediate",
    lessons: [
      {
        id: "4-1",
        title: "SMART-цели",
        description: "Правильная формулировка",
        duration: 7,
        isCompleted: false,
        content: [
          "S — Specific (конкретная): «накопить на отпуск», а не «накопить денег»",
          "M — Measurable (измеримая): точная сумма в рублях",
          "A — Achievable (достижимая): реалистичная цель",
          "R — Relevant (актуальная): важная для вас цель",
          "T — Time-bound (ограниченная во времени): с конкретным сроком",
        ],
      },
    ],
  },
];

const FinancialEducationModal = ({ isOpen, onClose }: FinancialEducationModalProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "course" | "lesson">("list");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [coursesState, setCoursesState] = useState(courses);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(courses.map(c => c.category)));

  const completedLessons = coursesState.flatMap(c => c.lessons).filter(l => l.isCompleted).length;
  const totalLessons = coursesState.flatMap(c => c.lessons).length;
  const progress = (completedLessons / totalLessons) * 100;

  const filteredCourses = selectedCategory
    ? coursesState.filter(c => c.category === selectedCategory)
    : coursesState;

  const handleCompleteLesson = () => {
    if (!selectedCourse || !selectedLesson) return;

    setCoursesState(coursesState.map(course => {
      if (course.id === selectedCourse.id) {
        return {
          ...course,
          lessons: course.lessons.map(lesson =>
            lesson.id === selectedLesson.id ? { ...lesson, isCompleted: true } : lesson
          ),
        };
      }
      return course;
    }));

    toast({ title: "Урок завершён! 🎉", description: "+10 баллов к вашим знаниям" });
    
    // Find next lesson
    const currentIndex = selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id);
    const nextLesson = selectedCourse.lessons[currentIndex + 1];
    
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    } else {
      setView("course");
      setSelectedLesson(null);
    }
  };

  const getCourseProgress = (course: Course) => {
    const completed = course.lessons.filter(l => l.isCompleted).length;
    return (completed / course.lessons.length) * 100;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "Начинающий";
      case "intermediate": return "Средний";
      case "advanced": return "Продвинутый";
      default: return difficulty;
    }
  };

  if (selectedLesson && view === "lesson") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => { setView("course"); setSelectedLesson(null); }} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedLesson.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{selectedLesson.duration} мин.</span>
              {selectedLesson.isCompleted && (
                <>
                  <CheckCircle className="w-4 h-4 text-success ml-2" />
                  <span className="text-success">Завершено</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              {selectedLesson.content.map((paragraph, index) => (
                <div key={index} className="bg-card rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{paragraph}</p>
                  </div>
                </div>
              ))}
            </div>

            {!selectedLesson.isCompleted && (
              <Button className="w-full" onClick={handleCompleteLesson}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Урок пройден
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectedCourse && view === "course") {
    const courseProgress = getCourseProgress(selectedCourse);
    const completedCount = selectedCourse.lessons.filter(l => l.isCompleted).length;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => { setView("list"); setSelectedCourse(null); }} className="text-muted-foreground hover:text-foreground">
                ←
              </button>
              {selectedCourse.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <selectedCourse.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedCourse.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-medium">{completedCount}/{selectedCourse.lessons.length} уроков</span>
                </div>
                <Progress value={courseProgress} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Уроки</h4>
              {selectedCourse.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => { setSelectedLesson(lesson); setView("lesson"); }}
                  className="w-full p-4 bg-card rounded-xl flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    lesson.isCompleted ? "bg-success text-success-foreground" : "bg-muted"
                  }`}>
                    {lesson.isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${lesson.isCompleted ? "text-muted-foreground" : ""}`}>
                      {lesson.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {lesson.duration} мин.
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Финансовая грамотность
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm">Ваш прогресс</p>
                <p className="text-2xl font-bold">{completedLessons}/{totalLessons} уроков</p>
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Все
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredCourses.map(course => {
              const courseProgress = getCourseProgress(course);
              const isCompleted = courseProgress === 100;

              return (
                <button
                  key={course.id}
                  onClick={() => { setSelectedCourse(course); setView("course"); }}
                  className="w-full p-4 bg-card rounded-xl text-left hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-success/10" : "bg-primary/10"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <course.icon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                        {getDifficultyLabel(course.difficulty)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {course.lessons.length} уроков
                      </span>
                    </div>
                    <div className="w-20">
                      <Progress value={courseProgress} className="h-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialEducationModal;
