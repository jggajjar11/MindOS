import { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProfile, JournalEntry } from "../types";
import { MessageSquare, Send, Sparkles, User, Brain, ArrowDownCircle, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface CoachChatProps {
  profile: UserProfile;
  recentEntries: JournalEntry[];
}

export default function CoachChat({ profile, recentEntries }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-coach",
      sender: "coach",
      text: `Hello ${profile.name}! I am your MindOS AI Wellness Coach. 

Whether you are coping with ${profile.examType} deadlines, experiencing parental pressures, feeling unmotivated, or simply need an active breathing anchor, I am here. 

What is occupying your focus today? Feel free to pick a prompt below or type your chest details directly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { label: "High exam anxiety", text: "I have high exam anxiety about my upcoming test." },
    { label: "Parental pressure", text: "I feel like I am letting my family/parents down with my grades." },
    { label: "Losing focus", text: "I can't seem to focus for more than 20 minutes without comparison dread." },
    { label: "1-Min Somatic Calm", text: "Give me a quick 1-minute somatic breathing exercise to do right now." },
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ sender: m.sender, text: m.text })),
          profile,
          recentEntries,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat api failed");
      }

      const data = await response.json();
      
      const coachMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "coach",
        text: data.text || "I am processing your comments, let us stay breathing.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      console.error(err);
      
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "coach",
        text: "My apologies. I encountered a link disruption. Let us take a deep, slow breath together right now instead. Try sending your thoughts again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[600px]" id="coach-chat-card">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-sans font-bold text-white tracking-wide">AI Wellness Coach Terminal</h2>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Active coaching & active coping</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          COACH SECURE
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin" id="chat-messages-container">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            id={`msg-${m.id}`}
          >
            <div className={`rounded-full h-8 w-8 flex items-center justify-center shrink-0 border ${
              m.sender === "user" ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-300" : "bg-[#0c0c0e] border border-white/5 text-sky-400"
            }`}>
              {m.sender === "user" ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
            </div>

            <div>
              <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-[#0c0c0e] border border-white/5 text-zinc-200 rounded-tl-none font-sans"
              }`}>
                {m.sender === "coach" ? (
                  <div className="markdown-body space-y-2 whitespace-pre-wrap">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{m.text}</p>
                )}
              </div>
              <span className={`text-[9px] font-mono text-zinc-400 mt-1 block ${m.sender === "user" ? "text-right" : "text-left"}`}>
                {m.sender === "user" ? "YOU" : "CLINICAL COACH"} • {m.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex gap-3 max-w-[80%] mr-auto" id="msg-loading-indicator">
            <div className="rounded-full h-8 w-8 flex items-center justify-center bg-[#0c0c0e] border border-white/5 text-indigo-400 shrink-0">
              <Brain className="h-4 w-4 animate-pulse text-indigo-400" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-[#0c0c0e]/40 border border-white/5 px-4 py-3.5 text-xs text-zinc-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 pl-1">Coach is drafting coping scripts...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts */}
      <div className="shrink-0 mb-3 flex flex-wrap gap-1.5" id="suggested-prompts">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            disabled={isSending}
            onClick={() => handleSendMessage(p.text)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0c0c0e] hover:bg-white/5 border border-white/5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer font-sans"
          >
            📋 {p.label}
          </button>
        ))}
      </div>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex gap-2 shrink-0 border-t border-white/5 pt-3"
        id="chat-send-form"
      >
        <input
          id="chat-input-box"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="w-full bg-[#0c0c0e] border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-400 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
          placeholder="Ask about stress relief, exam mental strategy, or venting..."
          autoComplete="off"
          aria-label="Type message to AI wellness coach"
        />
        <button
          id="send-chat-message-btn"
          type="submit"
          disabled={!input.trim() || isSending}
          aria-label="Send message"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer active:scale-95 text-xs font-semibold gap-1 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
