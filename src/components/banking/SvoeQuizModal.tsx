import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  title: string;
  questions: number;
}

interface SvoeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
}

const quizzesData: Record<string, QuizQuestion[]> = {
  "Зимние чудеса России — сможете угадать все?": [
    { question: "В каком городе находится ледяной городок, который строят каждую зиму?", options: ["Екатеринбург", "Новосибирск", "Красноярск", "Пермь"], correctIndex: 0 },
    { question: "Какое озеро замерзает так, что по нему можно ездить на машине?", options: ["Ладожское", "Онежское", "Байкал", "Селигер"], correctIndex: 2 },
    { question: "Где проходит фестиваль «Путешествие в Рождество»?", options: ["Санкт-Петербург", "Москва", "Казань", "Нижний Новгород"], correctIndex: 1 },
    { question: "Какой регион славится катанием на оленьих упряжках?", options: ["Камчатка", "Ямал", "Сахалин", "Алтай"], correctIndex: 1 },
    { question: "Где находится знаменитая Снежная деревня из снега и льда?", options: ["Мурманск", "Кировск", "Апатиты", "Архангельск"], correctIndex: 1 },
    { question: "В каком городе зимой работает самый длинный каток?", options: ["Москва (ВДНХ)", "Казань", "Сочи", "Тюмень"], correctIndex: 0 },
    { question: "Какой горнолыжный курорт — крупнейший в России?", options: ["Шерегеш", "Роза Хутор", "Домбай", "Эльбрус"], correctIndex: 1 },
    { question: "Где можно увидеть северное сияние в России?", options: ["Калининград", "Мурманск", "Сочи", "Владивосток"], correctIndex: 1 },
    { question: "Какая река замерзает последней в Сибири?", options: ["Обь", "Енисей", "Ангара", "Лена"], correctIndex: 2 },
    { question: "В каком регионе празднуют Сагаалган — буддийский Новый год?", options: ["Тыва", "Бурятия", "Калмыкия", "Все перечисленные"], correctIndex: 3 },
  ],
  "Угадай регион по фотографии": [
    { question: "Столбы выветривания на плато — визитная карточка какого региона?", options: ["Коми (Маньпупунёр)", "Красноярский край", "Якутия", "Камчатка"], correctIndex: 0 },
    { question: "Долина гейзеров находится в...", options: ["Алтае", "Камчатке", "Курилах", "Сахалине"], correctIndex: 1 },
    { question: "Песчаные дюны Чарских песков расположены в...", options: ["Калмыкии", "Дагестане", "Забайкалье", "Астраханской области"], correctIndex: 2 },
    { question: "Кижский погост — объект ЮНЕСКО — находится в...", options: ["Вологодской области", "Карелии", "Архангельской области", "Псковской области"], correctIndex: 1 },
    { question: "Эльбрус — самая высокая гора Европы — расположена в...", options: ["Дагестане", "Кабардино-Балкарии", "Чечне", "Северной Осетии"], correctIndex: 1 },
    { question: "Куршская коса — уникальный полуостров — находится в...", options: ["Ленинградской области", "Калининградской области", "Мурманской области", "Краснодарском крае"], correctIndex: 1 },
    { question: "Ленские столбы расположены в...", options: ["Красноярском крае", "Иркутской области", "Якутии", "Бурятии"], correctIndex: 2 },
    { question: "Мечеть «Сердце Чечни» находится в городе...", options: ["Махачкала", "Грозный", "Нальчик", "Назрань"], correctIndex: 1 },
  ],
};

const SvoeQuizModal = ({ isOpen, onClose, quiz }: SvoeQuizModalProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quiz) return null;

  const questions = quizzesData[quiz.title] || [];
  if (questions.length === 0) return null;

  const question = questions[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === question?.correctIndex;
  const progress = ((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    if (idx === question.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const handleClose = () => {
    handleRestart();
    onClose();
  };

  const getResultText = () => {
    const pct = score / questions.length;
    if (pct === 1) return "Превосходно! Вы настоящий знаток! 🎉";
    if (pct >= 0.7) return "Отличный результат! 👏";
    if (pct >= 0.5) return "Неплохо, но можно лучше! 💪";
    return "Попробуйте ещё раз! 📚";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto h-[80vh] p-0 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={handleClose} className="w-10 h-10 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground truncate">{quiz.title}</p>
            {!finished && (
              <p className="text-xs text-muted-foreground">{currentQ + 1} из {questions.length}</p>
            )}
          </div>
        </div>

        {!finished && <Progress value={progress} className="h-1 rounded-none" />}

        <div className="flex-1 overflow-y-auto p-4">
          {finished ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{score} из {questions.length}</h2>
                <p className="text-muted-foreground mt-2">{getResultText()}</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button onClick={handleRestart} variant="outline" className="flex-1 h-12 rounded-xl">
                  Заново
                </Button>
                <Button onClick={handleClose} className="flex-1 h-12 rounded-xl">
                  Закрыть
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground leading-tight">{question.question}</h2>
              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                  let style = "bg-card border border-border";
                  if (isAnswered) {
                    if (idx === question.correctIndex) style = "bg-primary/10 border-2 border-primary";
                    else if (idx === selected) style = "bg-destructive/10 border-2 border-destructive";
                  } else {
                    style = "bg-card border border-border active:scale-[0.98]";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${style}`}
                    >
                      <span className="flex-1 text-sm font-medium text-foreground">{opt}</span>
                      {isAnswered && idx === question.correctIndex && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                      {isAnswered && idx === selected && idx !== question.correctIndex && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!finished && isAnswered && (
          <div className="p-4 border-t border-border">
            <Button onClick={handleNext} className="w-full h-12 rounded-xl font-medium">
              {currentQ + 1 >= questions.length ? "Результат" : "Далее"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SvoeQuizModal;
