import { Percent, Crown, Gift, Zap, Plane } from "lucide-react";

const stories = [
  { id: 1, icon: Percent, title: "Cashback 5%", subtitle: "On groceries", gradient: "from-primary to-amber-400" },
  { id: 2, icon: Crown, title: "Premium", subtitle: "Upgrade now", gradient: "from-foreground to-neutral-600" },
  { id: 3, icon: Gift, title: "Invite", subtitle: "Get $50", gradient: "from-emerald-500 to-teal-400" },
  { id: 4, icon: Zap, title: "Instant", subtitle: "Transfers", gradient: "from-primary to-orange-400" },
  { id: 5, icon: Plane, title: "Travel", subtitle: "Miles bonus", gradient: "from-sky-500 to-blue-400" },
];

const StoriesBanner = () => {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 pb-2">
        {stories.map((story) => (
          <button
            key={story.id}
            className="flex-shrink-0 w-20 group"
          >
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${story.gradient} p-[3px] group-hover:scale-105 transition-transform`}>
              <div className="w-full h-full rounded-[13px] bg-card flex items-center justify-center">
                <story.icon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <p className="text-xs font-medium text-foreground mt-2 text-center truncate">{story.title}</p>
            <p className="text-[10px] text-muted-foreground text-center truncate">{story.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoriesBanner;
