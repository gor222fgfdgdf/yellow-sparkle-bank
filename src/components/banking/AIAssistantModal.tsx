import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles, TrendingUp, PiggyBank, CreditCard, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
}

const AIAssistantModal = ({ isOpen, onClose, balance = 0 }: AIAssistantModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Здравствуйте! Я ваш финансовый помощник. Могу помочь с анализом расходов, советами по экономии и ответить на вопросы о ваших финансах. Чем могу помочь?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    { icon: TrendingUp, text: "Анализ расходов", query: "Проанализируй мои расходы за последний месяц" },
    { icon: PiggyBank, text: "Советы по экономии", query: "Как я могу сэкономить деньги?" },
    { icon: CreditCard, text: "Кэшбэк", query: "Как увеличить кэшбэк?" },
    { icon: HelpCircle, text: "Лимиты карты", query: "Какие у меня лимиты по карте?" },
  ];

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("расход") || lowerMessage.includes("анализ")) {
      return `📊 Анализ ваших расходов за последний месяц:

**Основные категории:**
• Продукты: 28,450 ₽ (32%)
• Транспорт: 12,300 ₽ (14%)
• Развлечения: 15,600 ₽ (18%)
• Рестораны: 9,800 ₽ (11%)
• Прочее: 21,850 ₽ (25%)

**Рекомендации:**
1. Расходы на развлечения выше среднего на 15%
2. Рекомендую установить бюджет на рестораны
3. Используйте кэшбэк категории для продуктов

Хотите узнать больше о какой-либо категории?`;
    }

    if (lowerMessage.includes("эконом") || lowerMessage.includes("сохран")) {
      return `💡 Советы по экономии:

1. **Автоматические накопления**
   Настройте перевод 10% с каждого поступления на накопительный счёт

2. **Кэшбэк-оптимизация**
   Выберите категории с максимальным кэшбэком для ваших основных трат

3. **Подписки**
   Проверьте неиспользуемые подписки — можете сэкономить до 2,000 ₽/мес

4. **Сравнение цен**
   Используйте сканер штрих-кодов для сравнения цен в магазинах

5. **Планирование покупок**
   Составьте список перед походом в магазин

Ваш текущий баланс: ${new Intl.NumberFormat("ru-RU").format(balance)} ₽`;
    }

    if (lowerMessage.includes("кэшбэк") || lowerMessage.includes("cashback")) {
      return `💎 Информация о кэшбэке:

**Текущие категории:**
• Рестораны: 5% (до 3,000 ₽/мес)
• Супермаркеты: 3% (до 1,500 ₽/мес)
• Транспорт: 5% (до 2,000 ₽/мес)

**Советы по увеличению кэшбэка:**
1. Выбирайте категории под ваши основные траты
2. Оплачивайте покупки картой, а не наличными
3. Участвуйте в акциях партнёров с повышенным кэшбэком
4. Не забывайте менять категории каждый месяц

За этот месяц вы заработали: 2,450 ₽ кэшбэка`;
    }

    if (lowerMessage.includes("лимит")) {
      return `📋 Ваши лимиты:

**Карта Union Pay:**
• Дневной лимит: 500,000 ₽
• Снятие наличных: 150,000 ₽/день
• Онлайн-покупки: 300,000 ₽/день
• Международные операции: включены

**Использовано сегодня:**
• Покупки: 12,500 ₽ из 500,000 ₽
• Снятие: 0 ₽ из 150,000 ₽

Хотите изменить лимиты? Это можно сделать в разделе "Управление картой".`;
    }

    if (lowerMessage.includes("привет") || lowerMessage.includes("здравств")) {
      return `Здравствуйте! 👋

Я готов помочь вам с:
• Анализом расходов и доходов
• Советами по экономии
• Информацией о кэшбэке и бонусах
• Ответами на вопросы о банковских продуктах
• Планированием бюджета

Что вас интересует?`;
    }

    if (lowerMessage.includes("перевод") || lowerMessage.includes("отправить")) {
      return `💸 Для перевода денег:

1. **По номеру телефона (СБП)**
   Мгновенный перевод без комиссии до 100,000 ₽/мес

2. **По номеру карты**
   Комиссия 1.5% для карт других банков

3. **Между своими счетами**
   Бесплатно и мгновенно

4. **По QR-коду**
   Отсканируйте код получателя

Перейти к переводу можно на главном экране или сказать мне сумму и получателя.`;
    }

    return `Спасибо за ваш вопрос! 

Я могу помочь с:
• 📊 Анализом ваших финансов
• 💰 Советами по экономии
• 💳 Информацией о картах и счетах
• 🎁 Кэшбэком и бонусами
• 📅 Планированием бюджета

Попробуйте спросить что-то конкретное, например:
"Проанализируй мои расходы" или "Как увеличить кэшбэк?"`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (query: string) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            Финансовый помощник
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q.query)}
                  className="p-3 bg-card rounded-xl text-left hover:bg-muted transition-colors"
                >
                  <q.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">{q.text}</p>
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-primary" : "bg-muted"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="bg-card p-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Задайте вопрос..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantModal;
