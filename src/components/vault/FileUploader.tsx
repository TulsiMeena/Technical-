"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FileUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    setProgress(10);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const formData = new FormData();
      formData.append("file", acceptedFiles[i]);

      try {
        await fetch("/api/vault/upload", {
          method: "POST",
          body: formData,
        });
        setProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
      } catch (e) {
        console.error("Upload failed", e);
      }
    }

    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      onUploadComplete();
    }, 1000);
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`glass-panel border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragActive ? 'border-nexus-primary bg-nexus-primary/5' : 'border-nexus-glass-border hover:border-nexus-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-nexus-primary' : 'text-gray-400'}`} />
        <p className="text-lg tracking-widest uppercase font-light text-center">
          {isDragActive ? "Drop files here" : "Drag & Drop files"}
        </p>
        <p className="text-xs text-gray-500 mt-2 tracking-wider">or click to browse</p>
      </div>

      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 glass-panel p-4 rounded-xl"
          >
            <div className="flex justify-between text-xs tracking-wider mb-2 text-nexus-primary">
              <span>ENCRYPTING & SECURING</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-nexus-primary shadow-[0_0_10px_#00f0ff]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
