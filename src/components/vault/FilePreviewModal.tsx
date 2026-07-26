"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Download } from "lucide-react";

export function FilePreviewModal({ file, onClose }: { file: any; onClose: () => void }) {
  if (!file) return null;

  const url = `/api/vault/preview/${file.id}`;
  const ext = file.extension?.toLowerCase();

  const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);
  const isVideo = [".mp4", ".webm", ".ogg"].includes(ext);
  const isAudio = [".mp3", ".wav", ".ogg"].includes(ext);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[80vh] glass-panel border border-nexus-glass-border rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="h-16 border-b border-nexus-glass-border flex items-center justify-between px-6 bg-black/50">
            <h3 className="tracking-widest font-light truncate max-w-[70%]">{file.name}</h3>
            <div className="flex items-center gap-4">
              <a href={url} download={file.name} className="text-gray-400 hover:text-nexus-primary transition-colors">
                <Download size={20} />
              </a>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Maximize2 size={20} />
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 bg-black/30 overflow-auto flex items-center justify-center relative p-4">
            {isImage ? (
              <img src={url} alt={file.name} className="max-w-full max-h-full object-contain rounded" />
            ) : isVideo ? (
              <video src={url} controls autoPlay className="max-w-full max-h-full rounded shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
            ) : isAudio ? (
              <div className="w-full max-w-md p-8 glass-panel rounded-xl flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-nexus-primary/20 flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-nexus-primary animate-pulse shadow-[0_0_20px_#00f0ff]" />
                </div>
                <audio src={url} controls autoPlay className="w-full" />
              </div>
            ) : (
              <iframe src={url} className="w-full h-full bg-white rounded" title="Document Preview" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
