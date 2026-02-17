import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, Heart, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Article {
  title: string;
  views: number;
  likes: number;
  content?: string;
  image?: string;
}

interface SvoeArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  isSaved?: boolean;
  onToggleBookmark?: (title: string) => void;
}

const SvoeArticleModal = ({ isOpen, onClose, article, isSaved = false, onToggleBookmark }: SvoeArticleModalProps) => {
  const [isLiked, setIsLiked] = useState(false);

  if (!article) return null;

  const paragraphs = article.content || `${article.title} — это увлекательная тема, которая заслуживает внимания.\n\nПутешествия по России открывают невероятные возможности для знакомства с культурой, природой и историей нашей страны.\n\nМы собрали для вас самую актуальную информацию и практические рекомендации.`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, text: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${article.title} — ${window.location.href}`);
      toast({ title: "Ссылка скопирована" });
    }
  };

  const renderContent = (text: string) => {
    return text.split("\n\n").map((p, i) => {
      // Handle bold text
      const parts = p.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className="text-foreground/80 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark?.(article.title)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {article.image ? (
            <div className="rounded-2xl h-48 w-full overflow-hidden">
              <img src={article.image} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="bg-accent rounded-2xl h-48 w-full" />
          )}

          <h1 className="text-xl font-bold text-foreground">{article.title}</h1>

          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{article.views}</span>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-1 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
              {article.likes + (isLiked ? 1 : 0)}
            </button>
          </div>

          {renderContent(paragraphs)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SvoeArticleModal;
