import React from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../../components/ui/SectionTitle';

const AboutPage = () => {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionTitle 
          title="About TrueTrace" 
          subtitle="Our mission is to eliminate counterfeits globally by providing immutable, transparent, and instantly verifiable product authentication." 
          center 
        />
        
        <div className="space-y-16 mt-16 text-lg text-slate-600 dark:text-slate-400">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Problem</h3>
            <p className="leading-relaxed">
              Counterfeit goods cost the global economy over $500 billion annually. Beyond the financial impact on legitimate manufacturers, fake products can pose severe health and safety risks to consumers. Traditional anti-counterfeit measures like holograms and serial numbers are increasingly easy for bad actors to replicate.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h3>
            <p className="leading-relaxed mb-4">
              We envision a world where every physical product can be instantly cryptographically verified. By bridging the physical and digital worlds, TrueTrace restores trust in the supply chain.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-primary mb-4">Why Stellar Blockchain?</h3>
            <p className="leading-relaxed">
              We chose the Stellar network for its unparalleled speed, negligible transaction fees, and eco-friendly consensus protocol. Unlike Proof-of-Work blockchains, Stellar allows TrueTrace to authenticate millions of products per day with a near-zero carbon footprint, ensuring our solution is both infinitely scalable and environmentally sustainable.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Technology Stack</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Frontend:</strong> React 19, Vite, TailwindCSS, Framer Motion</li>
              <li><strong>Backend:</strong> Node.js, Express, MongoDB</li>
              <li><strong>Blockchain:</strong> Stellar SDK, Soroban Smart Contracts</li>
              <li><strong>Security:</strong> JWT, bcrypt, Helmet</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
