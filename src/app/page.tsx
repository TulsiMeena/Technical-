"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Lock, Fingerprint, Mic, MonitorSmartphone } from "lucide-react";

// Simple animated particle background
function HolographicParticles() {
  const meshRef = useRef<any>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function LoginScreen() {
  const [time, setTime] = useState<Date | null>(null);
  const [step, setStep] = useState<"init" | "setup" | "password" | "face" | "voice" | "dashboard">("init");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);

    // Check if system is initialized
    fetch("/api/auth/status")
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          if (data.setupNeeded) {
            setStep("setup");
          } else {
            setStep("password");
          }
        }, 3000);
      })
      .catch(() => {
        setTimeout(() => setStep("password"), 3000);
      });

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleAuthStep = async (currentStep: string) => {
    setErrorMsg("");
    if (currentStep === "setup") {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        setStep("face");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Setup failed");
      }
    } else if (currentStep === "password") {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput })
      });
      if (res.ok) {
        setStep("face");
      } else {
        setErrorMsg("Access Denied");
      }
    } else if (currentStep === "face") {
      setStep("voice");
    } else if (currentStep === "voice") {
      // In real scenario, redirect to dashboard. Simulating for now.
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-nexus-primary selection:text-black">

      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <color attach="background" args={["#000308"]} />
          <ambientLight intensity={0.5} />
          <HolographicParticles />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">

        {/* Top Info Bar (Time/Date) */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-8 left-8 flex flex-col items-start"
        >
          <div className="text-4xl font-light tracking-wider">
            {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "00:00:00"}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-widest mt-1">
            {time ? time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }) : "Loading..."}
          </div>
        </motion.div>

        {/* Center Auth Card */}
        <AnimatePresence mode="wait">
          {step === "init" && (
            <motion.div
              key="init"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <h1 className="text-6xl font-thin tracking-[0.2em] glow-text text-nexus-primary">NEXUS</h1>
              <p className="mt-4 text-gray-400 tracking-widest uppercase text-xs">Initializing Secure Environment</p>
            </motion.div>
          )}

          {step !== "init" && step !== "dashboard" && (
            <motion.div
              key="auth-card"
              initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -20, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glass-panel rounded-3xl p-10 w-full max-w-md flex flex-col items-center relative overflow-hidden"
            >
              {/* Decorative Header */}
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-primary to-transparent opacity-50" />

              <div className="w-20 h-20 rounded-full border border-nexus-glass-border flex items-center justify-center mb-6 bg-black/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                {step === "password" && <Lock className="text-nexus-primary w-8 h-8" />}
                {step === "face" && <Fingerprint className="text-nexus-primary w-8 h-8" />}
                {step === "voice" && <Mic className="text-nexus-primary w-8 h-8" />}
              </div>

              <h2 className="text-xl font-light tracking-widest mb-8 text-center uppercase">
                {step === "setup" && "Setup Master Password"}
                {step === "password" && "Master Password"}
                {step === "face" && "Face Recognition"}
                {step === "voice" && "Voice Authorization"}
              </h2>

              {(step === "password" || step === "setup") && (
                <div className="w-full">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={step === "setup" ? "Create Passkey (Min 8)" : "Enter Passkey"}
                    className="w-full bg-black/30 border border-nexus-glass-border rounded-lg px-4 py-3 text-center tracking-widest outline-none focus:border-nexus-primary focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-300"
                    onKeyDown={(e) => e.key === "Enter" && handleAuthStep(step)}
                  />
                  {errorMsg && <p className="text-red-500 text-xs text-center mt-4 tracking-wider">{errorMsg}</p>}
                </div>
              )}

              {step === "face" && (
                <div className="w-full aspect-video bg-black/50 rounded-lg border border-nexus-glass-border flex items-center justify-center relative overflow-hidden cursor-pointer" onClick={() => handleAuthStep("face")}>
                  {/* Fake scanner line */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 w-full h-0.5 bg-nexus-primary shadow-[0_0_8px_#00f0ff] z-10"
                  />
                  <span className="text-sm text-gray-500 tracking-wider">Scanning bio-metrics... (Click to bypass)</span>
                </div>
              )}

              {step === "voice" && (
                <div className="w-full py-8 flex flex-col items-center justify-center cursor-pointer" onClick={() => handleAuthStep("voice")}>
                  <div className="flex gap-1 h-8 items-center justify-center">
                    {[1,2,3,4,5].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["20%", "100%", "20%"] }}
                        transition={{ repeat: Infinity, duration: Math.random() * 0.5 + 0.5, ease: "easeInOut" }}
                        className="w-1 bg-nexus-primary rounded-full shadow-[0_0_5px_#00f0ff]"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 tracking-wider mt-6">Say "Authorize" (Click to bypass)</span>
                </div>
              )}

            </motion.div>
          )}

          {step === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h1 className="text-4xl font-light tracking-widest glow-text text-nexus-primary mb-4">Welcome Home</h1>
              <p className="text-gray-400 tracking-wider">Access Granted. System Initialized.</p>

              {/* Dummy Sidebar/Layout hint */}
              <div className="mt-12 glass-panel w-[80vw] h-[60vh] rounded-2xl flex border border-nexus-glass-border">
                <div className="w-64 border-r border-nexus-glass-border p-6 flex flex-col gap-4">
                  <div className="h-8 w-full bg-white/5 rounded"></div>
                  <div className="h-8 w-3/4 bg-white/5 rounded"></div>
                  <div className="h-8 w-5/6 bg-white/5 rounded"></div>
                </div>
                <div className="flex-1 p-8">
                  <div className="h-full w-full bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-white/20 uppercase tracking-widest">
                    Workspace Area
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Bottom Status */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 flex gap-8 text-xs tracking-widest text-gray-500 uppercase"
        >
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span> SYSTEM SECURE</div>
          <div className="flex items-center gap-2"><MonitorSmartphone className="w-4 h-4" /> LOCAL NODE</div>
        </motion.div>

      </div>
    </div>
  );
}
