import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = ({ label, error, icon, className = '', ...props }: InputProps) => {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-xs text-text-muted font-medium ml-1 uppercase tracking-widest">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors">
            {icon}
          </div>
        )}
        <input 
          className={`
            w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 py-4 
            ${icon ? 'pl-12' : 'pl-6'} pr-6 text-white font-medium
            focus:outline-none focus:border-secondary/50 focus:bg-[#0F172A]/80 focus:ring-4 focus:ring-secondary/5 transition-all duration-300 rounded-2xl
            placeholder:text-white/20
            ${error ? 'border-error/50 ring-error/5' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-error font-medium ml-1">{error}</p>}
    </div>
  );
};

export default Input;
