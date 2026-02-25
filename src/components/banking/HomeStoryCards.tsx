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
    { image: storyHotels, label: "Кредит по\nставке на\n2-6% ниже", onClick: onOpenDeposits },
    { image: storyInvest, label: "Приглашаем\nв мир\nинвестиций", onClick: onOpenInvestment, hasBorder: true },
    { image: storyKwikpay, label: "KWIKPAY для\nзарубежных\nпереводов", onClick: onOpenCurrency },
    { image: storyWish, label: "Карта,\nисполняющая\nжелания", onClick: onOpenLoyalty },
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2.5">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={card.onClick}
            className={`flex-shrink-0 w-[130px] h-[150px] rounded-2xl overflow-hidden relative group ${
              card.hasBorder ? "ring-2 ring-primary" : ""
            }`}
          >
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-[12px] font-semibold text-primary-foreground leading-tight whitespace-pre-line text-left">
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
