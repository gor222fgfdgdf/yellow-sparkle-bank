const UnionPayLogo = ({ className = "w-16 h-10" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red section */}
      <path
        d="M10 10 L35 10 C40 10 45 15 43 25 L33 55 C31 65 25 70 20 70 L0 70 L10 10Z"
        fill="#E21836"
      />
      {/* Blue section */}
      <path
        d="M30 10 L55 10 C60 10 65 15 63 25 L53 55 C51 65 45 70 40 70 L15 70 L30 10Z"
        fill="#00447C"
      />
      {/* Green section */}
      <path
        d="M50 10 L75 10 C80 10 85 15 83 25 L73 55 C71 65 65 70 60 70 L35 70 L50 10Z"
        fill="#007B84"
      />
      {/* Text "UnionPay" */}
      <text
        x="88"
        y="45"
        fill="currentColor"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Union
      </text>
      <text
        x="88"
        y="58"
        fill="currentColor"
        fontSize="12"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Pay
      </text>
    </svg>
  );
};

export default UnionPayLogo;
