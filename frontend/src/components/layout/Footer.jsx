import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';
import Button from '../ui/Button';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">TrueTrace</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
              Verify Every Product. Trust Every Purchase. The modern product authentication platform powered by the Stellar blockchain.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><FaTwitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><FaGithub size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><FaLinkedin size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><FaDiscord size={20} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/docs" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">Documentation</Link></li>
              <li><Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">Contact Support</Link></li>
              <li><Link to="/api" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">API Reference</Link></li>
              <li><Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Subscribe to Newsletter</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Stay updated with the latest anti-counterfeit strategies.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-lg px-4 py-2 w-full text-sm focus:outline-none focus:border-primary" />
              <Button className="rounded-l-none" size="sm">Subscribe</Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TrueTrace Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
