import { MessageCircle, Phone, Mail, FileQuestion, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SupportPage = () => {
  const { toast } = useToast();

  const faqs = [
    "How do I reset my PIN?",
    "How to block my card?",
    "Where can I find my statements?",
    "How to set up automatic payments?",
  ];

  const handleContact = (method: string) => {
    toast({
      title: "Contact Support",
      description: `${method} support coming soon!`,
    });
  };

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
              onClick={() => toast({ title: "FAQ", description: "Help article coming soon!" })}
              className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileQuestion className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{faq}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full h-12">Start Live Chat</Button>
    </div>
  );
};

export default SupportPage;
