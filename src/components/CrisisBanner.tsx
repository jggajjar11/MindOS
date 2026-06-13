import { ShieldAlert, PhoneCall, HeartHandshake, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CrisisBannerProps {
  onTriggerBreathing: () => void;
}

export default function CrisisBanner({ onTriggerBreathing }: CrisisBannerProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      role="region"
      aria-label="Support Circle Urgent Alert"
      className="mb-6 overflow-hidden rounded-2xl border border-red-500/30 bg-red-950/15 p-5 shadow-lg backdrop-blur-xl"
      id="crisis-banner-card"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-red-500/20 p-3 text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-sans font-bold tracking-tight text-red-200 text-lg flex items-center gap-2">
              MindOS Support Circle <HeartHandshake className="h-4 w-4 inline text-red-400" />
            </h3>
            <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              We noticed indicators of extreme overwhelm, hopelessness, or severe stress in your journal logs. 
              Academic pressure is real, but you never have to carry it alone. Please consider talking to an expert:
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-xs font-mono text-zinc-300">
              <span className="flex items-center gap-1">
                <PhoneCall className="h-3 w-3 text-red-400" /> 
                <strong>National Crisis Lifeline:</strong> 988 (Call/Text 24/7)
              </span>
              <span className="flex items-center gap-1">
                <PhoneCall className="h-3 w-3 text-red-400" /> 
                <strong>The Trevor Project:</strong> 1-866-488-7386
              </span>
              <span className="flex items-center gap-1">
                <PhoneCall className="h-3 w-3 text-red-400" /> 
                <strong>Crisis Text Line:</strong> Text HOME to 741741
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={onTriggerBreathing}
            className="flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-white text-black px-4 py-2.5 text-xs font-mono font-bold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            id="start-safety-breathing-btn"
          >
            <Sparkles className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            Immediate Calm Breathing Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-zinc-800 hover:bg-white/5 text-zinc-400 hover:text-zinc-200 px-3 py-2.5 text-xs font-medium transition-all cursor-pointer"
            id="dismiss-crisis-banner-btn"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}
