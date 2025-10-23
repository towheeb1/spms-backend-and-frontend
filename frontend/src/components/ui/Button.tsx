import React from "react";

type Variant = "primary" | "success" | "danger" | "outline" | "ghost" | "default";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  elevated?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      elevated = false,
      fullWidth = false,
      loading = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) {
    const variantClasses = {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30',
      success: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/30',
      danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/30',
      outline: 'bg-transparent border-2 border-white/30 hover:border-white/50 text-white',
      ghost: 'bg-transparent hover:bg-white/10 text-white',
      default: 'bg-white/6 hover:bg-white/10 text-white'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <button
        ref={ref}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${elevated ? 'shadow-2xl' : ''}
          rounded-xl
          font-medium
          transition-all
          duration-200
          transform
          hover:scale-105
          active:scale-95
          disabled:opacity-50 
          disabled:cursor-not-allowed
          disabled:transform-none
          disabled:shadow-none
          relative
          overflow-hidden
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 50 50">
              <circle
                className="stroke-current opacity-25"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"
              />
              <circle
                className="stroke-current"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"
                strokeDasharray="80, 200"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </button>
    );
  }
);
