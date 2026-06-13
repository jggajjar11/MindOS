import { useState, useEffect } from "react";
import { UserProfile, JournalEntry } from "./types";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import JournalForm from "./components/JournalForm";
import TriggerDiscovery from "./components/TriggerDiscovery";
import CoachChat from "./components/CoachChat";
import MindfulnessEngine from "./components/MindfulnessEngine";
import CrisisBanner from "./components/CrisisBanner";
import { 
  Sparkles, 
  LayoutDashboard, 
  Heart, 
  Compass, 
  MessageSquare, 
  SearchCode, 
  GraduationCap, 
  LogOut, 
  Calendar,
  Layers,
  CheckCircle,
  AlertOctagon,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "journal" | "patterns" | "chat" | "mindfulness">("dashboard");
  const [isCrisisTriggered, setIsCrisisTriggered] = useState(false);

  // 1. Initial hydration from local storage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("mindos_user_profile");
      const storedEntries = localStorage.getItem("mindos_journal_entries");

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        setEntries(parsedEntries);
        // run immediate crisis sweep
        checkCrisisState(parsedEntries);
      }
    } catch (err) {
      console.error("Hydration error:", err);
    }
  }, []);

  // Save profile to local storage helpers
  const handleSaveProfile = (newProfile: UserProfile) => {
    localStorage.setItem("mindos_user_profile", JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const handleResetProfile = () => {
    if (confirm("Are you sure you want to reset your profile details? Your historical logs will remain local, but you will reset onboarding context.")) {
      localStorage.removeItem("mindos_user_profile");
      setProfile(null);
    }
  };

  // Add individual journal log
  const handleAddEntry = (entry: JournalEntry) => {
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem("mindos_journal_entries", JSON.stringify(updated));
    checkCrisisState(updated);
  };

  // Delete log
  const handleDeleteEntry = (id: string) => {
    if (confirm("This action is irreversible. Delete entry from local browser history?")) {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      localStorage.setItem("mindos_journal_entries", JSON.stringify(updated));
      checkCrisisState(updated);
    }
  };

  // Check general crisis indicators
  const checkCrisisState = (list: JournalEntry[]) => {
    const crisisKeywords = ["suicide", "self-harm", "kill myself", "end my life", "suicidal"];
    const hasTrigger = list.some((e) => {
      const lower = e.text.toLowerCase();
      const hasWord = crisisKeywords.some((w) => lower.includes(w));
      const hasAIAlert = e.analysis?.crisisFlagged === true;
      return hasWord || hasAIAlert;
    });
    setIsCrisisTriggered(hasTrigger);
  };

  // Immediate breathing override for Crisis Banner
  const triggerImmediateBreathing = () => {
    setCurrentTab("mindfulness");
    // We can also let the engine know it was triggered by click
    setTimeout(() => {
      const bubbleEl = document.getElementById("breathing-toggle-btn");
      if (bubbleEl) {
        bubbleEl.click(); // Toggle automated breathing live
      }
    }, 150);
  };

  // If profile is not set up, show onboarding screen
  if (!profile) {
    return <Landing onProfileSubmit={handleSaveProfile} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] bg-sky-500/[0.02] rounded-full blur-[90px] pointer-events-none" />

      {/* Main Console Header */}
      <header className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-sans font-bold shadow-lg shadow-indigo-500/20">
              M
            </div>
            <div>
              <span className="text-base font-bold font-sans tracking-wide text-white block">
                MindOS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">
                Student Wellness Terminal
              </span>
            </div>
          </div>

          {/* Student Status details */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right font-mono text-[10px]">
              <span className="text-zinc-400 font-bold flex items-center gap-1 justify-end">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                {profile.name}
              </span>
              <span className="text-zinc-500 mt-0.5 uppercase tracking-wide">
                Target: {profile.examType}
              </span>
            </div>

            <button 
              onClick={handleResetProfile}
              title="Reset profile config"
              className="p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all cursor-pointer"
              id="reset-profile-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Primary Container layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col z-10" id="main-stage">
        
        {/* Dynamic header safety layer trigger */}
        {isCrisisTriggered && (
          <CrisisBanner onTriggerBreathing={triggerImmediateBreathing} />
        )}

        {/* Dashboard sub navigation tab bar */}
        <div className="flex overflow-x-auto gap-1 border-b border-white/5 pb-px mb-6 shrink-0 h-11 scrollbar-none" id="applet-navigation-tabs">
          {[
            { id: "dashboard", label: "Dashboard Analytics", icon: LayoutDashboard },
            { id: "journal", label: "Mood & Journal", icon: Heart },
            { id: "patterns", label: "AI Hidden Triggers", icon: SearchCode },
            { id: "chat", label: "AI Wellness Coach", icon: MessageSquare },
            { id: "mindfulness", label: "Somatic Exercises", icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide transition-all border-b-2 font-mono whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? "border-indigo-500 text-indigo-400 bg-white/5" 
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
                id={`tab-navigate-${tab.id}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Primary Page views */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {currentTab === "dashboard" && (
                <Dashboard entries={entries} />
              )}
              
              {currentTab === "journal" && (
                <div className="space-y-8">
                  <JournalForm 
                    profile={profile} 
                    onEntryAdded={handleAddEntry} 
                    entries={entries} 
                    onDeleteEntry={handleDeleteEntry}
                  />

                  {/* Previous logged days log panel list */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl" id="journal-history-panel">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-400" /> Historical Log Archives ({entries.length} logged)
                    </h3>
                    
                    {entries.length === 0 ? (
                      <div className="text-center py-10 text-zinc-500 text-xs">
                        No previous logs recorded. Use the inputs in the layout above to log your first wellness check.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin" id="journal-history-list">
                        {entries.map((entry) => (
                          <div 
                            key={entry.id}
                            className="p-4 rounded-xl border border-white/5 bg-[#0c0c0e]/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10"
                          >
                            <div className="space-y-1 fill-neutral flex-1 max-w-3xl">
                              <div className="flex items-center gap-3 text-xs font-mono">
                                <span className="text-indigo-400 font-bold">{entry.date}</span>
                                <span className="text-zinc-600">|</span>
                                <span className="text-emerald-400 font-semibold font-sans">Mood Score: {entry.moodScore}/10</span>
                                {entry.analysis && (
                                  <>
                                    <span className="text-zinc-600">|</span>
                                    <span className="text-zinc-400 uppercase tracking-widest text-[9px] font-bold">Emotion: {entry.analysis.emotion}</span>
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-zinc-300 font-sans leading-relaxed pt-1 line-clamp-2">
                                {entry.text}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all self-end md:self-center cursor-pointer"
                              title="Delete log permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentTab === "patterns" && (
                <TriggerDiscovery entries={entries} profile={profile} />
              )}

              {currentTab === "chat" && (
                <CoachChat profile={profile} recentEntries={entries} />
              )}

              {currentTab === "mindfulness" && (
                <MindfulnessEngine profile={profile} currentMoodCore={entries[0]?.moodScore || 5} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Subtle brand footer limits */}
      <footer className="border-t border-white/5 shrink-0 text-zinc-500 text-[10px] font-mono py-8 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>MINDOSTM COGNITIVE SECURITY FIREWALL</span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> SECURED STORAGE ON DEVICE DISK ONLY
          </span>
        </div>
      </footer>
    </div>
  );
}
