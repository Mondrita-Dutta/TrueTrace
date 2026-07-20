import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { connectFreighter } from '../../utils/freighterUtils';
import api from '../../services/api';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login, loginWithWallet } = useAuth();
  const navigate = useNavigate();

  const handleWalletLogin = async () => {
    setIsWalletLoading(true);
    setApiError('');
    try {
      const address = await connectFreighter();
      if (!address) throw new Error("Could not retrieve wallet address");

      const res = await loginWithWallet(address);
      
      if (res.data.role === 'admin' || res.data.role === 'superadmin') navigate('/admin');
      else if (res.data.role === 'manufacturer') navigate('/manufacturer');
      else navigate('/');
    } catch (error) {
      setApiError(error.message || 'Failed to login with wallet');
      toast.error(error.message || 'Wallet login failed');
    } finally {
      setIsWalletLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await login(data.email, data.password);
      if (res.data.role === 'admin' || res.data.role === 'superadmin') navigate('/admin');
      else if (res.data.role === 'manufacturer') navigate('/manufacturer');
      else navigate('/');
    } catch (error) {
      setApiError(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Log in to your TrueTrace account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              label="Email Address" 
              id="email" 
              type="email" 
              placeholder="you@company.com"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            
            <div>
              <Input 
                label="Password" 
                id="password" 
                type="password" 
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                error={errors.password?.message}
              />
              <div className="flex justify-between items-center mt-2">
                <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            {apiError && <p className="text-danger text-sm text-center font-medium">{apiError}</p>}

            <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleWalletLogin}
              isLoading={isWalletLoading}
              type="button"
            >
              <span>Login with Wallet</span>
            </Button>
          </div>
        </Card>

        <p className="text-center mt-8 text-slate-600 dark:text-slate-400 text-sm">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
