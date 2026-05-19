import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "rounded-xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-container to-primary-gradient-end text-white glow-primary hover:-translate-y-1",
    secondary: "glass-card text-on-surface hover:bg-white/10",
    ghost: "text-on-surface-variant hover:text-secondary hover:bg-white/5",
    danger: "bg-error-container text-white hover:bg-error transition-colors",
    outline: "bg-transparent border border-white/10 text-text-primary hover:bg-white/5"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : children}
    </button>
  );
};

export default Button;
