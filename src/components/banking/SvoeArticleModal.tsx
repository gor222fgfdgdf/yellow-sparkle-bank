import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, Heart, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Article {
  title: string;
  views: number;
  likes: number;
  content?: string;
}

interface SvoeArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

const SvoeArticleModal = ({ isOpen, onClose, article }: SvoeArticleModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!article) return null;

  const paragraphs = article.content || `${article.title} — это увлекательная тема, которая заслуживает внимания. В этой статье мы рассмотрим основные аспекты и поделимся полезными советами.\n\nПутешествия по России открывают невероятные возможности для знакомства с культурой, природой и историей нашей страны. Каждый регион уникален и предлагает свои особенные впечатления.\n\nМы собрали для вас самую актуальную информацию и практические рекомендации, которые помогут спланировать идеальное путешествие.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsBookmarked(!isBookmarked)} className="w-10 h-10 rounded-full flex items-center justify-center">
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Hero image placeholder */}
          <div className="bg-accent rounded-2xl h-48 w-full" />

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

          {paragraphs.split("\n\n").map((p, i) => (
            <p key={i} className="text-foreground/80 leading-relaxed">{p}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SvoeArticleModal;
