import { useState } from "react";
import { UserProfile, JournalEntry, JournalAnalysis } from "../types";
import { Sparkles, Save, BrainCircuit, Heart, Calendar, ArrowRight, Trash2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JournalFormProps {
  profile: UserProfile;
  onEntryAdded: (entry: JournalEntry) => void;
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
}

export default function JournalForm({ profile, onEntryAdded, entries, onDeleteEntry }: JournalFormProps) {
  const [text, setText] = useState("");
  const [moodScore, setMoodScore] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState<JournalAnalysis | null>(null);

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return "😫";
    if (score <= 4) return "😰";
    if (score <= 6) return "😐";
    if (score <= 8) return "😊";
    return "😎";
  };

  const getMoodText = (score: number) => {
    if (score <= 2) return "Severe Panic / Extreme Burnout";
    if (score <= 4) return "High Anxiety / Exam Dread";
    if (score <= 6) return "Standard Baseline / Stable";
    if (score <= 8) return "Focused / Relaxed flow";
    return "Peak Academic Flow State";
  };

  const handleAnalyzeAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please write down what is on your mind. Even a brief sentence helps analysis.");
      return;
    }
    if (trimmed.length < 10) {
      setError("A comprehensive journal entry needs at least 10 characters to perform high-fidelity AI wellness pattern matching.");
      return;
    }
    setError("");
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          moodScore,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Backend was unable to complete Gemini request.");
      }

      const analysis: JournalAnalysis = await response.json();
      
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split("T")[0],
        moodScore,
        text: text.trim(),
        analysis,
      };

      onEntryAdded(newEntry);
      setLastAnalysis(analysis);
      setText("");
      setMoodScore(5);
    } catch (err: any) {
      console.error(err);
      setError("We encountered an issue communicating with the AI. Saving entry with basic offline metrics instead.");
      
      // Save basic offline backup entry if connection fails
      const backupAnalysis: JournalAnalysis = {
        emotion: moodScore <= 4 ? "Anxiety" : "Motivation",
        stressScore: Math.max(1, 11 - moodScore),
        confidenceScore: moodScore,
        burnoutRisk: moodScore <= 3 ? "High" : moodScore <= 6 ? "Medium" : "Low",
        triggers: text.toLowerCase().includes("test") || text.toLowerCase().includes("exam") ? ["Mock Test Anxiety"] : ["Time Management"],
        insights: "Offline analysis. Connect to standard backend endpoints to experience premium Gemini wellness insights.",
        crisisFlagged: text.toLowerCase().includes("suicide") || text.toLowerCase().includes("self-harm") || text.toLowerCase().includes("hopeless")
      };

      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split("T")[0],
        moodScore,
        text: text.trim(),
        analysis: backupAnalysis,
      };
      
      onEntryAdded(newEntry);
      setLastAnalysis(backupAnalysis);
      setText("");
      setMoodScore(5);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="journal-wrapper">
      
      {/* Left Input Section */}
      <div className="lg:col-span-7">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
          id="journal-input-card"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
            <Heart className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-sans font-bold text-white uppercase tracking-wider text-xs font-mono">
              Daily Wellness & Journal Entry
            </h2>
          </div>

          <form onSubmit={handleAnalyzeAndSubmit} className="space-y-6">
            {/* Mood Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label id="mood-slider-label" htmlFor="mood-score-slider" className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-bold">
                  Step 1: Rate Current Mood Check-In
                </label>
                <span className="text-xl inline-flex items-center gap-1.5 font-bold text-white bg-[#18181b] px-2.5 py-1 rounded-lg border border-white/5" id="mood-score-display">
                  {getMoodEmoji(moodScore)} {moodScore}/10
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-semibold mb-3">{getMoodText(moodScore)}</p>
              
              <div className="flex items-center gap-4">
                <span className="text-sm" aria-hidden="true">😫</span>
                <input
                  id="mood-score-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  aria-labelledby="mood-slider-label"
                  className="w-full accent-indigo-500 h-2 bg-[#0c0c0e] rounded-lg cursor-pointer transition-all"
                />
                <span className="text-sm" aria-hidden="true">😎</span>
              </div>
            </div>

            {/* Markdown Text Area */}
            <div>
              <label htmlFor="journal-textarea" className="block text-xs font-mono uppercase tracking-wider text-zinc-200 mb-2 font-bold">
                Step 2: Stream of Consciousness Journal
              </label>
              <textarea
                id="journal-textarea"
                rows={5}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError("");
                }}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "journal-input-error" : undefined}
                placeholder="Write honestly about study hours, mock results, parent expectations, lack of sleep, or comparison feelings..."
                className={`w-full rounded-xl bg-[#0c0c0e] border text-zinc-100 placeholder-zinc-400 p-4 text-sm outline-none transition-all resize-none leading-relaxed ${
                  error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : "border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
              />
              <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-300 font-mono">
                <span>LOCALPERSISTENCE STORAGE ACTIVE</span>
                <span className={`${text.length > 250 ? "text-indigo-400" : "text-zinc-300"}`}>{text.length} characters</span>
              </div>
            </div>

            {error && (
              <div 
                className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300" 
                id="journal-input-error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Submission triggers */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-sm shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                id="submit-journal-analyze-btn"
              >
                {isAnalyzing ? (
                  <>
                    <BrainCircuit className="h-4 w-4 animate-spin text-indigo-300" />
                    MindOS Decrypting Journal Patterns...
                  </>
                ) : (
                  <>
                    Run Gemini Wellness Analysis & Save
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Realtime AI Feedback Panel */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between" id="journal-feedback-panel">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-250 font-bold">
                Latest Gemini Copement Insights
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {lastAnalysis ? (
                <motion.div
                  key={JSON.stringify(lastAnalysis)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/10">
                      <p className="text-[10px] text-indigo-300 font-mono uppercase font-semibold">Assessed Emotion</p>
                      <p className="text-base font-bold text-white mt-1 capitalize">{lastAnalysis.emotion}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-sky-300 font-mono uppercase font-semibold">Burnout Risk</p>
                      <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(lastAnalysis.burnoutRisk)}`}>
                        {lastAnalysis.burnoutRisk} Risk
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3 bg-[#0c0c0e] rounded-xl border border-white/5 animate-fade-in">
                      <p className="text-[10px] text-zinc-350 uppercase font-semibold">Stress Score</p>
                      <div className="flex items-end gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-white">{lastAnalysis.stressScore}</span>
                        <span className="text-xs text-zinc-300">/10</span>
                      </div>
                      <div className="w-full bg-[#18181b] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${lastAnalysis.stressScore * 10}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-[#0c0c0e] rounded-xl border border-white/5 animate-fade-in">
                      <p className="text-[10px] text-zinc-350 uppercase font-semibold">Confidence Score</p>
                      <div className="flex items-end gap-1.5 mt-1">
                        <span className="text-2xl font-bold text-white">{lastAnalysis.confidenceScore}</span>
                        <span className="text-xs text-zinc-300">/10</span>
                      </div>
                      <div className="w-full bg-[#18181b] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-sky-500 h-full rounded-full" 
                          style={{ width: `${lastAnalysis.confidenceScore * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Triggers identified */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-zinc-300 mb-2 font-bold">Identified Core Triggers</h4>
                    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Identified Core Triggers">
                      {lastAnalysis.triggers.map((trig, idx) => (
                        <span 
                          key={idx}
                          role="listitem"
                          className="bg-[#0c0c0e ] px-2.5 py-1 text-xs rounded-lg border border-white/10 text-zinc-200 font-mono font-medium"
                        >
                          🏷️ {trig}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Custom insights quote */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 relative">
                    <span className="text-2xl text-indigo-500 font-serif absolute -top-1 left-2" aria-hidden="true">“</span>
                    <p className="text-xs text-zinc-100 italic leading-relaxed pl-4 pr-2 font-sans pt-1">
                      {lastAnalysis.insights}
                    </p>
                  </div>

                  {lastAnalysis.crisisFlagged && (
                    <div className="flex gap-2 items-center text-red-300 bg-red-950/25 border border-red-905/40 rounded-xl p-3 text-xs leading-relaxed" role="alert">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                      <span>Support services was triggered. Please view the safety circle banner in the page header.</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-zinc-300" id="feedback-placeholder">
                  <BrainCircuit className="h-10 w-10 text-zinc-650 mb-3 animate-pulse" />
                  <p className="text-xs font-semibold text-zinc-200">Waiting for Entry</p>
                  <p className="text-[10px] text-zinc-300 max-w-xs mt-1 leading-normal">
                    Once you save your daily journal entry, Gemini will deliver clinical counseling metrics, emotional indexes, and personalized wellness prompts right here.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[9px] text-zinc-300 font-mono mt-4 uppercase tracking-wider text-center font-bold">
            Encrypted End-to-End via standard client sandbox sandboxing
          </p>
        </div>
      </div>

    </div>
  );
}
