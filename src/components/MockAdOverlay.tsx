import React, { useState, useEffect } from 'react';
import { X, Play, Volume2, ShieldAlert, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function MockAdOverlay() {
  const { adState, closeAd } = useStore();
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    if (!adState) return;

    setSecondsLeft(adState.type === 'rewarded' ? 7 : 5);
    setVideoProgress(0);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adState]);

  // Video progress animation for rewarded ads
  useEffect(() => {
    if (!adState || adState.type !== 'rewarded' || secondsLeft === 0) return;

    const totalDuration = 7000; // 7 seconds
    const intervalTime = 50;
    const increment = (intervalTime / totalDuration) * 100;

    const progressTimer = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(progressTimer);
  }, [adState, secondsLeft]);

  if (!adState || !adState.type) return null;

  const handleClose = () => {
    if (secondsLeft > 0) return; // Cannot close early

    // If it was rewarded, execute the reward callback first
    if (adState.type === 'rewarded' && adState.onReward) {
      adState.onReward();
    }

    closeAd();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-lg relative bg-zinc-950/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Top Header info */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 text-[10px] text-zinc-400 font-bold px-2 py-0.5 rounded tracking-wider uppercase">
              Advertisement
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Sponsor Ad
            </span>
          </div>

          {secondsLeft > 0 ? (
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
              {adState.type === 'rewarded' ? 'Reward in' : 'Skip in'} {secondsLeft}s
            </span>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors rounded-lg text-xs font-black cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              Close Ad <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content Pane */}
        <div className="flex-1 flex flex-col p-6 min-h-[300px] justify-between relative">
          
          {/* Ad Content */}
          {adState.type === 'interstitial' ? (
            /* Interstitial App Promo */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                <Sparkles className="w-8 h-8 text-zinc-950 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  FitLife Pro AI
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  The ultimate companion app for automated workouts. Syncs seamlessly with NutriTrack AI to cross-reference your calories and physical activity dynamically.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-amber-500">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} className="text-base">★</span>
                ))}
                <span className="text-[10px] text-zinc-400 font-bold ml-1">4.9 (48k Reviews)</span>
              </div>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/15 hover:scale-[1.02] transition-all"
              >
                INSTALL FREE APP
              </a>
            </div>
          ) : (
            /* Rewarded Video Simulator */
            <div className="flex-1 flex flex-col justify-between space-y-6">
              
              {/* Simulated Video Player */}
              <div className="flex-1 aspect-video rounded-2xl bg-zinc-900 border border-zinc-850 relative overflow-hidden flex flex-col items-center justify-center">
                
                {/* SVG/CSS Animation mimicking video loading */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center mb-3">
                    <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-zinc-300">Google AdMob Video Stream</p>
                  <p className="text-[9px] text-zinc-500 tracking-wide mt-1">Simulating native video render</p>
                </div>

                {/* Progress bar overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>

                {/* Sound control indicator */}
                <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-lg text-zinc-400">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bottom text info */}
              <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">REWARD DETAILS</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Unlocks 3 additional AI Coach Queries</p>
                  </div>
                </div>

                {secondsLeft > 0 ? (
                  <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Watch full video
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reward Unlocked!
                  </span>
                )}
              </div>

            </div>
          )}

        </div>
        
        {/* Footer legal text */}
        <div className="bg-zinc-950/80 px-6 py-3 border-t border-zinc-900 text-center text-[8px] text-zinc-650 font-medium">
          Simulated Ad console endpoint. Real deployment connects to Google Partner Network via AdMob SDK.
        </div>

      </div>
    </div>
  );
}
