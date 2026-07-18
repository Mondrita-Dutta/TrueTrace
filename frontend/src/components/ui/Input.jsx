import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, type, error, label, id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all shadow-sm",
          error && "border-danger focus:ring-danger",
          className
        )}
        ref={ref}
        id={id}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger animate-pulse">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
