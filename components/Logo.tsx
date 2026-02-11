import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-16", variant = 'full' }) => {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Abstract Right Side - Accent */}
        <path d="M55 35 L48 75 H 63 L 70 35 H 55 Z" style={{ fill: 'var(--color-accent)' }} />
        <rect x="62" y="50" width="12" height="6" style={{ fill: 'var(--color-accent)' }} />
        
        {/* Figure - Primary */}
        <circle cx="45" cy="28" r="7" style={{ fill: 'var(--color-primary)' }} />
        <path d="M25 38 C 25 38 40 40 45 48 L 40 75 H 50 L 53 58 L 56 75 H 66 L 60 48 C 65 40 80 38 80 38 L 75 42 C 75 42 60 45 55 52 L 52 52 L 40 52 C 35 45 20 42 20 42 L 25 38 Z" style={{ fill: 'var(--color-primary)' }} />
        <path d="M45 36 C 45 36 30 38 25 42 L 38 75 H 48 L 45 60 H 52 L 55 75 H 65 L 60 42 C 55 38 45 36 45 36 Z" style={{ fill: 'var(--color-primary)' }} />
      </svg>
    );
  }

  // Full Logo (Icon + Text)
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Icon Part */}
      <svg viewBox="0 0 100 80" className="h-3/5 w-auto mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 25 L52 65 H 64 L 72 25 H 60 Z" style={{ fill: 'var(--color-accent)' }} />
        <rect x="66" y="42" width="10" height="5" style={{ fill: 'var(--color-accent)' }} />

        <circle cx="50" cy="20" r="6" style={{ fill: 'var(--color-primary)' }} />
        <path d="M50 28 C 50 28 35 30 30 35 L 42 65 H 50 L 48 50 H 54 L 58 65 H 66 L 62 35 C 58 30 50 28 50 28 Z" style={{ fill: 'var(--color-primary)' }} />
      </svg>

      {/* Text Part */}
      <div className="flex items-baseline leading-none">
        <span className="font-bold text-3xl tracking-tight text-primary">H</span>
        <div className="relative flex flex-col items-center mx-[1px]">
           {/* Arrow for 'i' */}
           <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 mb-[2px] text-primary" fill="currentColor">
             <path d="M5 0 L10 7 L5 6 L0 7 Z" />
           </svg>
           <span className="font-bold text-3xl tracking-tight text-primary leading-none">i</span>
        </div>
        <span className="font-bold text-3xl tracking-tight text-primary">re</span>
        <span className="font-bold text-3xl tracking-tight text-accent">Em</span>
      </div>
    </div>
  );
};