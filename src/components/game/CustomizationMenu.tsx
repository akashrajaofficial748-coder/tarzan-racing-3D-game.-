import { motion } from 'motion/react';
import { useGameStore } from '../../hooks/useGameStore';
import { X, Check, Palette, Zap, Sparkles, Cloud, Activity } from 'lucide-react';

export const CustomizationMenu = ({ onClose }: { onClose: () => void }) => {
  const { carCustomization, setCarCustomization, fogDensity, setFogDensity, shakeSensitivity, setShakeSensitivity } = useGameStore();

  const colors = [
    '#222222', '#ff2222', '#22ff22', '#2222ff', 
    '#ffff22', '#ff00ff', '#ffffff', '#e67e22', 
    '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d'
  ];
  const neonColors = [
    '#00ffff', '#ff0055', '#ffff00', '#00ff00', 
    '#ffffff', '#ff00ff', '#ff8800', '#0000ff'
  ];
  const patterns = [
    { id: 'none', label: 'Solid' },
    { id: 'stripes', label: 'Racing Stripes' },
    { id: 'circuit', label: 'Circuit Board' },
    { id: 'tribal', label: 'Tribal Markings' },
    { id: 'flames', label: 'Wildfire' },
    { id: 'carbon', label: 'Carbon Fiber' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl shadow-cyan-500/10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Palette className="text-cyan-400" />
             GARAGE: <span className="text-cyan-400">TARZAN MODS</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Main Body Color */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold block">Chassis Finish</label>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setCarCustomization({ color: c })}
                  className={`w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 ${carCustomization.color === c ? 'border-cyan-400 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Neon Underglow */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold block flex items-center gap-2">
               <Zap size={10} className="text-cyan-400" /> Neon Signature
            </label>
            <div className="flex flex-wrap gap-3">
              {neonColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setCarCustomization({ neonColor: c })}
                  className={`w-12 h-12 rounded-lg border-2 transition-transform hover:scale-110 ${carCustomization.neonColor === c ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-transparent opacity-50'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Patterns */}
          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold block flex items-center gap-2">
              <Sparkles size={10} className="text-pink-400" /> Graphics Protocol
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCarCustomization({ decalPattern: p.id as any })}
                  className={`py-4 px-6 border text-left transition-all ${carCustomization.decalPattern === p.id 
                    ? 'bg-cyan-400 text-black border-cyan-400 font-black' 
                    : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'}`}
                >
                  <div className="text-[10px] uppercase tracking-widest leading-none mb-1 opacity-60">Pattern</div>
                  <div className="text-sm truncate uppercase tracking-tighter">{p.label}</div>
                  {carCustomization.decalPattern === p.id && <Check size={14} className="mt-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Fog Density Control */}
          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold block flex items-center gap-2">
              <Cloud size={10} className="text-slate-400" /> Atmospheric Density
            </label>
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-xl border border-white/10">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={fogDensity}
                onChange={(e) => setFogDensity(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-cyan-400 font-mono text-xl w-12 text-right">
                {Math.round(fogDensity * 100)}%
              </span>
            </div>
          </div>

          {/* Screen Shake Control */}
          <div className="space-y-4 md:col-span-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold block flex items-center gap-2">
              <Activity size={10} className="text-orange-400" /> Impact Feedback
            </label>
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-xl border border-white/10">
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={shakeSensitivity}
                onChange={(e) => setShakeSensitivity(parseFloat(e.target.value))}
                className="flex-1 accent-orange-400 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-orange-400 font-mono text-xl w-12 text-right">
                {Math.round(shakeSensitivity * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
           <button 
             onClick={onClose}
             className="flex-1 bg-cyan-400 text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-colors"
           >
             Save Configuration
           </button>
        </div>
      </div>
    </motion.div>
  );
};
