'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Send, Mic, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { showRewardedAd } from '../lib/admob';

export default function AICoach() {
  const { chatMessages, sendChatMessage, profile, goals, aiCredits, addCredits } = useStore();
  const [inputText, setInputText] = useState('');
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!profile || !goals) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loadingCoach) return;
    setInputText('');
    setLoadingCoach(true);
    try {
      await sendChatMessage(textToSend);
    } catch (e) {
      console.error(e);
    }
    setLoadingCoach(false);
  };

  const handleWatchAd = async () => {
    setAdLoading(true);
    await showRewardedAd(
      (amount) => {
        addCredits(amount);
      },
      () => {
        setAdLoading(false);
      }
    );
  };

  const suggestionChips = [
    { label: "Increase daily protein", text: "What are the best foods to increase my daily protein intake?" },
    { label: "Post-workout snack", text: "Suggest some quick post-workout meals for recovery." },
    { label: "200 calorie snacks", text: "Give me ideas for healthy snacks around 200 calories." },
    { label: "Weight loss tips", text: "What are some sustainable tips to speed up my weight loss goal?" },
    { label: "Diabetic friendly diet", text: "What modifications should I make for a diabetic friendly diet?" }
  ];

  return (
    <div className="glass-card rounded-2xl flex flex-col h-[calc(100vh-160px)] min-h-[500px] overflow-hidden relative">
      <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Coach Header */}
      <div className="p-4 border-b border-zinc-900/80 flex items-center justify-between bg-zinc-950/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">AI Nutrition Coach</h2>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Online • Ready to help
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-550/10 border border-emerald-500/20 py-1.5 px-3 rounded-lg text-xs font-black text-emerald-400">
            {profile.role === 'admin' || profile.role === 'super_admin' ? (
              <span>Credits: Unlimited</span>
            ) : (
              <span>Credits: {aiCredits} left</span>
            )}
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Recommended Calorie Budget</span>
            <span className="text-xs font-black text-white">{goals.recommendedCalories} kcal / day</span>
          </div>
        </div>
      </div>

      {/* Messages Scrolling Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-none">
        
        {/* Suggestion Chips */}
        {chatMessages.length === 1 && (
          <div className="space-y-2.5 pb-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Suggested Questions</span>
            <div className="flex flex-wrap gap-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  className="bg-zinc-900/60 border border-zinc-850 hover:border-emerald-500/30 hover:bg-zinc-900 py-2 px-3.5 rounded-full text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isUser 
                  ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/10' 
                  : 'bg-zinc-900/70 border border-zinc-850/80 text-zinc-200'
              }`}>
                {/* Format paragraphs */}
                {msg.text.split('\n\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {para.split('\n').map((line, j) => (
                      <span key={j} className={j > 0 ? 'block mt-1' : ''}>
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
                
                <span className={`text-[9px] block mt-2.5 ${isUser ? 'text-zinc-950/70' : 'text-zinc-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {loadingCoach && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-900/70 border border-zinc-850 p-4 rounded-2xl flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Chat Send Input Form / Ad Unlock */}
      <div className="p-6 border-t border-zinc-900/80 bg-zinc-950/60 backdrop-blur-md relative z-10">
        {aiCredits <= 0 && profile.role !== 'admin' && profile.role !== 'super_admin' ? (
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Coach Limit Reached</h4>
              <p className="text-xs text-zinc-400">Watch a short video sponsor ad to get 3 more questions instantly!</p>
            </div>
            
            <button
              onClick={handleWatchAd}
              disabled={adLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {adLoading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Watch Video Ad to Unlock (+3 Credits) <Sparkles className="w-3.5 h-3.5 fill-zinc-950" /></>
              )}
            </button>
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask coach anything... (e.g. Can I eat paneer for dinner?)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loadingCoach}
              className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={loadingCoach || !inputText.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 p-3 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-[9px] text-zinc-600 mt-2 text-center">
          NutriTrack AI Coach provides diet support, not medical advice. Verify critical health plans with professionals.
        </div>
      </div>
    </div>
  );
}
