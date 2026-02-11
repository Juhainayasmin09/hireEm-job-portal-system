import React, { useState } from 'react';
import { Button } from './Button';
import { storage } from '../services/storage';
import { UserProfile } from '../types';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SEEKER' as 'SEEKER' | 'RECRUITER'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isLogin) {
        const user = storage.login(formData.email, formData.password);
        onLogin(user);
      } else {
        const user = storage.signup({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          skills: [],
          experience: '',
          bio: ''
        });
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-inter bg-bg">
      {/* Left Panel - Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-primary-hover opacity-100 z-0"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white max-w-lg text-center lg:text-left">
           <div className="mb-10 flex flex-col items-center lg:items-start">
             <div className="bg-surface rounded-3xl p-8 inline-block mb-8 shadow-2xl">
                <Logo variant="icon" className="h-40 w-40" />
             </div>
             <div className="flex items-center gap-1 mb-6">
                <span className="text-6xl font-bold tracking-tight text-white">Hire</span>
                <span className="text-6xl font-bold tracking-tight text-accent">Em</span>
             </div>
             <p className="text-xl text-slate-300 font-light leading-relaxed text-center lg:text-left">
               Connecting talent with opportunity through intelligent design.
             </p>
           </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface px-8 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center lg:text-left">
             <div className="lg:hidden flex justify-center mb-6">
                 <Logo variant="full" className="h-24 w-auto" />
             </div>
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 text-text-secondary">
              {isLogin ? 'Enter your details to access your account.' : 'Join thousands of professionals growing their careers.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                 <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 {error}
              </div>
            )}

            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-input-border rounded-xl focus:ring-2 focus:ring-focus focus:border-focus outline-none transition-all bg-input-bg text-text-primary"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-input-border rounded-xl focus:ring-2 focus:ring-focus focus:border-focus outline-none transition-all bg-input-bg text-text-primary"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-input-border rounded-xl focus:ring-2 focus:ring-focus focus:border-focus outline-none transition-all bg-input-bg text-text-primary"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-text-primary mb-3">I want to...</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({ ...formData, role: 'SEEKER' })}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${formData.role === 'SEEKER' ? 'border-primary bg-primary/10' : 'border-border hover:border-input-border'}`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${formData.role === 'SEEKER' ? 'bg-primary text-white' : 'bg-bg text-text-muted'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className={`text-sm font-semibold ${formData.role === 'SEEKER' ? 'text-primary' : 'text-text-secondary'}`}>Find a Job</span>
                  </div>
                  
                  <div 
                    onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${formData.role === 'RECRUITER' ? 'border-primary bg-primary/10' : 'border-border hover:border-input-border'}`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${formData.role === 'RECRUITER' ? 'bg-primary text-white' : 'bg-bg text-text-muted'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <span className={`text-sm font-semibold ${formData.role === 'RECRUITER' ? 'text-primary' : 'text-text-secondary'}`}>Post Jobs</span>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-primary/20" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-text-secondary text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-accent hover:text-primary font-semibold transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};