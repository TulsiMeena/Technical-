"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Folder, FileText, Image as ImageIcon, Video, Music, Calendar,
  CheckSquare, Search, BrainCircuit, HardDrive, Settings, ShieldAlert,
  Menu, X, Upload
} from "lucide-react";
import { FileUploader } from "@/components/vault/FileUploader";
import { FilePreviewModal } from "@/components/vault/FilePreviewModal";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";
import { TaskManager } from "@/components/tasks/TaskManager";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState("vault");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Vault States
  const [showUploader, setShowUploader] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/vault/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeModule === "vault") {
      fetchFiles();
    }
  }, [activeModule]);

  const getFileIcon = (ext: string) => {
    const l = ext.toLowerCase();
    if (l === ".pdf" || l === ".txt") return <FileText size={24} className="text-gray-300" />;
    if (l === ".png" || l === ".jpg" || l === ".jpeg" || l === ".webp") return <ImageIcon size={24} className="text-nexus-primary" />;
    if (l === ".mp4" || l === ".webm") return <Video size={24} className="text-nexus-secondary" />;
    if (l === ".mp3" || l === ".wav") return <Music size={24} className="text-green-400" />;
    return <FileText size={24} className="text-gray-500" />;
  };

  const modules = [
    { id: "home", label: "Home", icon: <BrainCircuit size={20} /> },
    { id: "vault", label: "Secure Vault", icon: <HardDrive size={20} /> },
    { id: "pdf", label: "Documents", icon: <FileText size={20} /> },
    { id: "images", label: "Images", icon: <ImageIcon size={20} /> },
    { id: "videos", label: "Videos", icon: <Video size={20} /> },
    { id: "audio", label: "Audio", icon: <Music size={20} /> },
    { id: "calendar", label: "Calendar", icon: <Calendar size={20} /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden selection:bg-nexus-primary selection:text-black font-sans">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-nexus-bg-navy via-black to-black z-0 pointer-events-none opacity-80" />

      {/* Left Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-64 h-full glass-panel border-r border-nexus-glass-border flex flex-col"
      >
        <div className="p-6 flex items-center justify-between border-b border-nexus-glass-border">
          <h1 className="text-2xl font-light tracking-[0.2em] glow-text text-nexus-primary">NEXUS</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4 scrollbar-hide">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-4 px-4">Modules</div>
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeModule === m.id ? 'bg-nexus-primary/10 text-nexus-primary shadow-[inset_0_0_10px_rgba(0,240,255,0.1)] border border-nexus-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              {m.icon}
              <span className="tracking-wider text-sm">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-nexus-glass-border">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={20} />
            <span className="tracking-wider text-sm">Settings</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 glass-panel border-b border-nexus-glass-border flex items-center justify-between px-8">
          <div className="flex items-center gap-4 w-1/2">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
                <Menu size={24} />
              </button>
            )}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Universal Search..."
                className="w-full bg-black/40 border border-nexus-glass-border rounded-full py-2 pl-10 pr-4 text-sm tracking-wider outline-none focus:border-nexus-primary transition-all text-white"
              />

              {/* Search Results Dropdown */}
              {searchQuery.trim() !== "" && (
                <div className="absolute top-full mt-4 w-full bg-black/80 backdrop-blur-xl border border-nexus-glass-border rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-sm text-gray-400 tracking-wider text-center">Searching Intelligence Base...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400 tracking-wider text-center">No matching records found.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((res: any, idx: number) => (
                        <div key={idx} className="p-4 border-b border-nexus-glass-border hover:bg-nexus-primary/10 transition-colors cursor-pointer flex items-center justify-between">
                          <span className="truncate tracking-wider text-sm">{res.title}</span>
                          <span className="text-xs uppercase tracking-widest text-nexus-primary/60 border border-nexus-primary/20 rounded px-2 py-0.5 bg-nexus-primary/5">{res.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-red-500 transition-colors" title="Emergency Lock">
              <ShieldAlert size={20} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowAiAssistant(true)}>
              <div className="w-10 h-10 rounded-full border border-nexus-primary/50 bg-black/50 overflow-hidden flex items-center justify-center group-hover:bg-nexus-primary/20 transition-colors">
                <BrainCircuit className="text-nexus-primary" size={20} />
              </div>
              <div className="text-sm tracking-wider hidden sm:block group-hover:text-nexus-primary transition-colors">NEXUS Core</div>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace */}
        <div className="flex-1 overflow-auto p-8 relative">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {activeModule === "vault" && (
              <div className="space-y-8 pb-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-light tracking-widest uppercase">Secure Vault</h2>
                  <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="bg-nexus-primary/20 flex items-center gap-2 text-nexus-primary border border-nexus-primary/50 px-6 py-2 rounded-full tracking-wider hover:bg-nexus-primary/40 transition-colors"
                  >
                    <Upload size={18} /> {showUploader ? "Close Upload" : "Upload"}
                  </button>
                </div>

                {showUploader && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <FileUploader onUploadComplete={() => {
                      fetchFiles();
                      setShowUploader(false);
                    }} />
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {['Projects', 'Personal', 'Financial', 'Archives'].map((folder) => (
                    <div key={folder} className="glass-panel p-6 rounded-2xl border border-nexus-glass-border hover:border-nexus-primary/50 transition-colors cursor-pointer group">
                      <Folder className="text-nexus-secondary group-hover:text-nexus-primary transition-colors mb-4" size={32} />
                      <h3 className="tracking-wider">{folder}</h3>
                      <p className="text-xs text-gray-500 mt-2">Encrypted</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-nexus-glass-border">
                  <h3 className="text-xl font-light tracking-widest uppercase mb-6">Recent Files</h3>

                  {files.length === 0 ? (
                    <div className="glass-panel border border-nexus-glass-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                      <HardDrive size={48} className="text-gray-600 mb-4" />
                      <p className="text-gray-400 tracking-widest text-sm uppercase">Upload Module Ready</p>
                      <p className="text-gray-500 text-xs mt-2">No files securely indexed yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => setPreviewFile(file)}
                          className="glass-panel p-4 rounded-xl border border-nexus-glass-border hover:border-nexus-primary/50 transition-all cursor-pointer flex flex-col items-center text-center group relative overflow-hidden"
                        >
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-nexus-primary shadow-[0_0_5px_#00f0ff]" title="Encrypted" />
                          <div className="w-16 h-16 rounded-lg bg-black/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            {getFileIcon(file.extension)}
                          </div>
                          <h4 className="text-sm font-medium tracking-wide truncate w-full text-gray-200">{file.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModule === "tasks" && (
              <TaskManager />
            )}

            {activeModule !== "vault" && activeModule !== "tasks" && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 tracking-widest uppercase">
                <div className="glass-panel p-12 rounded-full mb-6">
                  <BrainCircuit size={48} className="text-nexus-primary/50 opacity-50" />
                </div>
                <p>Initializing {activeModule} module...</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Fullscreen Previews */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* AI Assistant */}
      {showAiAssistant && (
        <AIAssistantPanel onClose={() => setShowAiAssistant(false)} />
      )}
    </div>
  );
}
