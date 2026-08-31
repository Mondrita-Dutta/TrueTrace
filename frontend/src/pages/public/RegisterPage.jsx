import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaBuilding, FaUser } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { connectFreighter } from '../../utils/freighterUtils';
import api from '../../services/api';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const location = useLocation();
  const { register: registerForm, handleSubmit, watch, formState: { errors }, trigger, getValues } = useForm();
  const [role, setRole] = useState(location.state?.role || 'customer'); // 'customer' or 'manufacturer'
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register, loginWithWallet } = useAuth();
  const navigate = useNavigate();
  const password = watch("password", "");

  const handleConnectWallet = async () => {
    setIsWalletLoading(true);
    setApiError('');
    try {
      const address = await connectFreighter();
      if (address) {
        setWalletAddress(address);
      }
    } catch (error) {
      setApiError(error.message || 'Failed to connect wallet');
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsWalletLoading(false);
    }
  };

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  
  const onSubmit = async (data) => {
    if (role === 'manufacturer' && !walletAddress) {
      setApiError('You must connect a wallet to register as a manufacturer');
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    try {
      // Step 1: Register User
      const fullData = { ...data, role, walletAddress: role === 'manufacturer' ? walletAddress : undefined };
      const res = await register(fullData);
      
      // Step 2: Redirect based on role
      if (res.data?.role === 'admin') navigate('/admin');
      else if (res.data?.role === 'manufacturer') navigate('/manufacturer');
      else navigate('/');
    } catch (error) {
      setApiError(error.message || 'Registration failed');
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create your account</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Join TrueTrace to authenticate and protect products.</p>
        </div>

        <Card className="p-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              type="button"
              onClick={() => setRole('customer')}
              className={cn("flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all", 
                role === 'customer' 
                ? "border-primary bg-blue-50 dark:bg-blue-900/20 text-primary" 
                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <FaUser size={24} className="mb-2" />
              <span className="font-semibold">Customer</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole('manufacturer')}
              className={cn("flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all", 
                role === 'manufacturer' 
                ? "border-primary bg-blue-50 dark:bg-blue-900/20 text-primary" 
                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <FaBuilding size={24} className="mb-2" />
              <span className="font-semibold">Manufacturer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="First Name" 
                id="firstName" 
                placeholder="John"
                {...registerForm('firstName', { required: 'Required' })}
                error={errors.firstName?.message}
              />
              <Input 
                label="Last Name" 
                id="lastName" 
                placeholder="Doe"
                {...registerForm('lastName', { required: 'Required' })}
                error={errors.lastName?.message}
              />
            </div>
            
            {role === 'manufacturer' && (
              <>
                <Input 
                  label="Company Name" 
                  id="companyName" 
                  placeholder="Acme Corp"
                  {...registerForm('companyName', { required: 'Company name is required for manufacturers' })}
                  error={errors.companyName?.message}
                />
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Blockchain Wallet Connection</h4>
                  {walletAddress ? (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="font-mono text-sm text-primary tracking-wider">{walletAddress.substring(0, 8)}...{walletAddress.substring(48)}</span>
                      <button type="button" onClick={() => setWalletAddress('')} className="text-xs text-danger hover:underline font-medium">Change</button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleConnectWallet} isLoading={isWalletLoading}>
                      Connect Wallet
                    </Button>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Required for publishing product QR codes to the blockchain.</p>
                </div>
              </>
            )}

            <Input 
              label="Email Address" 
              id="email" 
              type="email" 
              placeholder="you@company.com"
              {...registerForm('email', { 
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
              })}
              error={errors.email?.message}
            />
            
            <div>
              <Input 
                label="Password" 
                id="password" 
                type="password" 
                placeholder="••••••••"
                {...registerForm('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Must be at least 8 characters' }
                })}
                error={errors.password?.message}
              />
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-3 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn("h-1 w-full rounded-full transition-colors", 
                        i < strength 
                        ? (strength < 3 ? "bg-warning" : strength < 4 ? "bg-blue-400" : "bg-success") 
                        : "bg-slate-200 dark:bg-slate-700"
                      )} 
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start mt-4">
              <input 
                type="checkbox" 
                id="terms"
                {...registerForm('terms', { required: 'You must accept the terms' })}
                className="mt-1 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900" 
              />
              <label htmlFor="terms" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                I agree to the <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-danger text-xs">{errors.terms.message}</p>}
            
            {apiError && <p className="text-danger text-sm text-center font-medium">{apiError}</p>}

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

        </Card>

        <p className="text-center mt-8 text-slate-600 dark:text-slate-400 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
