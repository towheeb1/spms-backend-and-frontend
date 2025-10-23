// src/components/ui/ThemeToggle.tsx
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'button' | 'switch';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className = '', 
  variant = 'icon',
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center gap-3 px-4 py-2.5 rounded-xl
          bg-white/5 backdrop-blur-sm border border-white/10
          hover:bg-white/10 transition-all duration-300
          ${className}
        `}
        aria-label="تبديل الوضع"
      >
        <div className="relative w-12 h-6 bg-white/20 rounded-full transition-colors">
          <div
            className={`
              absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300
              ${isDark 
                ? 'right-0.5 bg-blue-500 shadow-lg shadow-blue-500/50' 
                : 'right-6.5 bg-yellow-400 shadow-lg shadow-yellow-400/50'
              }
            `}
          />
        </div>
        {showLabel && (
          <span className="text-sm font-medium">
            {isDark ? 'الوضع الليلي' : 'الوضع النهاري'}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-white/5 backdrop-blur-sm border border-white/10
          hover:bg-white/10 transition-all duration-300
          ${className}
        `}
        aria-label="تبديل الوضع"
      >
        <span className="text-xl">
          {isDark ? '🌙' : '☀️'}
        </span>
        {showLabel && (
          <span className="text-sm font-medium">
            {isDark ? 'ليلي' : 'نهاري'}
          </span>
        )}
      </button>
    );
  }

  // Default: icon only
  return (
    <button
      onClick={toggleTheme}
      className={`
        group relative w-11 h-11 rounded-xl
        bg-white/5 backdrop-blur-sm border border-white/10
        hover:bg-white/10 hover:scale-105
        transition-all duration-300
        flex items-center justify-center
        ${className}
      `}
      aria-label="تبديل الوضع"
    >
      {/* Sun Icon */}
      <svg
        className={`
          absolute w-6 h-6 transition-all duration-500
          ${isDark 
            ? 'opacity-0 rotate-90 scale-0' 
            : 'opacity-100 rotate-0 scale-100'
          }
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="5" strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        />
      </svg>

      {/* Moon Icon */}
      <svg
        className={`
          absolute w-6 h-6 transition-all duration-500
          ${isDark 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-90 scale-0'
          }
        `}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Tooltip */}
      <span className="
        absolute -bottom-10 left-1/2 -translate-x-1/2
        px-2 py-1 rounded-lg bg-black/80 text-white text-xs
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200 pointer-events-none
        whitespace-nowrap
      ">
        {isDark ? 'تبديل للوضع النهاري' : 'تبديل للوضع الليلي'}
      </span>
    </button>
  );
}
