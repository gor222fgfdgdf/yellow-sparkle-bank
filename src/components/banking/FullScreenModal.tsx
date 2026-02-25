import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

const FullScreenModal = ({ isOpen, onClose, title, children, headerRight }: FullScreenModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-lg mx-auto min-h-screen">
        <header className="bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            </div>
            {headerRight && <div>{headerRight}</div>}
          </div>
        </header>
        <div className="p-4 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
