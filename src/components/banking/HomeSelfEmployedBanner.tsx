import promoImage from "@/assets/promo-selfemployed.jpg";

const HomeSelfEmployedBanner = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden p-4">
      <h2 className="text-lg font-bold text-foreground mb-3">Всё для самозанятых</h2>
      <button className="w-full h-[110px] rounded-2xl overflow-hidden relative">
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
