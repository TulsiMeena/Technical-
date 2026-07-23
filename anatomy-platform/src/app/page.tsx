import Link from 'next/link';
import { Activity, BrainCircuit, Microscope, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="w-full px-8 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md fixed top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-400 w-6 h-6" />
          <span className="font-bold text-xl tracking-wide">NexusAnatomy</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#education" className="hover:text-white transition-colors">Education</Link>
          <Link href="/viewer" className="hover:text-blue-400 transition-colors">3D Viewer</Link>
        </div>
        <Link
          href="/viewer"
          className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Version 1.0 Live
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
          The Human Body, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Redefined in 3D.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 font-light leading-relaxed">
          Explore a world-class, premium interactive human anatomy platform. Open-source, insanely fast, and built for modern medical education.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/viewer"
            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="flex items-center justify-center px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-lg transition-colors border border-white/10"
          >
            View Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto border-t border-white/5 mt-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Activity className="text-blue-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Complete Systems</h3>
            <p className="text-gray-400 leading-relaxed">Interactive 3D models covering skeletal, muscular, nervous, and cardiovascular systems.</p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <BrainCircuit className="text-purple-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Disease Library</h3>
            <p className="text-gray-400 leading-relaxed">Detailed pathological data, symptoms, and treatments linked directly to corresponding organs.</p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6">
              <Microscope className="text-green-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Zero Config</h3>
            <p className="text-gray-400 leading-relaxed">No API keys required. Open-source SQLite database auto-seeds for immediate local development.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
