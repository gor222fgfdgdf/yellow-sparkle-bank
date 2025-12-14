import { useState } from "react";
import { Percent, Crown, Gift, Zap, Plane, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: number;
  icon: any;
  title: string;
  subtitle: string;
  gradient: string;
  content: {
    heading: string;
    description: string;
    cta: string;
    details: string[];
  };
}

const stories: Story[] = [
  { 
    id: 1, 
    icon: Percent, 
    title: "Cashback 5%", 
    subtitle: "On groceries", 
    gradient: "from-primary to-amber-400",
    content: {
      heading: "5% Cashback on Groceries!",
      description: "Get 5% back on all grocery purchases this month. No limits!",
      cta: "Activate Now",
      details: ["Valid until Dec 31", "All grocery stores included", "Max $50 cashback per month"],
    }
  },
  { 
    id: 2, 
    icon: Crown, 
    title: "Premium", 
    subtitle: "Upgrade now", 
    gradient: "from-foreground to-neutral-600",
    content: {
      heading: "Upgrade to Premium",
      description: "Unlock exclusive benefits with our Premium account.",
      cta: "Upgrade for $9.99/mo",
      details: ["No foreign transaction fees", "Priority customer support", "Exclusive rewards"],
    }
  },
  { 
    id: 3, 
    icon: Gift, 
    title: "Invite", 
    subtitle: "Get $50", 
    gradient: "from-emerald-500 to-teal-400",
    content: {
      heading: "Invite Friends, Get $50",
      description: "Share your referral code and earn $50 for each friend who joins.",
      cta: "Share Code",
      details: ["Unlimited referrals", "Friends get $25 too", "Credited within 24 hours"],
    }
  },
  { 
    id: 4, 
    icon: Zap, 
    title: "Instant", 
    subtitle: "Transfers", 
    gradient: "from-primary to-orange-400",
    content: {
      heading: "Instant Transfers",
      description: "Send money instantly to any bank account, 24/7.",
      cta: "Try Now",
      details: ["Arrives in seconds", "Free for Premium", "Available to all banks"],
    }
  },
  { 
    id: 5, 
    icon: Plane, 
    title: "Travel", 
    subtitle: "Miles bonus", 
    gradient: "from-sky-500 to-blue-400",
    content: {
      heading: "Earn 2X Travel Miles",
      description: "Double miles on all travel purchases this holiday season.",
      cta: "Learn More",
      details: ["Hotels, flights, car rentals", "No expiration on miles", "Redeem for any airline"],
    }
  },
];

const StoriesBanner = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { toast } = useToast();

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleCTA = (story: Story) => {
    toast({ 
      title: "Success!", 
      description: `${story.content.cta} activated for ${story.title}` 
    });
    setSelectedStory(null);
  };

  return (
    <>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 pb-2">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story)}
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

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-br ${selectedStory.gradient} p-6 text-center`}>
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-card/20 hover:bg-card/30 transition-colors"
              >
                <X className="w-5 h-5 text-card" />
              </button>
              <div className="w-16 h-16 rounded-full bg-card/20 flex items-center justify-center mx-auto mb-4">
                <selectedStory.icon className="w-8 h-8 text-card" />
              </div>
              <h2 className="text-xl font-bold text-card">{selectedStory.content.heading}</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground text-center">{selectedStory.content.description}</p>
              
              <div className="space-y-2">
                {selectedStory.content.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">{detail}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full h-12 text-lg font-semibold"
                onClick={() => handleCTA(selectedStory)}
              >
                {selectedStory.content.cta}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesBanner;
