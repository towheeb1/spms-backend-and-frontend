import React from 'react';

type P = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'filled' | 'outlined';
};

export const Input: React.FC<P> = ({ 
  className = '', 
  variant = 'default',
  type,
  ...p 
}) => {
  const variantClasses = {
    default: 'bg-black/10 border border-white/20',
    filled: 'bg-gray-700/50 border border-gray-600/30',
    outlined: 'bg-transparent border-2 border-blue-500/50'
  };

  const dateStyles = type === 'date' ? '[color-scheme:dark] cursor-pointer' : '';

  return (
    <input 
      type={type}
      className={`px-3 py-2 rounded-2xl text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${variantClasses[variant]} ${dateStyles} ${className}`} 
      {...p}
    />
  );
};