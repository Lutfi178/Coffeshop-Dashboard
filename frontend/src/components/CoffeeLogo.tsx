import React from 'react';

interface CoffeeLogoProps {
  size?: number;
  color?: string;
}

export const CoffeeLogo: React.FC<CoffeeLogoProps> = ({ size = 42, color = '#4B3832' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Saucer / Piring cangkir */}
      <ellipse cx="50" cy="80" rx="40" ry="10" stroke={color} strokeWidth="5.5" fill="none" strokeLinecap="round" />

      {/* Cup Body / Badan cangkir */}
      <path
        d="M20 44 C20 74, 30 76, 50 76 C70 76, 80 74, 80 44 Z"
        stroke={color}
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cup Top Rim / Bibir cangkir */}
      <ellipse cx="50" cy="44" rx="30" ry="8" stroke={color} strokeWidth="5.5" fill="none" />

      {/* Cup Handle / Gagang cangkir */}
      <path
        d="M78 48 C92 48, 92 68, 74 70"
        stroke={color}
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Swirl Steam / Uap gulung */}
      <path
        d="M50 36 C44 28, 44 20, 52 16 C58 12, 54 6, 48 8"
        stroke={color}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};
