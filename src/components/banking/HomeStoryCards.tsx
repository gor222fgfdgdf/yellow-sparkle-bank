import storyHotels from "@/assets/story-hotels.jpg";
import storyInvest from "@/assets/story-invest.jpg";
import storyKwikpay from "@/assets/story-kwikpay.jpg";
import storyWish from "@/assets/story-wish.jpg";

interface HomeStoryCardsProps {
  onOpenDeposits?: () => void;
  onOpenInvestment?: () => void;
  onOpenCurrency?: () => void;
  onOpenLoyalty?: () => void;
}

const HomeStoryCards = ({ onOpenDeposits, onOpenInvestment, onOpenCurrency, onOpenLoyalty }: HomeStoryCardsProps) => {
  const cards = [
    { image: storyHotels, label: "Отели\nв горах\nот 1 500 ₽", onClick: undefined, color: "from-blue-500/80" },
    { image: storyInvest, label: "Приглашаем\nв мир\nинвестиций", onClick: onOpenInvestment, color: "from-green-600/80" },
    { image: storyKwikpay, label: "KWIKPAY для\nзарубежных\nпереводов", onClick: onOpenCurrency, color: "from-emerald-500/80" },
    { image: storyWish, label: "Карта,\nисполняющая\nжелания", onClick: onOpenLoyalty, color: "from-amber-600/80" },
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={card.onClick}
            className="flex-shrink-0 w-[140px] h-[160px] rounded-2xl overflow-hidden relative group"
          >
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent`} />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[13px] font-semibold text-primary-foreground leading-tight whitespace-pre-line text-left">
                {card.label}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeStoryCards;
