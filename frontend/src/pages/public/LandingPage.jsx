import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaQrcode, FaChartLine, FaChevronDown } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import api from '../../services/api';

const LandingPage = () => {

  const [metricsCount, setMetricsCount] = useState("...");

  const targetMousePosition = useRef({ x: -1000, y: -1000 });
  const currentGlowPosition = useRef({ x: -1000, y: -1000 });
  const rafId = useRef(null);
  const heroRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    targetMousePosition.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    if (mediaQuery.matches || isTouch) return;

    const updateGlowPosition = () => {
      const dx = targetMousePosition.current.x - currentGlowPosition.current.x;
      const dy = targetMousePosition.current.y - currentGlowPosition.current.y;
      
      currentGlowPosition.current.x += dx * 0.1;
      currentGlowPosition.current.y += dy * 0.1;

      if (heroRef.current) {
        heroRef.current.style.setProperty('--mouse-x', `${currentGlowPosition.current.x}px`);
        heroRef.current.style.setProperty('--mouse-y', `${currentGlowPosition.current.y}px`);
      }

      rafId.current = requestAnimationFrame(updateGlowPosition);
    };

    rafId.current = requestAnimationFrame(updateGlowPosition);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);


  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/public/metrics');
        if (res.data && res.data.success) {
          setMetricsCount(res.data.count.toString());
        }
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section ref={heroRef} onMouseMove={handleMouseMove} className="relative overflow-hidden pt-20 pb-32 bg-slate-50 dark:bg-slate-950 group">
        
        {/* Animated Particle Network Background (Idea 2) */}
        {/* Animated Grid & Glow Background (Idea 3) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle Grid Pattern */}
          <motion.div 
            animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(42, 157, 143, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 157, 143, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
            }}
          />
          

          {/* Interactive Mouse Glow & Highlighted Grid (Hidden on Mobile/Reduced Motion) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden sm:block motion-reduce:hidden z-0 pointer-events-none">
            {/* Soft Radial Glow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle 350px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(42, 157, 143, 0.15), transparent 80%)'
              }}
            />
            {/* Highlighted Neon Grid */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(42, 157, 143, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 157, 143, 0.6) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Central Breathing Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4]
            }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ 
              width: '800px', 
              height: '500px', 
              borderRadius: '50%',
              backgroundColor: 'rgba(42, 157, 143, 0.25)', 
              filter: 'blur(100px)',
              transform: 'translateX(-50%) translateY(-30%)'
            }}
          />
          
          {/* Accent Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2]
            }} 
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/4 right-0"
            style={{ 
              width: '600px', 
              height: '600px', 
              borderRadius: '50%',
              backgroundColor: 'rgba(102, 126, 234, 0.15)', 
              filter: 'blur(120px)'
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Verify Every Product. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
              Trust Every Purchase.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto"
          >
            The modern product authentication platform powered by the Stellar blockchain. Ensure authenticity and eliminate counterfeits instantly.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/verify" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">Start Verifying</Button>
            </Link>
            <Link to="/register" state={{ role: 'manufacturer' }} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">Register as Manufacturer</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: metricsCount, label: "Products Secured" },
              { value: "500+", label: "Manufacturers" },
              { value: "100%", label: "Blockchain Verification" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-slate-500 dark:text-slate-400 font-medium text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <SectionTitle 
            center 
            title="Enterprise-Grade Authentication" 
            subtitle="Built on the Stellar blockchain, providing immutable and transparent verification for every product." 
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaShieldAlt size={32} />, title: "Blockchain Security", desc: "Every product registration is hashed and stored on the Stellar network, making tampering mathematically impossible." },
              { icon: <FaQrcode size={32} />, title: "Instant QR Scanning", desc: "Customers can verify product authenticity instantly by scanning the unique secure QR code with any smartphone." },
              { icon: <FaChartLine size={32} />, title: "Powerful Analytics", desc: "Track scan locations, spot counterfeit hotspots, and understand customer engagement through the manufacturer dashboard." }
            ].map((feat, idx) => (
              <Card key={idx} hover className="p-8">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-slate-800 dark:to-indigo-900 rounded-3xl flex items-center justify-center p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="w-64 h-64 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-6 flex flex-col items-center justify-center z-10 border border-slate-100 dark:border-slate-700">
                   <FaQrcode size={100} className="text-primary mb-4" />
                   <div className="h-4 w-32 bg-green-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        whileInView={{ width: '100%' }} 
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-success" 
                      />
                   </div>
                   <p className="mt-2 text-sm font-bold text-success">Verified Genuine</p>
                </div>
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <SectionTitle 
                title="How TrueTrace Works" 
                subtitle="A seamless experience from manufacturing floor to customer hands." 
              />
              <div className="space-y-6">
                {[
                  { step: "01", title: "Manufacturer Registers Product", desc: "A unique identifier is generated and a cryptographic hash is recorded on the Stellar blockchain." },
                  { step: "02", title: "QR Code is Applied", desc: "The TrueTrace QR code is printed onto the product packaging or label during manufacturing." },
                  { step: "03", title: "Customer Scans", desc: "Anyone can scan the QR code to fetch the immutable record from the blockchain and verify authenticity instantly." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <SectionTitle center title="Frequently Asked Questions" />
          <div className="space-y-4">
            {[
              { q: "How is it different from normal QR codes?", a: "Unlike standard QR codes which can be easily duplicated, TrueTrace links the scan directly to an immutable transaction hash on the Stellar blockchain, ensuring the product's origin cannot be faked." },
              { q: "Do customers need an app to scan?", a: "No. Customers can use their native iOS or Android camera to scan the code, which will open a secure TrueTrace verification page in their default browser." },
              { q: "What happens if a product is reported as counterfeit?", a: "If multiple users report an issue or scan a single code from widely different geographic locations simultaneously, the dashboard flags the product and can automatically invalidate it." }
            ].map((faq, idx) => (
              <FAQItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to protect your brand?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join hundreds of manufacturers using TrueTrace to secure their supply chain and build unshakeable trust with customers.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-slate-100">Create Free Account</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
      >
        <span className="font-semibold text-lg text-slate-900 dark:text-white">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-400">
          <FaChevronDown />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 text-slate-600 dark:text-slate-400"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default LandingPage;
