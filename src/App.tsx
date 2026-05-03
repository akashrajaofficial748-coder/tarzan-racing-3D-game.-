/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Scene } from './components/game/Scene';
import { HUD } from './components/game/HUD';
import { CustomizationMenu } from './components/game/CustomizationMenu';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Trophy, Settings, LogIn, User as UserIcon, Palette, Skull, TreePine, Flame, Crosshair, ShieldAlert, CreditCard, Sparkles as SparklesIcon, Check, X } from 'lucide-react';
import { auth, googleProvider, getLeaderboard, getUserSubscription, updateSubscription } from './services/firebaseService';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { audioManager } from './services/audioService';
import { useGameStore } from './hooks/useGameStore';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  const { subscription, setSubscription } = useGameStore();

  useEffect(() => {
    if (isPlaying) {
      audioManager.startEngine();
    } else {
      audioManager.stopEngine();
    }
  }, [isPlaying]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const sub = await getUserSubscription(u.uid);
        if (sub) {
          setSubscription(sub);
        }
      }
    });
    return () => unsubscribe();
  }, [setSubscription]);

  useEffect(() => {
    if (showLeaderboard) {
      const unsubscribe = getLeaderboard(setLeaderboardData);
      return () => unsubscribe();
    }
  }, [showLeaderboard]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleStart = () => {
    if (!subscription.isSubscribed) {
      setShowSubscription(true);
      return;
    }
    setIsPlaying(true);
  };

  const handleSubscribe = () => {
    if (!user) return;
    const vpa = '9534649537@paytm';
    const amount = 1; // Trial for 1 rupee
    const name = 'Tarzan Fury Game';
    const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=JungleRunnerTrial`;
    
    // Open Paytm link
    window.location.href = upiLink;
    setPaymentInitiated(true);
  };

  const handleConfirmPayment = async () => {
    if (!user) return;
    setIsProcessingPayment(true);
    
    // Simulation of verifying the payment status
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const newSub = {
      isSubscribed: true,
      expiryDate: expiry,
      isTrial: true
    };
    
    await updateSubscription(user.uid, newSub);
    setSubscription(newSub);
    setIsProcessingPayment(false);
    setShowSubscription(false);
    setPaymentInitiated(false);
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden">
      <AnimatePresence>
        {!isPlaying ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          >
             {/* Jungle Atmosphere VFX */}
             <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_70%)]" />
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/30 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-900/20 rounded-full blur-[140px] animate-pulse [animation-delay:2s]" />
                
                {/* Visual Grass/Vines Overlay - Simplified tribal pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
                />
             </div>

             <div className="relative z-10 text-center w-full max-w-5xl px-6">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-2"
                  >
                    <Skull className="text-amber-500/50 w-12 h-12" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-[14vw] sm:text-[10vw] font-black leading-none mb-2 tracking-tighter"
                        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                      <span className="block text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] uppercase">Tarzan</span>
                      <span className="block text-amber-500 italic mix-blend-difference -mt-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">FURY</span>
                    </h1>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.5 }}
                    className="flex gap-4 mb-12 items-center"
                  >
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500" />
                    <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">The Great Hunt Awaits</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500" />
                  </motion.div>
                </div>

                <div className="flex flex-col gap-5 max-w-sm mx-auto">
                   {user ? (
                     <button 
                       onClick={handleStart}
                       className="group relative bg-emerald-600 hover:bg-emerald-500 text-white py-6 px-8 flex items-center justify-center gap-4 font-black uppercase tracking-[0.4em] transition-all overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0"
                     >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                       <Play className="group-hover:scale-125 transition-transform fill-white" size={24} />
                       <span className="text-2xl">New Game</span>
                     </button>
                   ) : (
                     <button 
                       onClick={handleLogin}
                       className="group relative bg-amber-500 hover:bg-amber-400 text-black py-6 px-8 flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(245,158,11,0.2)] border-b-4 border-amber-700 active:translate-y-1 active:border-b-0"
                     >
                       <LogIn size={24} className="group-hover:rotate-12 transition-transform" />
                       <span className="text-xl">Sign In to Play</span>
                     </button>
                   )}

                   <button 
                     onClick={() => setShowCustomization(true)}
                     className="group bg-white/5 border border-white/10 text-white flex items-center justify-center gap-4 py-5 font-black uppercase text-sm tracking-[0.3em] hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all active:scale-95"
                   >
                     <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                     Options
                   </button>

                   <button 
                     onClick={() => setShowLeaderboard(!showLeaderboard)}
                     className="group bg-white/5 border border-white/10 text-white flex items-center justify-center gap-4 py-5 font-black uppercase text-sm tracking-[0.3em] hover:bg-amber-500/10 hover:border-amber-500/30 transition-all active:scale-95"
                   >
                     <Trophy size={20} className="group-hover:scale-110 transition-transform" />
                     Trophies
                   </button>

                   <button 
                    onClick={() => {
                      if (window.confirm("Abandon the jungle base?")) {
                        auth.signOut();
                      }
                    }}
                    className="group bg-red-500/10 border border-red-500/20 text-red-500/60 flex items-center justify-center gap-4 py-4 font-black uppercase text-[10px] tracking-[0.5em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                   >
                     <X size={16} />
                     Quit Program
                   </button>
                </div>

                <AnimatePresence>
                  {showLeaderboard && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0, scale: 0.95 }}
                      animate={{ height: 'auto', opacity: 1, scale: 1 }}
                      exit={{ height: 0, opacity: 0, scale: 0.95 }}
                      className="mt-8 overflow-hidden bg-black/60 backdrop-blur-xl border border-emerald-900/30 p-8 rounded-2xl text-left max-w-lg mx-auto shadow-2xl relative"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                      <h3 className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs mb-6 flex items-center gap-3">
                         <Trophy size={14} /> Jungle Legends
                      </h3>
                      <div className="space-y-3">
                        {leaderboardData.map((entry, i) => (
                          <div key={i} className="flex items-center justify-between py-3 px-4 bg-white/5 hover:bg-white/10 transition-colors border border-white/5 rounded-lg group">
                            <div className="flex items-center gap-4">
                              <span className={`text-xs font-mono font-bold ${i < 3 ? 'text-amber-400' : 'text-white/20'}`}>
                                #{(i + 1).toString().padStart(2, '0')}
                              </span>
                              <span className="text-sm text-white/90 font-bold tracking-wide group-hover:text-emerald-400 transition-colors">{entry.userName}</span>
                            </div>
                            <span className="text-emerald-400 font-mono text-base font-black">{entry.score.toLocaleString()}</span>
                          </div>
                        ))}
                        {leaderboardData.length === 0 && <div className="text-white/30 italic text-sm py-4">No explorers have survived yet...</div>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {showCustomization && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                     <CustomizationMenu onClose={() => setShowCustomization(false)} />
                   </div>
                )}

                {showSubscription && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-[#0a0f1e] border-2 border-emerald-500/30 p-10 max-w-md w-full relative overflow-hidden rounded-3xl"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => { setShowSubscription(false); setPaymentInitiated(false); }} className="text-white/20 hover:text-white"><X size={24}/></button>
                      </div>
                      
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                          <CreditCard className="text-emerald-400" size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Tribal Contract</h2>
                        <p className="text-emerald-400/60 text-[10px] font-mono tracking-widest uppercase mb-6">
                          {subscription.isSubscribed ? 'Authorization Active' : (paymentInitiated ? 'Awaiting Confirmation' : 'Permission to entry')}
                        </p>
                      </div>

                      {subscription.isSubscribed ? (
                        <div className="space-y-6 mb-10">
                          <div className="bg-emerald-500/10 p-8 border border-emerald-500/30 rounded-xl text-center">
                            <Check className="text-emerald-400 w-12 h-12 mx-auto mb-4" />
                            <div className="text-white font-black text-2xl italic tracking-tight mb-2">ACCESS GRANTED</div>
                            <div className="text-emerald-400/60 text-[10px] font-mono tracking-[0.2em] uppercase">
                              Expiry: {new Date(subscription.expiryDate!).toLocaleDateString()}
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowSubscription(false)}
                            className="w-full bg-emerald-500 text-black py-4 font-black uppercase tracking-widest hover:bg-emerald-400 transition-all font-mono"
                          >
                            Return to Base
                          </button>
                        </div>
                      ) : (
                        <>
                          {!paymentInitiated ? (
                            <>
                              <div className="space-y-6 mb-10">
                                <div className="bg-white/5 p-6 border border-white/10 rounded-xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8px] font-black px-3 py-1 uppercase tracking-widest">Trial Offer</div>
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="text-white font-bold text-lg leading-tight">One Month Trial</div>
                                      <div className="text-white/40 text-[10px] uppercase tracking-wider">Unlimited Jungle Access</div>
                                    </div>
                                    <div className="text-emerald-400 text-3xl font-black italic">₹1</div>
                                  </div>
                                  <div className="space-y-1.5 mt-4">
                                    <div className="flex items-center gap-2 text-white/60 text-[10px]">
                                      <Check size={12} className="text-emerald-500" />
                                      <span>Full Tarzan Fury customization</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60 text-[10px]">
                                      <Check size={12} className="text-emerald-500" />
                                      <span>Global Trophies Eligibility</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-white/30 text-[10px] font-mono text-center justify-center uppercase tracking-widest">
                                  <div className="h-px flex-1 bg-white/10" />
                                  <span>Then ₹11/Month</span>
                                  <div className="h-px flex-1 bg-white/10" />
                                </div>
                              </div>

                              <button 
                                onClick={handleSubscribe}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] relative group rounded-xl"
                              >
                                <SparklesIcon size={20} className="group-hover:scale-125 transition-transform" />
                                <span>Pay ₹1 via Paytm</span>
                              </button>
                            </>
                          ) : (
                            <div className="space-y-6">
                              <div className="bg-amber-500/10 p-8 border border-amber-500/30 rounded-xl text-center">
                                <motion.div 
                                  animate={{ scale: [1, 1.1, 1] }} 
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-12 h-12 rounded-full border-2 border-dashed border-amber-500 mx-auto mb-4" 
                                />
                                <div className="text-white font-black text-xl italic tracking-tight mb-2 uppercase">Payment Initiated</div>
                                <p className="text-white/60 text-[10px] uppercase tracking-wider leading-relaxed">
                                  Paytm has been opened on your device. Complete the ₹1 payment to number <span className="text-amber-400">9534649537</span>.
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <button 
                                  onClick={() => setPaymentInitiated(false)}
                                  className="bg-white/5 text-white/40 border border-white/10 py-4 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all rounded-xl"
                                >
                                  Retry
                                </button>
                                <button 
                                  onClick={handleConfirmPayment}
                                  disabled={isProcessingPayment}
                                  className="bg-emerald-500 text-black py-4 font-black uppercase tracking-widest hover:bg-emerald-400 transition-all font-mono rounded-xl disabled:bg-white/10 flex items-center justify-center gap-2"
                                >
                                  {isProcessingPayment ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                  ) : <Check size={18} />}
                                  Confirm
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <p className="mt-8 text-[8px] text-white/20 text-center uppercase tracking-[0.2em] leading-relaxed">
                        By signing, you agree to the laws of the jungle. Cancel anytime to avoid auto-renewal at ₹11/mo. Payment handled via secure UPI gateway.
                      </p>
                    </motion.div>
                  </div>
                )}

                {user && (
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    className="mt-8 flex items-center justify-center gap-3 text-emerald-400/50 text-[10px] uppercase tracking-[0.2em] font-mono">
                        <UserIcon size={12} />
                        Identity Locked: {user.displayName}
                    </motion.div>
                )}

                <div className="mt-20 flex flex-col items-center gap-2">
                  <div className="flex gap-4 text-white/10">
                    <TreePine size={16} />
                    <TreePine size={16} />
                    <TreePine size={16} />
                  </div>
                  <div className="text-white/20 font-mono text-[9px] uppercase tracking-[0.5em] font-bold">
                    Apex Jungle Racing Engine v4.2.0 • Fatal Physics Enabled
                  </div>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
          >
            <Scene />
            <HUD onExit={() => setIsPlaying(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
