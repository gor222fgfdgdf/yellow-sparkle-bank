import { ChevronRight } from "lucide-react";
import promoImage from "@/assets/promo-unionpay.jpg";

interface HomePromoBannerProps {
  onOpenVirtualCards?: () => void;
}

const HomePromoBanner = ({ onOpenVirtualCards }: HomePromoBannerProps) => {
  return (
    <button
      onClick={onOpenVirtualCards}
      className="w-full rounded-2xl overflow-hidden relative h-28 bg-primary-foreground/10"
    >
      <img
        src={promoImage}
        alt="Promo"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="relative z-10 h-full flex flex-col justify-end p-4 text-left">
        <p className="text-primary-foreground font-semibold text-lg leading-tight">
          Карта UnionPay
        </p>
        <div className="flex items-center gap-1">
          <span className="text-primary-foreground/90 text-sm">бесплатно</span>
          <ChevronRight className="w-4 h-4 text-primary-foreground/90" />
        </div>
      </div>
    </button>
  );
};

export default HomePromoBanner;
