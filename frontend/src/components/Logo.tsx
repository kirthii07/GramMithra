import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }[size];

  return (
    <div className="flex items-center gap-3">
      {/* Rural Emblem: Golden Sun, Sprouting Leaf, & Cattle Silhouette */}
      <div className={`relative ${sizeClasses} rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-md border border-forest-900 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Sun disc */}
          <circle cx="24" cy="18" r="8" fill="#FBBF24" opacity="0.85" />
          {/* Village Hills */}
          <path
            d="M4 42C12 34 20 36 28 42C34 38 40 39 44 42H4Z"
            fill="#2A6A3B"
          />
          {/* Sprouting Paddy/Leaf */}
          <path
            d="M24 14C24 14 28 20 28 26C28 32 24 36 24 36C24 36 20 32 20 26C20 20 24 14 24 14Z"
            fill="#E8EFE9"
          />
          <path
            d="M24 22C27 24 30 26 31 29"
            stroke="#14532D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M24 24C21 26 18 28 17 31"
            stroke="#14532D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-lg sm:text-xl text-forest-800 tracking-tight leading-none">
              Gram Mitra
            </span>
            <span className="text-xs font-semibold text-forest-600 font-sans">
              கிராம மித்ரா
            </span>
          </div>
          <span className="text-[10px] text-charcoal-400 font-medium tracking-wide">
            Connecting Farmers, Empowering Villages
          </span>
        </div>
      )}
    </div>
  );
};
