import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  variant?: "spinner" | "dots" | "pulse";
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = "md", 
  text,
  fullScreen = false,
  variant = "spinner"
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-6 h-6"
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex gap-2">
            <div className={`${dotSizes[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: "0ms" }} />
            <div className={`${dotSizes[size]} bg-blue-400 rounded-full animate-bounce`} style={{ animationDelay: "150ms" }} />
            <div className={`${dotSizes[size]} bg-blue-300 rounded-full animate-bounce`} style={{ animationDelay: "300ms" }} />
          </div>
        );
      case "pulse":
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} rounded-full bg-blue-500/20 animate-ping absolute`} />
            <div className={`${sizeClasses[size]} rounded-full bg-blue-500 animate-pulse`} />
          </div>
        );
      default:
        return (
          <div className="relative">
            <svg className={`${sizeClasses[size]} animate-spin`} viewBox="0 0 50 50">
              <circle
                className="stroke-current text-blue-500/20"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
              />
              <circle
                className="stroke-current text-blue-500"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="4"
                strokeDasharray="80, 200"
                strokeLinecap="round"
                style={{
                  strokeDashoffset: 0,
                  animation: 'dash 1.5s ease-in-out infinite'
                }}
              />
            </svg>
          </div>
        );
    }
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
      {renderLoader()}
      {text && (
        <p className="text-sm text-gray-300 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md flex items-center justify-center z-[9998] animate-in fade-in duration-200">
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative card rounded-2xl p-8">
            {loader}
          </div>
        </div>
      </div>
    );
  }

  return loader;
};

export const ButtonLoader: React.FC = () => (
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
      style={{
        strokeDashoffset: 0,
        animation: 'dash 1.5s ease-in-out infinite'
      }}
    />
  </svg>
);
