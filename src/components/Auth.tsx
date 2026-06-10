'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Mail, Lock, Globe, Apple, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
  const loginUser = useStore((state) => state.loginUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    if (isSignUp && !isOtpSent) {
      setIsOtpSent(true);
      setLoading(false);
      return;
    }

    await loginUser(email);
    setLoading(false);
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loginUser(`${provider.toLowerCase()}@nutritrack.ai`, true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-zinc-950 to-black relative overflow-hidden">
      {/* Background glowing shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
          {/* Logo header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
              <Sparkles className="w-6 h-6 text-zinc-950" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              NutriTrack <span className="text-emerald-400">AI</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5">
              Your Premium AI Nutrition & Calorie Assistant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isOtpSent ? (
              <>
                {/* Email input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Password
                    </label>
                    {!isSignUp && (
                      <button type="button" className="text-[10px] font-semibold text-emerald-400 hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* OTP verification state */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 px-4 text-center font-mono text-lg tracking-widest text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 mt-2 text-center">
                    A mock code was sent to <strong className="text-zinc-300">{email}</strong>. Enter any 6 digits to verify.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : isOtpSent ? (
                <>Verify & Log In <ShieldCheck className="w-4 h-4" /></>
              ) : (
                <>{isSignUp ? 'Send OTP' : 'Sign In'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-zinc-900/80" />
            <span className="relative bg-zinc-950 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Or Continue With
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 py-3 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-400" /> Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              disabled={loading}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 py-3 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Apple className="w-4 h-4 text-white" /> Apple
            </button>
          </div>

          {/* Footer toggle */}
          <div className="mt-8 text-center border-t border-zinc-900/80 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsOtpSent(false);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors font-medium"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-emerald-400 font-bold underline">Sign In</span></>
              ) : (
                <>New to NutriTrack AI? <span className="text-emerald-400 font-bold underline">Create Account</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
