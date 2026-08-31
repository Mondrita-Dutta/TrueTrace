import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for small businesses starting with blockchain tracing.",
      features: ["Up to 100 products/month", "Basic Analytics", "Community Support", "Standard Blockchain Verification"],
      buttonText: "Get Started Free",
      isPopular: false
    },
    {
      name: "Professional",
      price: "$99",
      description: "Advanced features for growing manufacturers.",
      features: ["Up to 5,000 products/month", "Advanced Analytics Dashboard", "Priority Email Support", "Custom Branding on Verification", "API Access"],
      buttonText: "Start 14-Day Trial",
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large scale manufacturing operations.",
      features: ["Unlimited products", "Custom Integration Solutions", "Dedicated Account Manager", "On-Premise Deployment Options", "SLA Guarantee"],
      buttonText: "Contact Sales",
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400"
        >
          Choose the perfect plan for your business needs. No hidden fees or surprise charges.
        </motion.p>
      </div>

      <div className="mt-16 max-w-7xl mx-auto grid gap-8 lg:grid-cols-3 lg:gap-12">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className={`relative p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col ${plan.isPopular ? 'ring-2 ring-primary scale-105 z-10' : 'border border-slate-200 dark:border-slate-700'}`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
            <p className="mt-4 text-slate-500 dark:text-slate-400">{plan.description}</p>
            <div className="mt-8 flex items-baseline">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
              {plan.price !== "Custom" && <span className="ml-2 text-xl font-medium text-slate-500 dark:text-slate-400">/mo</span>}
            </div>
            
            <ul className="mt-8 space-y-4 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-slate-700 dark:text-slate-300">{feature}</p>
                </li>
              ))}
            </ul>
            
            <button className={`mt-8 w-full py-3 px-6 rounded-lg font-bold text-center transition-colors ${plan.isPopular ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white'}`}>
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
