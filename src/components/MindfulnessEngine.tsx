import { useState, useEffect } from "react";
import { UserProfile, MindfulnessExercise } from "../types";
import { Compass, Sparkles, Activity, Play, Pause, RefreshCw, Volume2, ShieldCheck, Footprints } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MindfulnessEngineProps {
  profile: UserProfile;
  currentMoodCore?: number;
}

export default function MindfulnessEngine({ profile, currentMoodCore = 5 }: MindfulnessEngineProps) {
  const [exerciseType, setExerciseType] = useState("breathing");
  const [duration, setDuration] = useState("3 mins");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exercise, setExercise] = useState<MindfulnessExercise | null>(null);
  const [error, setError] = useState("");

  // Breathing pacer states
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Pause">("Inhale");
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [totalTimer, setTotalTimer] = useState(180); // 3 mins default

  // Preset default exercises in case they want a fast offline reset
  const fallbackExercise: MindfulnessExercise = {
    title: "Grounding Focus Pacing",
    type: "grounding",
    duration: "3 mins",
    script: "Bring your visual field to a single resting focal coordinate. Lower your shoulders, unclench your jaw. Feel the support of your backrest. We are going to establish physical weight and spatial clarity before diving back into mock exam revision.",
    steps: [
      "Locate 5 distinct blue items in your immediate line of sight.",
      "Identify 4 physical textures you can feel right now (e.g., keyboard, desk, clothing, ground).",
      "Notice 3 distinct environmental sounds around you.",
      "Acknowledge 2 smells in the room.",
      "Sip a cold glass of water and focus purely on its temperature."
    ],
    tips: [
      "Perfect tool for resetting short-term cognitive overload.",
      "Practice this at your study desk every 60 minutes."
    ]
  };

  const handleGenerateExercise = async () => {
    setIsGenerating(true);
    setError("");
    setExercise(null);
    setIsPlaying(false);

    try {
      const response = await fetch("/api/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: exerciseType,
          duration,
          profile,
          currentMood: currentMoodCore,
        }),
      });

      if (!response.ok) {
        throw new Error("Somatic generator failed to compile.");
      }

      const data: MindfulnessExercise = await response.json();
      setExercise(data);

      // Parse duration to seconds
      const mins = parseInt(duration) || 3;
      setTotalTimer(mins * 60);
    } catch (err: any) {
      console.error(err);
      setError("Unable to contact therapeutic generator. Spinning custom local grounding session instead!");
      setExercise(fallbackExercise);
      setTotalTimer(180);
    } finally {
      setIsGenerating(false);
    }
  };

  // Respiratory timing loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && totalTimer > 0) {
      interval = setInterval(() => {
        setTotalTimer(prev => prev - 1);
        setPhaseSeconds(prev => {
          if (prev <= 1) {
            // Cycle phase: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Pause (4s)
            if (breathPhase === "Inhale") {
              setBreathPhase("Hold");
              return 4;
            } else if (breathPhase === "Hold") {
              setBreathPhase("Exhale");
              return 4;
            } else if (breathPhase === "Exhale") {
              setBreathPhase("Pause");
              return 4;
            } else {
              setBreathPhase("Inhale");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (totalTimer === 0) {
      setIsPlaying(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, breathPhase, totalTimer]);

  const formatMinSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Get current prompt message based on phase
  const getPhaseInstruction = () => {
    switch (breathPhase) {
      case "Inhale":
        return "Slow deep breath in ... Expand your lungs";
      case "Hold":
        return "Hold the breath quiet ... Rest in balance";
      case "Exhale":
        return "Slow discharge ... Release testing fatigue";
      case "Pause":
        return "Hold the empty stillness ... Relaxed";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="mindfulness-container">
      
      {/* Parameter Selection panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl" id="exercise-generator-selector-card">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
            <Compass className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider text-xs font-mono">
              Mindfulness Generator
            </h2>
          </div>

          <div className="space-y-5">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                1. Somatic Therapy Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "breathing", label: "🧘 Breathing Reset", desc: "For panic spikes" },
                  { value: "grounding", label: "👣 Somatic 5-4-3-2-1", desc: "For screen burnout" },
                  { value: "visualization", label: "🌌 Guided Focus", desc: "Performance confidence" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setExerciseType(item.value)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      exerciseType === item.value
                        ? "bg-indigo-950/40 border-indigo-500/70 text-indigo-200"
                        : "bg-[#0c0c0e] border border-white/5 hover:border-white/10 text-zinc-400"
                    }`}
                    id={`type-btn-${item.value}`}
                  >
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                2. Target Practice Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["1 min", "3 mins", "5 mins"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setDuration(t)}
                    className={`py-2 text-xs font-sans font-bold rounded-lg border transition-all cursor-pointer ${
                      duration === t
                        ? "bg-indigo-950/40 border-indigo-500/70 text-indigo-200"
                        : "bg-[#0c0c0e] border border-white/5 text-zinc-400 hover:border-white/10"
                    }`}
                    id={`duration-btn-${t.replace(" ", "-")}`}
                  >
                    ⏱️ {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-300 text-xs rounded-xl" id="exercise-error">
                {error}
              </div>
            )}

            {/* CTA action */}
            <button
              onClick={handleGenerateExercise}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-sm shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              id="generate-mindfulness-btn"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-300" />
                  Generating Therapeutic Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  Generate MBSR Session
                </>
              )}
            </button>
          </div>
        </div>

        {/* Respiratory Box Breathing synchronizer UI */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center text-center" id="respiratorybox-ui">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-1.5 self-start">
            <Volume2 className="h-4 w-4 text-indigo-400" /> Live Breathing Loop
          </h3>

          <div className="relative flex items-center justify-center min-h-[160px] w-full">
            {/* The Calming breathing bubble */}
            <motion.div
              animate={{
                scale: isPlaying 
                  ? (breathPhase === "Inhale" ? 1.6 : breathPhase === "Hold" ? 1.6 : breathPhase === "Exhale" ? 1.0 : 1.0)
                  : 1.1,
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
              }}
              className={`rounded-full flex flex-col items-center justify-center transition-all ${
                isPlaying 
                  ? (breathPhase === "Inhale" ? "bg-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.25)] text-indigo-300 border-indigo-500/40" 
                    : breathPhase === "Hold" ? "bg-sky-500/20 shadow-[0_0_50px_rgba(14,165,233,0.25)] text-sky-300 border-sky-400/40" 
                    : breathPhase === "Exhale" ? "bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-purple-300 border-purple-500/30"
                    : "bg-white/5 text-zinc-400 border-white/10")
                  : "bg-[#0c0c0e] text-indigo-400 border-white/5"
              } h-36 w-36 border-2`}
              id="breathing-live-sphere"
            >
              <span className="text-xs uppercase font-mono font-bold tracking-widest block transition-all" id="current-phase-display">
                {isPlaying ? breathPhase : "SLEEPING"}
              </span>
              <span className="text-2xl font-bold mt-1 text-white block font-mono" id="current-seconds-display">
                {isPlaying ? `${phaseSeconds}s` : "FLOW"}
              </span>
            </motion.div>
          </div>

          <p className="text-xs text-zinc-200 mt-6 min-h-[36px] px-4 leading-normal font-sans" id="phase-instruction-prompt">
            {isPlaying ? getPhaseInstruction() : "Click 'Start Session' below to lock focus to standard autonomic respiratory timers."}
          </p>

          <div className="flex gap-4 items-center justify-center mt-5 w-full border-t border-white/5 pt-4 font-mono">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Timer</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatMinSec(totalTimer)}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-full text-black flex items-center justify-center cursor-pointer transition-all active:scale-90 ${isPlaying ? "bg-amber-500 hover:bg-amber-400" : "bg-white hover:bg-zinc-100"}`}
                id="breathing-toggle-btn"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setBreathPhase("Inhale");
                  setPhaseSeconds(4);
                  setTotalTimer(180);
                }}
                className="p-2.5 rounded-full bg-[#0c0c0e]/80 hover:bg-[#121214] text-zinc-400 border border-white/10 flex items-center justify-center cursor-pointer active:scale-95"
                id="breathing-reset-btn"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Script Screen & steps playbacks */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {exercise ? (
            <motion.div
              key={exercise.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col justify-between"
              id="active-exercise-details-card"
            >
              <div>
                <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono tracking-widest uppercase border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      🌸 {exercise.type} • {exercise.duration}
                    </span>
                    <h3 className="text-xl font-sans font-bold text-white mt-2" id="exercise-title-label">
                      {exercise.title}
                    </h3>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-1" />
                </div>

                {/* Subtitle/Script details */}
                <div className="bg-[#0c0c0e]/60 p-4 border border-white/5 rounded-xl mb-6">
                  <p className="text-xs text-zinc-300 leading-relaxed italic font-sans">
                    "{exercise.script}"
                  </p>
                </div>

                {/* Actionable Steps list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Sequential Practice Actions
                  </h4>
                  {exercise.steps.map((step, idx) => (
                    <div 
                      key={idx}
                      className="flex gap-3 text-xs text-zinc-200 border border-white/5 p-3 rounded-lg bg-[#0c0c0e]"
                    >
                      <span className="h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center font-mono font-bold text-[10px] text-indigo-400 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-sans leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* General tips */}
              <div className="border-t border-white/5 pt-5 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercise.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2 text-[10.5px] items-start text-indigo-300 leading-relaxed font-sans bg-indigo-950/10 p-2.5 rounded-lg border border-indigo-500/5">
                    <Footprints className="h-4 w-4 shrink-0 text-indigo-400" />
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl h-full flex flex-col justify-center items-center text-center" id="exercise-idle-card">
              <Compass className="h-12 w-12 text-zinc-700 animate-pulse mb-3" />
              <p className="text-sm font-sans font-bold text-white">Somatic Workspace Idle</p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-normal">
                Choose your wellness targets on the left column, then click <strong>"Generate MBSR Session"</strong>. Gemini will construct a pristine behavioral script targeting your logged profile.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
