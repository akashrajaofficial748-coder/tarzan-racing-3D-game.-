import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../hooks/useGameStore';
import { Gauge, Map as MapIcon, Trophy, Zap, X, CheckCircle2, Pause, Play, Settings, LogOut } from 'lucide-react';
import { auth, syncUserProfile } from '../../services/firebaseService';
import { useEffect, useState } from 'react';
import { CustomizationMenu } from './CustomizationMenu';

export const HUD = ({ onExit }: { onExit: () => void }) => {
  const { speed, score, distance, health, isGameOver, resetGame, challenges, sessionTime, headlights, boost, skyboxType, isPaused, togglePause } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isGameOver && auth.currentUser) {
      syncUserProfile(auth.currentUser, score, distance);
    }
  }, [isGameOver, score, distance]);

  return (
    <div className="fixed inset-0 pointer-events-none p-8 font-mono z-50">
      {/* Top Left: Score & Distance */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-black/50 backdrop-blur-md border-l-4 border-cyan-400 p-4 w-64"
          >
            <div className="text-[10px] uppercase tracking-widest text-cyan-400 mb-1">Session Score</div>
            <div className="text-3xl font-bold text-white tracking-tighter">{score.toLocaleString()}</div>
          </motion.div>
          
          {/* Integrity Bar */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-black/50 backdrop-blur-md border-l-4 border-red-500 p-4 w-64"
          >
            <div className="text-[10px] uppercase tracking-widest text-red-500 mb-1 flex justify-between">
               <span>Hull Integrity</span>
               <span>{health}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 mt-1 overflow-hidden">
               <motion.div 
                 className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                 animate={{ width: `${health}%` }}
               />
            </div>
          </motion.div>

          {/* Boost Bar */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-black/50 backdrop-blur-md border-l-4 border-cyan-400 p-4 w-64 mt-2"
          >
            <div className={`text-[10px] uppercase tracking-widest mb-1 flex justify-between ${boost.isCooldown ? 'text-orange-500' : 'text-cyan-400'}`}>
               <span>Nitro Boost</span>
               <span>{boost.isCooldown ? 'Cooldown' : `${Math.floor(boost.amount)}%`}</span>
            </div>
            <div className="w-full h-2 bg-white/5 mt-1 overflow-hidden">
               <motion.div 
                 className={`h-full shadow-[0_0_10px_rgba(34,211,238,0.5)] ${boost.isCooldown ? 'bg-orange-500' : 'bg-cyan-400'}`}
                 animate={{ 
                   width: `${boost.amount}%`,
                   opacity: boost.isBoosting ? [1, 0.5, 1] : 1
                 }}
                 transition={boost.isBoosting ? { repeat: Infinity, duration: 0.2 } : {}}
               />
            </div>
          </motion.div>

          <div className="flex gap-4">
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-black/50 backdrop-blur-md border-l-4 border-white/30 p-4 w-48"
            >
              <div className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Distance</div>
              <div className="text-xl font-bold text-white">{distance.toFixed(1)} KM</div>
            </motion.div>

            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-black/50 backdrop-blur-md border-l-4 border-pink-500/50 p-4 w-48"
            >
              <div className="text-[10px] uppercase tracking-widest text-pink-400/70 mb-1">Mission Time</div>
              <div className="text-xl font-bold text-white tracking-tighter">
                {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toFixed(1).padStart(4, '0')}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Top Right: System Menu */}
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={togglePause}
            className="bg-white/10 hover:bg-cyan-400 hover:text-black p-2 text-white transition-colors border border-white/10"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button 
            onClick={() => { resetGame(); onExit(); }}
            className="bg-white/10 hover:bg-red-500/50 p-2 text-white transition-colors border border-white/10"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Bottom Left: Challenges */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2 max-w-xs">
        <div className="text-[10px] uppercase tracking-widest text-cyan-400 mb-2 font-black italic">Active Protocols</div>
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`flex items-center gap-3 p-3 border border-white/10 backdrop-blur-md ${challenge.isCompleted ? 'bg-cyan-400/20 border-cyan-400/50' : 'bg-black/40'}`}
          >
            {challenge.isCompleted ? (
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 flex items-center justify-center">
                 <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] font-bold uppercase truncate ${challenge.isCompleted ? 'text-cyan-400' : 'text-white/80'}`}>
                {challenge.description}
              </div>
              {!challenge.isCompleted && (
                <div className="w-full h-1 bg-white/5 mt-1 overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Right: Speedometer */}
      <div className="absolute bottom-8 right-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-48 h-48 flex items-center justify-center"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle
                cx="96" cy="96" r="88"
                className="stroke-white/10 fill-none"
                strokeWidth="4"
             />
             <motion.circle
                cx="96" cy="96" r="88"
                className="stroke-cyan-400 fill-none"
                strokeWidth="4"
                strokeDasharray="552.92"
                animate={{ strokeDashoffset: 552.92 * (1 - Math.min(speed / 200, 1)) }}
             />
          </svg>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-white">{Math.round(speed)}</div>
            <div className="text-[10px] uppercase text-cyan-400 font-bold">KM/H</div>
          </div>
        </motion.div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-40"
          >
            <div className="text-center w-full max-w-md">
              <motion.h2 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-6xl font-black italic text-white tracking-widest mb-12"
              >
                SYSTEM<br/>
                <span className="text-cyan-400 not-italic">PAUSED</span>
              </motion.h2>

              <div className="flex flex-col gap-4 px-12">
                <button 
                  onClick={togglePause}
                  className="bg-white text-black py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-cyan-400 transition-all group"
                >
                  <Play size={20} className="fill-black group-hover:scale-110 transition-transform" />
                  Resume Mission
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="bg-white/10 border border-white/20 text-white py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  <Settings size={20} />
                  Adjust Systems
                </button>
                <button 
                  onClick={() => { resetGame(); onExit(); }}
                  className="border border-red-500/50 text-red-500 py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={20} />
                  Abort Mission
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showSettings && (
          <div className="pointer-events-auto z-[60] absolute inset-0 bg-black/80 flex items-center justify-center p-8">
            <CustomizationMenu onClose={() => setShowSettings(false)} />
          </div>
        )}

        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center pointer-events-auto z-[100]"
          >
            <div className="w-full max-w-4xl p-12 relative">
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </div>

              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`text-7xl font-black italic tracking-tighter mb-2 ${health <= 0 ? 'text-red-500' : 'text-emerald-400'}`}
                >
                  {health <= 0 ? 'MISSION FAILED' : 'MISSION COMPLETE'}
                </motion.h1>
                <div className="text-white/30 font-mono text-xs tracking-[0.5em] uppercase">Post-Race Telemetry Analysis</div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { label: "Final Score", value: score.toLocaleString(), color: "emerald" },
                  { label: "Top Speed", value: `${Math.round(useGameStore.getState().stats.topSpeed)} KM/H`, color: "amber" },
                  { label: "Avg Speed", value: `${Math.round(useGameStore.getState().stats.totalSpeedSum / Math.max(1, useGameStore.getState().stats.speedSamples))} KM/H`, color: "cyan" },
                  { label: "Nitro Burn", value: `${useGameStore.getState().stats.nitroTime.toFixed(1)}s`, color: "pink" },
                  { label: "Near Misses", value: useGameStore.getState().stats.nearMisses, color: "orange" },
                  { label: "Total Distance", value: `${distance.toFixed(2)} KM`, color: "blue" },
                  { label: "Mission Time", value: `${Math.floor(sessionTime / 60)}:0${(sessionTime % 60).toFixed(1)}`.replace(':06', ':6'), color: "white" }, // Simple time format
                  { label: "Hull Status", value: `${health}%`, color: "red" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-lg relative group overflow-hidden"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">{stat.label}</div>
                    <div className={`text-2xl font-black text-white`}>{stat.value}</div>
                    <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color}-500/50 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`} />
                  </motion.div>
                ))}
              </div>

              {/* Challenge Status Summary */}
              <div className="mb-12">
                <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-bold">Challenge Briefing</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenges.map((c, i) => (
                    <motion.div 
                      key={c.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className={`flex items-center gap-3 p-4 border ${c.isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}
                    >
                      {c.isCompleted ? <CheckCircle2 className="text-emerald-400" size={18} /> : <X className="text-red-400" size={18} />}
                      <div className="text-xs font-bold uppercase tracking-wide text-white/80">{c.description}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 justify-center">
                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => { resetGame(); onExit(); }}
                  className="bg-white/5 text-white border border-white/20 px-12 py-5 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3"
                >
                  <LogOut size={20} />
                  Return to Jungle Base
                </motion.button>
                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  onClick={() => { resetGame(); }}
                  className="bg-emerald-500 text-black px-12 py-5 font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all flex items-center gap-3"
                >
                  <Zap size={20} className="fill-black" />
                  Request Resupply
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side: Alerts */}
      <div className="absolute top-24 right-8 text-right flex flex-col gap-2">
         <div className="flex items-center gap-2 text-white/50 uppercase text-[10px] tracking-widest justify-end">
            <Zap size={12} className="text-cyan-400" />
            System Status: Nominal
         </div>
         <motion.div 
           animate={{ opacity: headlights ? 1 : 0.3 }}
           className={`flex items-center gap-2 uppercase text-[10px] tracking-widest justify-end ${headlights ? 'text-cyan-400' : 'text-white/30'}`}
         >
            <Gauge size={12} />
            High Beams: {headlights ? 'Active [L]' : 'Offline [L]'}
         </motion.div>
         <motion.div 
           animate={{ opacity: boost.amount > 20 ? 1 : 0.5 }}
           className={`flex items-center gap-2 uppercase text-[10px] tracking-widest justify-end ${boost.isBoosting ? 'text-cyan-400' : 'text-white/30'}`}
         >
            <Zap size={12} className={boost.isBoosting ? "animate-pulse" : ""} />
            Nitro Core: {boost.isBoosting ? 'Engaged [Shift]' : boost.isCooldown ? 'Overheated [Shift]' : 'Ready [Shift]'}
         </motion.div>
         <div className="flex items-center gap-2 uppercase text-[10px] tracking-widest justify-end text-white/50">
            <MapIcon size={12} />
            Time Cycle: <span className="text-white">{skyboxType.toUpperCase()} [T]</span>
         </div>
      </div>
    </div>
  );
};
