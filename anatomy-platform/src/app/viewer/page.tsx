'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AnatomyViewer from '@/components/3d/AnatomyViewer';
import { ArrowLeft, Info, Activity, ShieldAlert, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ViewerPage() {
  const [organs, setOrgans] = useState<any[]>([]);
  const [selectedOrgan, setSelectedOrgan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/organs')
      .then(res => res.json())
      .then(data => {
        setOrgans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">

      {/* LEFT SIDEBAR: Controls & List */}
      <aside className="w-80 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h2 className="text-xl font-bold text-white tracking-wide">Organs</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="text-gray-500 text-sm text-center py-10 animate-pulse">Loading anatomy database...</div>
          ) : (
            organs.map(organ => (
              <button
                key={organ.id}
                onClick={() => setSelectedOrgan(organ)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedOrgan?.id === organ.id
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                    : 'bg-white/5 border border-transparent hover:bg-white/10 text-gray-300'
                }`}
              >
                <div className="font-semibold">{organ.name}</div>
                <div className="text-xs opacity-60 mt-1 font-mono">{organ.system} System</div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* CENTER: 3D Canvas */}
      <main className="flex-1 relative p-4">
        <AnatomyViewer
          organs={organs}
          selectedOrgan={selectedOrgan}
          onSelectOrgan={setSelectedOrgan}
        />
      </main>

      {/* RIGHT SIDEBAR: Details Panel */}
      <AnimatePresence>
        {selectedOrgan && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[400px] h-full bg-[#0a0a0a]/80 backdrop-blur-2xl border-l border-white/10 flex flex-col z-20 shrink-0 absolute right-0 top-0 shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">{selectedOrgan.name}</h2>
                <div className="text-sm font-mono text-blue-400 mt-1">{selectedOrgan.scientificName}</div>
              </div>
              <button onClick={() => setSelectedOrgan(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Description */}
              <section>
                <div className="flex items-center gap-2 text-gray-400 mb-3 uppercase tracking-wider text-xs font-bold">
                  <Info className="w-4 h-4" /> Description
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{selectedOrgan.description}</p>
              </section>

              {/* Function */}
              <section>
                <div className="flex items-center gap-2 text-gray-400 mb-3 uppercase tracking-wider text-xs font-bold">
                  <Activity className="w-4 h-4" /> Primary Function
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20">
                  <p className="text-blue-100 text-sm leading-relaxed">{selectedOrgan.function}</p>
                </div>
              </section>

              {/* Diseases */}
              <section>
                <div className="flex items-center gap-2 text-red-400 mb-3 uppercase tracking-wider text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" /> Associated Pathologies
                </div>
                <div className="space-y-3">
                  {selectedOrgan.diseases?.length > 0 ? (
                    selectedOrgan.diseases.map((disease: any) => (
                      <div key={disease.id} className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30">
                        <h4 className="font-bold text-red-200 mb-1">{disease.name}</h4>
                        <p className="text-xs text-red-200/70 mb-2">{disease.description}</p>
                        <div className="text-xs text-red-300 font-medium bg-red-900/40 inline-block px-2 py-1 rounded">
                          Symptoms: {disease.symptoms}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No diseases recorded.</div>
                  )}
                </div>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
