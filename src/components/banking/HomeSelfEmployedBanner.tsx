import promoImage from "@/assets/promo-selfemployed.jpg";

const HomeSelfEmployedBanner = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-foreground">Всё для самозанятых</h2>
      </div>
      <button className="w-full h-[120px] rounded-2xl overflow-hidden relative mx-0">
        <img src={promoImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center p-4">
          <p className="text-primary-foreground font-semibold text-base">Перейти в сервис</p>
          <p className="text-primary-foreground/80 text-sm">Контролируйте доходы</p>
        </div>
      </button>
    </div>
  );
};

export default HomeSelfEmployedBanner;
