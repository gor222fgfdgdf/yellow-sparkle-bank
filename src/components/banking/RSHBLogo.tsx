interface RSHBLogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const RSHBLogo = ({ className = "w-12 h-12", variant = "icon" }: RSHBLogoProps) => {
  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
          {/* Green circle background */}
          <circle cx="24" cy="24" r="24" fill="hsl(var(--primary))" />
          {/* Wheat/grain symbol */}
          <g fill="hsl(var(--primary-foreground))">
            {/* Center stem */}
            <path d="M24 38V18" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
            {/* Left grains */}
            <ellipse cx="20" cy="16" rx="3" ry="5" transform="rotate(-20 20 16)" />
            <ellipse cx="18" cy="22" rx="3" ry="5" transform="rotate(-30 18 22)" />
            <ellipse cx="17" cy="28" rx="2.5" ry="4" transform="rotate(-35 17 28)" />
            {/* Right grains */}
            <ellipse cx="28" cy="16" rx="3" ry="5" transform="rotate(20 28 16)" />
            <ellipse cx="30" cy="22" rx="3" ry="5" transform="rotate(30 30 22)" />
            <ellipse cx="31" cy="28" rx="2.5" ry="4" transform="rotate(35 31 28)" />
            {/* Top grain */}
            <ellipse cx="24" cy="12" rx="2.5" ry="4" />
          </g>
        </svg>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground leading-tight">Россельхоз</span>
          <span className="text-lg font-bold text-foreground leading-tight">банк</span>
        </div>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Green circle background */}
      <circle cx="24" cy="24" r="24" fill="hsl(var(--primary))" />
      {/* Wheat/grain symbol */}
      <g fill="hsl(var(--primary-foreground))">
        {/* Center stem */}
        <path d="M24 38V18" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
        {/* Left grains */}
        <ellipse cx="20" cy="16" rx="3" ry="5" transform="rotate(-20 20 16)" />
        <ellipse cx="18" cy="22" rx="3" ry="5" transform="rotate(-30 18 22)" />
        <ellipse cx="17" cy="28" rx="2.5" ry="4" transform="rotate(-35 17 28)" />
        {/* Right grains */}
        <ellipse cx="28" cy="16" rx="3" ry="5" transform="rotate(20 28 16)" />
        <ellipse cx="30" cy="22" rx="3" ry="5" transform="rotate(30 30 22)" />
        <ellipse cx="31" cy="28" rx="2.5" ry="4" transform="rotate(35 31 28)" />
        {/* Top grain */}
        <ellipse cx="24" cy="12" rx="2.5" ry="4" />
      </g>
    </svg>
  );
};

export default RSHBLogo;
