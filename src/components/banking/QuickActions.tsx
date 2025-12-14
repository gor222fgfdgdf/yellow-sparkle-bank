import { Plus, ArrowRightLeft, History, MoreHorizontal } from "lucide-react";

interface QuickActionsProps {
  onTopUpClick: () => void;
  onTransferClick: () => void;
  onHistoryClick: () => void;
  onMoreClick: () => void;
}

const QuickActions = ({ onTopUpClick, onTransferClick, onHistoryClick, onMoreClick }: QuickActionsProps) => {
  const actions = [
    { icon: Plus, label: "Пополнить", onClick: onTopUpClick },
    { icon: ArrowRightLeft, label: "Перевод", onClick: onTransferClick },
    { icon: History, label: "История", onClick: onHistoryClick },
    { icon: MoreHorizontal, label: "Ещё", onClick: onMoreClick },
  ];

  return (
    <div className="flex justify-between px-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-active:scale-95">
            <action.icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
