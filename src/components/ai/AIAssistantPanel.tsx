"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, X, Mic, Send, Minimize2, Maximize2 } from "lucide-react";

type Message = { role: "user" | "ai"; text: string };

export function AIAssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hello. I am NEXUS. How may I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, minimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: "ai", text: data.reply || "Error processing request." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "System offline. Unable to process request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-50 glass-panel p-3 rounded-full cursor-pointer hover:bg-nexus-primary/20 transition-all border border-nexus-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        onClick={() => setMinimized(false)}
      >
        <BrainCircuit className="text-nexus-primary" size={28} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-6 z-50 w-96 h-[500px] glass-panel border border-nexus-glass-border rounded-2xl flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-nexus-glass-border bg-black/60 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-nexus-primary" size={20} />
          <span className="font-light tracking-widest text-sm uppercase text-nexus-primary glow-text">NEXUS AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMinimized(true)} className="text-gray-400 hover:text-white transition-colors">
            <Minimize2 size={16} />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm tracking-wider leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-nexus-primary/20 border border-nexus-primary/30 text-white rounded-tr-none'
                  : 'glass-panel border border-nexus-glass-border text-gray-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass-panel p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-nexus-primary rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-nexus-primary rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-nexus-primary rounded-full" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-nexus-glass-border bg-black/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setListening(!listening)}
            className={`p-2 rounded-full transition-colors ${listening ? 'bg-nexus-secondary/20 text-nexus-secondary shadow-[0_0_10px_#8a2be2]' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <Mic size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={listening ? "Listening..." : "Type a command..."}
            className="flex-1 bg-transparent border-none outline-none text-sm tracking-wider px-2"
          />
          <button onClick={handleSend} className="p-2 text-nexus-primary hover:bg-nexus-primary/20 rounded-full transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
