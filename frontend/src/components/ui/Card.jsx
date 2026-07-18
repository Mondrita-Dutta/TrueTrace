import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, variant = 'default', hover = false, children, ...props }, ref) => {
  const variants = {
    default: "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none",
    glass: "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-xl",
    flat: "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
  };

  const hoverEffect = hover ? { whileHover: { y: -5, transition: { duration: 0.2 } } } : {};

  return (
    <motion.div
      ref={ref}
      className={cn("rounded-2xl overflow-hidden", variants[variant], className)}
      {...hoverEffect}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
export default Card;
