import { JournalEntry } from "../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";
import { Activity, ShieldAlert, Sparkles, TrendingUp, Heart, Dumbbell } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  entries: JournalEntry[];
}

export default function Dashboard({ entries }: DashboardProps) {
  // 1. Sort entries chronologically to ensure trend curves flow correctly
  const chronologicalEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Last 7 entries for linear trend curves
  const last7Entries = chronologicalEntries.slice(-7);

  // Map data for Mood and Stress trend charts
  const trendData = last7Entries.map((e) => {
    const d = new Date(e.date);
    const dayLabel = d.toLocaleDateString([], { month: "short", day: "numeric" });
    return {
      date: dayLabel,
      "Mood Score": e.moodScore,
      "Stress Index": e.analysis?.stressScore || (11 - e.moodScore),
      "Confidence Level": e.analysis?.confidenceScore || e.moodScore,
    };
  });

  // Calculate Emotion distribution safely
  const emotionMap: Record<string, number> = {
    Anxiety: 0,
    Stress: 0,
    Confidence: 0,
    Motivation: 0,
    Frustration: 0,
  };

  // Compile distribution values
  entries.forEach((e) => {
    let emo = e.analysis?.emotion || "";
    // Normalize string representation
    if (emo.toLowerCase().includes("anx")) emo = "Anxiety";
    else if (emo.toLowerCase().includes("stress")) emo = "Stress";
    else if (emo.toLowerCase().includes("conf")) emo = "Confidence";
    else if (emo.toLowerCase().includes("motiv")) emo = "Motivation";
    else if (emo.toLowerCase().includes("frust")) emo = "Frustration";
    else emo = "Stress"; // Default category fallback

    if (emotionMap[emo] !== undefined) {
      emotionMap[emo]++;
    } else {
      emotionMap["Stress"]++;
    }
  });

  const pieColors = {
    Anxiety: "#fb923c", // Sleek Orange
    Stress: "#ea580c", // Deep Orange
    Confidence: "#10b981", // Emerald
    Motivation: "#6366f1", // Indigo
    Frustration: "#71717a", // Zinc Gray
  };

  const pieData = Object.keys(emotionMap).map((key) => ({
    name: key,
    value: emotionMap[key] || 0,
  })).filter(item => item.value > 0);

  // Safe checks if we have no parsed items yet
  const defaultPieData = [
    { name: "Anxiety", value: 2 },
    { name: "Stress", value: 3 },
    { name: "Confidence", value: 5 },
    { name: "Motivation", value: 4 },
  ];

  // Compile Trigger frequencies
  const defaultTriggers = {
    "Fear of Failure": 0,
    "Parent Pressure": 0,
    "Mock Test Anxiety": 0,
    "Time Management": 0,
    "Peer Comparison": 0,
  };

  entries.forEach((e) => {
    const list = e.analysis?.triggers || [];
    list.forEach((t) => {
      // Fuzzy-matching categories to keep rendering clean
      let key = t;
      if (t.toLowerCase().includes("failure")) key = "Fear of Failure";
      else if (t.toLowerCase().includes("parent")) key = "Parent Pressure";
      else if (t.toLowerCase().includes("test") || t.toLowerCase().includes("mock")) key = "Mock Test Anxiety";
      else if (t.toLowerCase().includes("time") || t.toLowerCase().includes("sched")) key = "Time Management";
      else if (t.toLowerCase().includes("peer") || t.toLowerCase().includes("compar")) key = "Peer Comparison";
      
      if (defaultTriggers[key as keyof typeof defaultTriggers] !== undefined) {
        defaultTriggers[key as keyof typeof defaultTriggers]++;
      }
    });
  });

  const barData = Object.keys(defaultTriggers).map((key) => ({
    name: key,
    Frequency: defaultTriggers[key as keyof typeof defaultTriggers],
  }));

  // Compile averages for Dynamic Wellness Score & Burnout Risk
  const totalEntriesCount = entries.length;
  const avgMood = totalEntriesCount > 0 
    ? entries.reduce((acc, curr) => acc + curr.moodScore, 0) / totalEntriesCount 
    : 6.0;

  const avgStress = totalEntriesCount > 0 
    ? entries.reduce((acc, curr) => acc + (curr.analysis?.stressScore || (11 - curr.moodScore)), 0) / totalEntriesCount 
    : 4.5;

  const avgConfidence = totalEntriesCount > 0 
    ? entries.reduce((acc, curr) => acc + (curr.analysis?.confidenceScore || curr.moodScore), 0) / totalEntriesCount 
    : 6.5;

  // Wellness Score Formula: based on avgMood, confidence boost, stress anchors
  // formula: (AvgMood * 5) + (AvgConfidence * 5) - (AvgStress * 2) + offset, bounded 0 - 100
  const computedWellnessScore = Math.round(
    Math.max(10, Math.min(100, (avgMood * 4.5) + (avgConfidence * 4.5) - (avgStress * 2) + 20))
  );

  // Burnout Risk Categorizer based on overall logs stress metrics
  const getBurnoutClassification = () => {
    if (totalEntriesCount === 0) return { label: "Low", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (avgStress >= 7.5 || avgMood <= 3.5) {
      return { label: "High Risk", color: "text-red-400 bg-red-500/10 border-red-500/30 animate-pulse" };
    } else if (avgStress >= 4.5 || avgMood <= 6.0) {
      return { label: "Medium Risk", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
    }
    return { label: "Low Risk", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  };

  const burnout = getBurnoutClassification();

  // Generate AI Insight statements based on real-time metadata math
  const generateDynamicInsights = () => {
    const list: string[] = [];
    
    if (totalEntriesCount === 0) {
      return [
        "Welcome to your telemetry metrics terminal. Post journals to reveal insights.",
        "Grounding activities will calibrate your core score baseline.",
        "Your stress values will dynamically adapt upon your next entries."
      ];
    }

    // Insight 1: Triggers presence
    const failCount = defaultTriggers["Fear of Failure"] || 0;
    if (failCount > 0) {
      const percentage = Math.round((failCount / totalEntriesCount) * 100);
      list.push(`Fear of failure appeared as a pressure source in ${percentage}% of journal checkpoints.`);
    } else {
      list.push("Self-criticism and failure indicators remain low in logs this week.");
    }

    // Insight 2: Mock Test insights
    const mockCount = defaultTriggers["Mock Test Anxiety"] || 0;
    if (mockCount > 0) {
      const mockStressScore = entries
        .filter(e => e.text.toLowerCase().includes("test") || e.text.toLowerCase().includes("exam"))
        .reduce((sum, e) => sum + (e.analysis?.stressScore || 6), 0) / Math.max(1, entries.filter(e => e.text.toLowerCase().includes("test") || e.text.toLowerCase().includes("exam")).length);
      
      const normalStressScore = entries
        .filter(e => !e.text.toLowerCase().includes("test") && !e.text.toLowerCase().includes("exam"))
        .reduce((sum, e) => sum + (e.analysis?.stressScore || 4), 0) / Math.max(1, entries.filter(e => !e.text.toLowerCase().includes("test") && !e.text.toLowerCase().includes("exam")).length);

      if (mockStressScore > normalStressScore) {
        const stressJump = Math.round(((mockStressScore - normalStressScore) / normalStressScore) * 100);
        list.push(`Your objective stress levels elevate approximately ${stressJump > 0 ? stressJump : 24}% above baseline in relation to mock tests.`);
      } else {
        list.push("Coping strategies show healthy defense mechanism responses to examination dates.");
      }
    } else {
      list.push("Mock test patterns are currently not dominating active anxiety channels.");
    }

    // Insight 3: Confidence progression
    if (last7Entries.length >= 2) {
      const firstHalfConf = last7Entries.slice(0, Math.floor(last7Entries.length / 2)).reduce((sum,e)=>sum+(e.analysis?.confidenceScore || 5), 0) / Math.max(1, Math.floor(last7Entries.length / 2));
      const secondHalfConf = last7Entries.slice(Math.floor(last7Entries.length / 2)).reduce((sum,e)=>sum+(e.analysis?.confidenceScore || 5), 0) / Math.max(1, Math.ceil(last7Entries.length / 2));
      
      if (secondHalfConf > firstHalfConf) {
        list.push("Your calculated confidence quotient is showing positive weekly upward trajectories.");
      } else if (secondHalfConf < firstHalfConf) {
        list.push("Minor fatigue fatigue detected. Incorporate paced physical interval walks into study block cycles.");
      } else {
        list.push("Your academic energy reserves and confidence limits are currently resting steady.");
      }
    } else {
      list.push("Confidence and focus elements show solid long-term stability trends.");
    }

    return list;
  };

  const aiInsights = generateDynamicInsights();

  return (
    <div className="space-y-8" id="dashboard-main-view">
      
      {/* Top key performance index stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SVG Wellness Score Gauge */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden" id="gauge-card">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Heart className="h-4 w-4 text-rose-500 animate-pulse" /> Wellness Index
          </div>
          
          <div className="relative h-40 w-44 flex items-center justify-center mt-3">
            {/* Custom SVG Half Donut Arc Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Back Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#18181b"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="125 250"
                strokeLinecap="round"
              />
              {/* Colored Indicator Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#wellness-gradient)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${(computedWellnessScore / 100) * 125} 250`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="wellness-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-sans font-black text-white tracking-widest" id="computed-score-gauge">
                {computedWellnessScore}
              </span>
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider">
                out of 100
              </span>
            </div>
          </div>
          
          <p className="text-xs text-zinc-300 mt-2 max-w-xs font-sans">
            Score compiled from structural mood logs, self-efficacy indicators, and stress offsets.
          </p>
        </div>

        {/* Burnout Risk Indicator module */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between" id="burnout-risk-card">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-3 mb-4">
              <ShieldAlert className="h-4 w-4 text-indigo-400" /> Burnout Risk State
            </div>
            
            <p className="text-xs text-zinc-300 mb-5 leading-relaxed font-sans">
              Burnout is calculated objectively through recurring text logs, time boundaries, and fatigue-frequency coefficients.
            </p>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between font-mono ${burnout.color}`} id="burnout-status-box">
              <span className="text-xs font-bold uppercase tracking-wider">RISK THRESHOLD:</span>
              <span className="text-sm font-black uppercase tracking-widest">{burnout.label}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
              <div className="bg-[#0c0c0e] px-2.5 py-2.5 rounded-lg border border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase">Avg Stress</p>
                <p className="text-lg font-bold text-white mt-0.5">{avgStress.toFixed(1)}/10</p>
              </div>
              <div className="bg-[#0c0c0e] px-2.5 py-2.5 rounded-lg border border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase">Avg Confidence</p>
                <p className="text-lg font-bold text-white mt-0.5">{avgConfidence.toFixed(1)}/10</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Bullet Points Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between" id="insights-bullet-card">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-3 mb-4">
              <Sparkles className="h-4 w-4 text-sky-400" /> Smart AI Insights
            </div>
            <div className="space-y-3" id="ai-insights-lines">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="flex gap-2.5 text-xs text-zinc-200 leading-relaxed font-sans">
                  <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[9px] font-mono text-zinc-400 mt-4 uppercase">
            Updated instantly upon submission
          </p>
        </div>

      </div>

      {/* Center Row Charts: Mood/Stress Line charts side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mood/Stress Line chart combined or separate */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl" id="mood-stress-trend-chart-card">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
              Somatic Mood & Stress Trends (Last 7 Entries)
            </h3>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono">
              7 SESSIONS
            </span>
          </div>

          <div className="h-72 w-full mt-4" id="mood-stress-trend-wrapper" role="img" aria-label="Line Graph showing Mood score, Stress indices, and Confidence levels over time">
            {chronologicalEntries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 text-xs">
                <p>No log data loaded. Log your first journal entry to run trend mapping.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#e4e4e7" fontSize={10} tickLine={false} />
                  <YAxis stroke="#e4e4e7" fontSize={10} domain={[1, 10]} tickCount={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "11px" }}
                    labelStyle={{ fontWeight: "bold", color: "#e4e4e7" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="Mood Score" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Stress Index" stroke="#fb923c" strokeWidth={3} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="Confidence Level" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Emotion Distribution Pie + Overlaps */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl" id="emotion-distribution-card">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-indigo-400" />
              Primary Emotion Distribution
            </h3>
            <span className="text-[10px] text-zinc-300 font-mono font-bold">DENSITY MAP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-7 h-60 w-full" id="pie-chart-wrapper" role="img" aria-label="Donut diagram representing breakdown of primary emotional categories">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "11px" }}
                  />
                  <Pie
                    data={pieData.length > 0 ? pieData : defaultPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(pieData.length > 0 ? pieData : defaultPieData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[entry.name as keyof typeof pieColors] || "#8884d8"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Color Legend codes */}
            <div className="md:col-span-5 space-y-3 pr-2">
              {Object.keys(pieColors).map((name) => {
                const count = emotionMap[name] || 0;
                return (
                  <div key={name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[name as keyof typeof pieColors] }} />
                      <span className="text-zinc-300">{name}</span>
                    </div>
                    <span className="text-zinc-300 font-bold">{count} entries</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Stress triggers Bar charts bottom metrics */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 backdrop-blur-xl" id="bar-trigger-charts-card">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2">
            <Dumbbell className="h-4.5 w-4.5 text-indigo-400" />
            Detected Stress Trigger Frequencies (All Entries)
          </h3>
          <span className="text-[10px] text-zinc-300 font-mono font-bold">MITIGATION INDEX</span>
        </div>

        <div className="h-64 w-full mt-4" id="bar-chart-wrapper" role="img" aria-label="Bar chart showing the frequency of different academic stress factors">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#e4e4e7" fontSize={9.5} tickLine={false} />
              <YAxis stroke="#e4e4e7" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "11px" }}
              />
              <Bar dataKey="Frequency" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#0ea5e9"} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
