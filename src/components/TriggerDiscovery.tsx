import { useState } from "react";
import { JournalEntry, HiddenTriggerReport, UserProfile } from "../types";
import { SearchCode, LayoutDashboard, Compass, CheckCircle, HelpCircle, Activity, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TriggerDiscoveryProps {
  entries: JournalEntry[];
  profile: UserProfile;
}

export default function TriggerDiscovery({ entries, profile }: TriggerDiscoveryProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<HiddenTriggerReport | null>(null);
  const [error, setError] = useState("");

  const handleDeepScan = async () => {
    if (entries.length < 2) {
      setError("AI pattern detection requires at least 2 logged journal entries to determine recurring stress traps.");
      return;
    }
    setError("");
    setIsScanning(true);

    try {
      const response = await fetch("/api/discover-triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: entries.map(e => ({ text: e.text, date: e.date, moodScore: e.moodScore })),
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error("Trigger discovery API failed.");
      }

      const data: HiddenTriggerReport = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to run deep analyzer scan: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl" id="trigger-discovery-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-3">
        <div>
          <h2 className="text-lg font-sans font-bold text-white flex items-center gap-2">
            <SearchCode className="h-5 w-5 text-indigo-400" />
            AI Hidden Trigger Scan
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Analyze historical thoughts to map subconscious fatigue cycles, pressure anchors, and peer habits.
          </p>
        </div>
        
        <button
          onClick={handleDeepScan}
          disabled={isScanning || entries.length < 2}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 text-xs transition-all disabled:opacity-40 select-none cursor-pointer"
          id="trigger-run-deep-scan-btn"
        >
          {isScanning ? (
            <>
              <Activity className="h-3.5 w-3.5 animate-spin text-indigo-200" />
              Decrypting Core Overlaps...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Perform Deep Scan
            </>
          )}
        </button>
      </div>

      {entries.length < 2 ? (
        <div className="text-center py-10 bg-[#0c0c0e]/30 rounded-xl border border-dashed border-white/5" id="trigger-history-alert-box">
          <HelpCircle className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-400">Locked Checklist Indicator</p>
          <p className="text-[10px] text-zinc-500 max-w-sm mx-auto mt-1">
            You currently have only <strong>{entries.length} log entry</strong>. Log at least 2 entries inside standard check-ins to grant Gemini memory logs to extract triggers.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 mb-4 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-300"
            >
              {error}
            </motion.div>
          )}

          {report ? (
            <motion.div
              key={JSON.stringify(report)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Pattern list */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                  <span className="p-1 rounded-md bg-indigo-500/10"><Activity className="h-3.5 w-3.5" /></span>
                  Core Detected Hidden Habits & Triggers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="discovered-patterns-grid">
                  {report.insightsOnTriggers.map((pattern, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className="p-4 rounded-xl bg-[#0c0c0e] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
                    >
                      <p className="text-xs text-white leading-relaxed font-sans font-medium">"{pattern}"</p>
                      <span className="text-[9px] font-mono text-indigo-300 uppercase mt-4 block">Core Signal #{i + 1}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Strategy details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-2">
                    <Compass className="h-4 w-4" /> Recommended Rebuilding Routine
                  </h4>
                  <div className="text-zinc-200 text-xs leading-relaxed space-y-3 font-sans">
                    <p>{report.rebuildingStrategy}</p>
                  </div>
                </div>

                <div className="p-5 bg-[#0c0c0e]/60 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-sky-400" /> Synthesis Overview
                    </h4>
                    <p className="text-zinc-300 text-xs leading-relaxed font-sans mb-4">
                      {report.summary}
                    </p>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>COGNITIVE FIREWALL V1</span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" /> ANALYSIS VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center border border-white/5 rounded-xl bg-white/[0.01]" id="trigger-pending-view">
              <SearchCode className="h-8 w-8 text-zinc-700 animate-pulse mb-2" />
              <p className="text-xs font-semibold text-zinc-400">Scanning Idle</p>
              <p className="text-[10px] text-zinc-500 max-w-xs mt-1">
                You have logged <strong>{entries.length} entries</strong>. Click the "Perform Deep Scan" trigger above to run historical analysis across your thoughts.
              </p>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
