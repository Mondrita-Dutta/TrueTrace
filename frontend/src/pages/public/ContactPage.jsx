import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SectionTitle from '../../components/ui/SectionTitle';

const ContactPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = (data) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <SectionTitle 
          title="Get in Touch" 
          subtitle="Have questions about TrueTrace? Our team is here to help you secure your supply chain." 
          center 
        />
        
        <div className="flex flex-col md:flex-row gap-12 mt-12">
          {/* Contact Info */}
          <div className="w-full md:w-1/3 space-y-8">
            <Card className="p-6 bg-primary text-white shadow-xl shadow-blue-500/20 border-none">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-4 text-blue-200" size={20} />
                  <p>123 Innovation Drive<br />Tech District<br />San Francisco, CA 94103</p>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-4 text-blue-200" size={20} />
                  <p>hello@truetrace.io</p>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-4 text-blue-200" size={20} />
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
            </Card>

            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400">
              [ Google Map Placeholder ]
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full md:w-2/3">
            <Card className="p-8 md:p-10">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">We'll get back to you as soon as possible.</p>
                  <Button onClick={() => setIsSuccess(false)} variant="outline">Send Another</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="First Name" 
                      id="firstName" 
                      {...register('firstName', { required: 'Required' })}
                      error={errors.firstName?.message}
                    />
                    <Input 
                      label="Last Name" 
                      id="lastName" 
                      {...register('lastName', { required: 'Required' })}
                      error={errors.lastName?.message}
                    />
                  </div>
                  <Input 
                    label="Email Address" 
                    type="email"
                    id="email" 
                    {...register('email', { required: 'Required' })}
                    error={errors.email?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                    <select 
                      className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      {...register('subject')}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="support">Technical Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                    <textarea 
                      rows={5}
                      className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 resize-none"
                      placeholder="How can we help?"
                      {...register('message', { required: 'Please enter a message' })}
                    />
                    {errors.message && <p className="mt-1 text-sm text-danger animate-pulse">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" isLoading={isLoading}>Send Message</Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
