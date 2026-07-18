import React from 'react';
import { motion } from 'framer-motion';
import { FaLink, FaMobileAlt, FaChartPie, FaBell, FaLock, FaDesktop } from 'react-icons/fa';
import SectionTitle from '../../components/ui/SectionTitle';

const FeaturesPage = () => {
  const features = [
    {
      icon: <FaLink />,
      title: "Blockchain Verification",
      desc: "Every product registration is cryptographically signed and stored on the Stellar blockchain, ensuring an immutable and public record of authenticity."
    },
    {
      icon: <FaMobileAlt />,
      title: "QR Authentication",
      desc: "Unique, secure QR codes are generated for every product. Customers can scan them instantly with any mobile device to verify the product's origin."
    },
    {
      icon: <FaDesktop />,
      title: "Manufacturer Dashboard",
      desc: "A powerful, intuitive dashboard for manufacturers to manage product lines, generate bulk QR codes, and monitor global scan analytics."
    },
    {
      icon: <FaChartPie />,
      title: "Advanced Analytics",
      desc: "Visualize where and when your products are being scanned. Identify counterfeit hotspots in real-time through geographical heatmaps."
    },
    {
      icon: <FaBell />,
      title: "Instant Notifications",
      desc: "Receive automated email alerts for suspicious scan activities, counterfeit reports from customers, and registration confirmations."
    },
    {
      icon: <FaLock />,
      title: "Bank-Grade Security",
      desc: "Built with JWT authentication, bcrypt password hashing, and role-based access control to ensure your data and products remain secure."
    }
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Powerful Features" 
          subtitle="Everything you need to protect your brand, eliminate counterfeits, and build consumer trust." 
          center 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
