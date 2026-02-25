import promoChina from "@/assets/promo-china.jpg";

const HomePromoBannerSlider = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      <button className="w-full h-[64px] flex items-center gap-3 px-4">
        <img src={promoChina} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        <p className="text-sm font-medium text-primary leading-tight text-left">
          Вкусное предложение в Воронеже
        </p>
      </button>
    </div>
  );
};

export default HomePromoBannerSlider;
