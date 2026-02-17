import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Bookmark, Eye, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Article {
  title: string;
  views: number;
  likes: number;
  content?: string;
}

interface SvoeBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: Set<string>;
  allArticles: Article[];
  onRemove: (title: string) => void;
  onOpenArticle: (article: Article) => void;
}

const SvoeBookmarksModal = ({ isOpen, onClose, savedArticles, allArticles, onRemove, onOpenArticle }: SvoeBookmarksModalProps) => {
  const saved = allArticles.filter((a) => savedArticles.has(a.title));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto h-[80vh] p-0 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">Закладки</h2>
          <span className="ml-auto text-sm text-muted-foreground">{saved.length} статей</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">Пока пусто</p>
                <p className="text-sm text-muted-foreground mt-1">Сохраняйте статьи, чтобы вернуться к ним позже</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {saved.map((article) => (
                <div key={article.title} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => { onOpenArticle(article); onClose(); }}
                    className="w-full p-4 text-left"
                  >
                    <p className="font-medium text-foreground text-sm leading-tight">{article.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likes}</span>
                    </div>
                  </button>
                  <div className="px-4 pb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(article.title)}
                      className="text-destructive hover:text-destructive h-8 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SvoeBookmarksModal;
