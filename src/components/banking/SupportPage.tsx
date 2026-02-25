import { useState } from "react";
import { MessageCircle, Phone, Mail, FileQuestion, ChevronRight, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

const SupportPage = () => {
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<{ question: string; answer: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Здравствуйте! Чем могу помочь?", isUser: false, time: "Сейчас" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const faqs = [
    { 
      question: "Как сменить ПИН-код?", 
      answer: "Чтобы сменить ПИН-код, перейдите в Меню → Карты → Посмотреть ПИН. Там вы можете просмотреть текущий ПИН или запросить новый. Новый ПИН будет отправлен на ваш номер телефона." 
    },
    { 
      question: "Как заблокировать карту?", 
      answer: "Вы можете мгновенно заморозить карту в разделе Меню → Карты → Заморозить карту. Это временно заблокирует все операции. Для полной блокировки обратитесь в чат поддержки." 
    },
    { 
      question: "Где найти выписку?", 
      answer: "Выписки по счёту доступны в разделе Ещё → Выписки. Вы можете скачать ежемесячные выписки в формате PDF за последние 12 месяцев." 
    },
    { 
      question: "Как настроить автоплатёж?", 
      answer: "Перейдите в Платежи → выберите категорию → укажите поставщика. После оплаты появится опция «Сделать регулярным». Настройте периодичность и сумму для автоматических платежей." 
    },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      time: "Сейчас",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    setTimeout(() => {
      const botResponses = [
        "Спасибо за обращение! Сейчас проверю информацию.",
        "Понял вас. Помогу разобраться с этим вопросом.",
        "Отличный вопрос! Вот что нужно знать...",
        "Уже работаю над вашим запросом. Одну минуту.",
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: randomResponse, isUser: false, time: "Сейчас" },
      ]);
    }, 1000);
  };

  const handleContact = (method: string) => {
    if (method === "Chat") {
      setIsChatOpen(true);
    } else if (method === "Call") {
      toast({ title: "Звонок", description: "Соединяем с 8-800-555-777..." });
    } else if (method === "Email") {
      toast({ title: "Email", description: "Открываем support@tinkbank.ru" });
    }
  };

  const handleFaqClick = (faq: typeof faqs[0]) => {
    setSelectedFaq(faq);
    setIsFaqOpen(true);
  };

  if (isChatOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="bg-background border-b border-border p-4 flex items-center gap-4">
          <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Чат поддержки</p>
              <p className="text-xs text-green-500">Онлайн</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.isUser 
                  ? "bg-primary text-primary-foreground rounded-br-md" 
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 px-4 py-3 bg-muted rounded-full border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={handleSendMessage} size="icon" className="rounded-full h-12 w-12">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isFaqOpen && selectedFaq) {
    return (
      <div className="space-y-6">
        <button onClick={() => setIsFaqOpen(false)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад</span>
        </button>

        <div className="bg-card rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <FileQuestion className="w-6 h-6 text-primary mt-1" />
            <h2 className="text-lg font-bold text-foreground">{selectedFaq.question}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{selectedFaq.answer}</p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <p className="text-sm text-muted-foreground mb-3">Это помогло?</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                toast({ title: "Спасибо!", description: "Рады, что помогли." });
                setIsFaqOpen(false);
              }}
            >
              Да, спасибо!
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsChatOpen(true)}
            >
              Нет, в чат
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground px-1">Чем помочь?</h2>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleContact("Chat")}
          className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl hover:bg-muted transition-colors"
        >
          <MessageCircle className="w-8 h-8 text-primary" />
          <span className="text-sm font-medium text-foreground">Чат</span>
        </button>
        <button
          onClick={() => handleContact("Call")}
          className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl hover:bg-muted transition-colors"
        >
          <Phone className="w-8 h-8 text-primary" />
          <span className="text-sm font-medium text-foreground">Звонок</span>
        </button>
        <button
          onClick={() => handleContact("Email")}
          className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl hover:bg-muted transition-colors"
        >
          <Mail className="w-8 h-8 text-primary" />
          <span className="text-sm font-medium text-foreground">Email</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground px-1">Частые вопросы</h3>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {faqs.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => handleFaqClick(faq)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileQuestion className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{faq.question}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => setIsChatOpen(true)} className="w-full h-12">
        Начать чат
      </Button>
    </div>
  );
};

export default SupportPage;
