import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Share2, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in text-center flex flex-col items-center">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -z-10 mix-blend-screen"></div>
      
      <h1 className="text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent drop-shadow-sm">
        Next-Gen Algorithm Visualizer
      </h1>
      <p className="text-xl text-gray-400 max-w-3xl mb-12">
        Explore advanced Machine Learning algorithms interacting with classic data structures and optimization problems. Watch in real-time as Neural Networks and Reinforcement Learning agents learn to solve complex challenges.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
        {/* RL Tree Card */}
        <div className="glass-panel group hover:border-primary-500/50 transition-all cursor-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <Share2 className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">RL Tree Optimizer</h2>
          </div>
          <p className="text-gray-400 mb-6 min-h-[80px]">
            Watch a Reinforcement Learning agent restructure a Binary Search Tree dynamically based on access patterns.
          </p>
          <Link to="/rl-tree" className="btn-primary w-full flex items-center justify-center gap-2">
            Explore RL Tree <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Neural TSP Card */}
        <div className="glass-panel group hover:border-accent-500/50 transition-all cursor-default">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent-500/20 rounded-xl group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-8 h-8 text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Neural B&B (TSP)</h2>
          </div>
          <p className="text-gray-400 mb-6 min-h-[80px]">
            Observe a Neural Network assist a Branch and Bound solver in predicting the optimal path for the TSP, pruning poor branches early.
          </p>
          <Link to="/neural-tsp" className="btn-accent w-full flex items-center justify-center gap-2">
            Explore Neural TSP <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-12 opacity-50 justify-center flex-wrap">
         <div className="flex items-center gap-2"><Activity className="w-5 h-5"/> Real-time visualization</div>
         <div className="flex items-center gap-2"><Activity className="w-5 h-5"/> PyTorch Models</div>
         <div className="flex items-center gap-2"><Activity className="w-5 h-5"/> Vite + React</div>
         <div className="flex items-center gap-2"><Activity className="w-5 h-5"/> FastAPI + Express</div>
      </div>
    </div>
  );
}
