import promoChina from "@/assets/promo-china.jpg";

const HomePromoBannerSlider = () => {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3">
        <button className="flex-shrink-0 w-[85%] h-[80px] rounded-2xl overflow-hidden relative bg-card">
          <img src={promoChina} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="relative z-10 h-full flex items-center p-4">
            <p className="text-primary-foreground text-sm font-medium leading-tight">
              На Новый год в Китай – готовый гид
            </p>
          </div>
        </button>
        <button className="flex-shrink-0 w-[85%] h-[80px] rounded-2xl overflow-hidden bg-card flex items-center p-4">
          <p className="text-sm font-medium text-foreground">Путешествуйте выгодно с РСХБ</p>
        </button>
      </div>
    </div>
  );
};

export default HomePromoBannerSlider;
