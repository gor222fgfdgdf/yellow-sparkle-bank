import { useState } from "react";
import { MessageCircle, Phone, Mail, FileQuestion, ChevronRight, X, Send, ArrowLeft } from "lucide-react";
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
    { id: "1", text: "Hello! How can I help you today?", isUser: false, time: "Now" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const faqs = [
    { 
      question: "How do I reset my PIN?", 
      answer: "To reset your PIN, go to Menu > Cards > View PIN. You can view your current PIN or request a new one. The new PIN will be sent to your registered email within 24 hours." 
    },
    { 
      question: "How to block my card?", 
      answer: "You can instantly freeze your card from Menu > Cards > Freeze Card toggle. This will temporarily block all transactions. To permanently block, contact support via chat." 
    },
    { 
      question: "Where can I find my statements?", 
      answer: "Your account statements are available in More > Statements. You can download monthly statements in PDF format for the last 12 months." 
    },
    { 
      question: "How to set up automatic payments?", 
      answer: "Go to Payments > select a category > choose your provider. After making a payment, you'll see an option to 'Make this recurring'. Set the frequency and amount for automatic payments." 
    },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      time: "Now",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "Thank you for your message! Let me check that for you.",
        "I understand. Let me help you with that.",
        "Great question! Here's what you need to know...",
        "I'm looking into this for you. One moment please.",
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: randomResponse, isUser: false, time: "Now" },
      ]);
    }, 1000);
  };

  const handleContact = (method: string) => {
    if (method === "Chat") {
      setIsChatOpen(true);
    } else if (method === "Call") {
      toast({ title: "Calling Support", description: "Connecting to 1-800-555-BANK..." });
    } else if (method === "Email") {
      toast({ title: "Email Support", description: "Opening email to support@bank.com" });
    }
  };

  const handleFaqClick = (faq: typeof faqs[0]) => {
    setSelectedFaq(faq);
    setIsFaqOpen(true);
  };

  // Chat View
  if (isChatOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center gap-4">
          <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Support Chat</p>
              <p className="text-xs text-green-500">Online</p>
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
              placeholder="Type a message..."
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

  // FAQ Detail View
  if (isFaqOpen && selectedFaq) {
    return (
      <div className="space-y-6">
        <button onClick={() => setIsFaqOpen(false)} className="flex items-center gap-2 text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Help</span>
        </button>

        <div className="bg-card rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <FileQuestion className="w-6 h-6 text-primary mt-1" />
            <h2 className="text-lg font-bold text-foreground">{selectedFaq.question}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{selectedFaq.answer}</p>
        </div>

        <div className="bg-card rounded-2xl p-4">
          <p className="text-sm text-muted-foreground mb-3">Was this helpful?</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                toast({ title: "Thank you!", description: "We're glad this helped." });
                setIsFaqOpen(false);
              }}
            >
              Yes, thanks!
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsChatOpen(true)}
            >
              No, chat with agent
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground px-1">How can we help?</h2>
      
      {/* Contact Options */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleContact("Chat")}
          className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl hover:bg-muted transition-colors"
        >
          <MessageCircle className="w-8 h-8 text-primary" />
          <span className="text-sm font-medium text-foreground">Chat</span>
        </button>
        <button
          onClick={() => handleContact("Call")}
          className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl hover:bg-muted transition-colors"
        >
          <Phone className="w-8 h-8 text-primary" />
          <span className="text-sm font-medium text-foreground">Call</span>
        </button>
        <button
          onClick={() => handleContact("Email")}
          className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl hover:bg-muted transition-colors"
        >
          <Mail className="w-8 h-8 text-primary" />
          <span className="text-sm font-medium text-foreground">Email</span>
        </button>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground px-1">Frequently Asked</h3>
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
        Start Live Chat
      </Button>
    </div>
  );
};

export default SupportPage;
