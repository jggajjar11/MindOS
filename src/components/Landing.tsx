import { useState } from "react";
import { UserProfile } from "../types";
import { Sparkles, GraduationCap, Compass, HelpCircle, Layers, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { validateOnboarding } from "../utils/wellnessUtils";

interface LandingProps {
  onProfileSubmit: (profile: UserProfile) => void;
}

export default function Landing({ onProfileSubmit }: LandingProps) {
  const [name, setName] = useState("");
  const [examType, setExamType] = useState("");
  const [error, setError] = useState("");

  const examPresets = [
    { key: "SAT_ACT", label: "SAT / Prep exams", desc: "Verbal, Quant, and core endurance" },
    { key: "MCAT_USMLE", label: "MCAT / USMLE / Medical", desc: "High volume science retention under time limits" },
    { key: "BAR", label: "Bar Exam / Legal Finals", desc: "Analytical reading, arguments, and essay stress" },
    { key: "JEE_NEET", label: "JEE / NEET (Competitive Entrance)", desc: "Physics, Chem, Math/Bio rigorous sprints" },
    { key: "GCSE_A_LEVELS", label: "GCSE / A-Levels / APs", desc: "Multi-subject curriculum checklists" },
    { key: "UNI_FINALS", label: "University Finals / Thesis", desc: "GPA pressure and self-paced timelines" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateOnboarding(name, examType);
    if (!result.valid) {
      setError(result.error || "Invalid onboarding information provided.");
      return;
    }
    onProfileSubmit({ name: name.trim(), examType });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100 overflow-hidden relative" id="landing-container">
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Outer wrapper */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 md:px-8 py-12 max-w-6xl mx-auto w-full z-10">
        
        {/* Header Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-mono mb-4">
            <Sparkles className="h-3 w-3" />
            ACADEMIC COGNITIVE ENGINE
          </div>
          <h1 className="text-4xl md:text-6xl font-sans font-bold tracking-tight text-white">
            MindOS
          </h1>
          <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            A premium cognitive firewall for students under massive testing pressure. Analyze journal patterns, discover hidden exam triggers, and run tailored somatic exercises.
          </p>
        </motion.div>

        {/* Dynamic Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-2xl bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-2xl"
          id="profile-setup-card"
        >
          <div className="border-b border-white/5 pb-5 mb-6">
            <h2 className="text-xl md:text-2xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
              Configure Student Terminal
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your logs and profile remain entirely inside this web-browser (LocalStorage). Private & secure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Name */}
            <div>
              <label htmlFor="student-name" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                What should we call you?
              </label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="w-full rounded-xl bg-[#0c0c0e] border border-white/5 text-zinc-100 placeholder-zinc-400 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Enter nickname or initial..."
                autoComplete="off"
              />
            </div>

            {/* Premium presets container */}
            <div>
              <label htmlFor="custom-exam" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                Select Your Preparation Target
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="exam-preset-grid">
                {examPresets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => {
                      setExamType(preset.label);
                      setError("");
                    }}
                    aria-label={`Select ${preset.label} preset`}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-[105px] group ${
                      examType === preset.label 
                        ? "bg-indigo-950/40 border-indigo-500/70 shadow-lg text-indigo-200" 
                        : "bg-[#0c0c0e] border border-white/5 hover:border-white/10 hover:bg-[#121214]"
                    }`}
                    id={`preset-${preset.key}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-mono tracking-wide ${examType === preset.label ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                        PRESET
                      </span>
                      {examType === preset.label && (
                        <CheckCircle className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-sans font-bold text-zinc-100 mt-1 line-clamp-1">{preset.label}</h3>
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{preset.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="mt-4">
                <input
                  id="custom-exam"
                  type="text"
                  value={examPresets.some(p => p.label === examType) ? "" : examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-xl bg-[#0c0c0e] border border-white/5 text-zinc-100 placeholder-zinc-400 px-4 py-2.5 text-xs focus:border-indigo-500 outline-none transition-all"
                  placeholder="Or write custom exam (e.g., MCAT, CFA Level II, GRE)..."
                  aria-label="Or write custom exam target"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/30 px-3.5 py-2.5 rounded-xl"
                id="setup-error-alert"
              >
                {error}
              </motion.div>
            )}

            {/* Call to action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold py-3.5 shadow-xl hover:shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm"
                id="initialize-terminal-btn"
              >
                Initialize Terminal
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Explanatory visual layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-zinc-400 text-xs w-full max-w-4xl px-4">
          <div className="flex gap-3">
            <Layers className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-zinc-250">Neural Pattern Maps</h4>
              <p className="mt-1 leading-relaxed text-zinc-400">Gemini summarizes distress structures and tracks stress spikes across days dynamically.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Compass className="h-5 w-5 text-sky-400 shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-zinc-200">Personalized Somatics</h4>
              <p className="mt-1 leading-relaxed text-zinc-400">Instantly generate respiratory or cognitive grounding scripts aimed directly at your logged trigger profile.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-zinc-200">100% Client-Side Safe</h4>
              <p className="mt-1 leading-relaxed text-zinc-400">No database connections, cookies or logins. MindOS belongs strictly to your disk.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
