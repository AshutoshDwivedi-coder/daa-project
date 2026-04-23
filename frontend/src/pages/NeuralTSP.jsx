import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BrainCircuit, Shuffle, Zap, Activity, Timer, TrendingDown } from 'lucide-react';

export default function NeuralTSP() {
  const [nodes, setNodes] = useState([]);
  // Edges for the currently-active phase
  const [edges, setEdges] = useState([]);
  const [prunedEdges, setPrunedEdges] = useState([]);
  const [isSolving, setIsSolving] = useState(false);

  // Phase: IDLE → BRUTE → PAUSE → ML → DONE
  const [phase, setPhase] = useState('IDLE');

  // Real metrics from backend
  const [metrics, setMetrics] = useState({
    bruteNodes: 0, bruteTime: 0, bruteCost: 0,
    mlNodes: 0, mlTime: 0, mlCost: 0,
    speedImprovement: 0, costImprovement: 0, score: 0
  });

  // Counter that ticks up during animation
  const [liveCounter, setLiveCounter] = useState(0);

  const generateRandomGraph = () => {
    const numNodes = 10;
    const newNodes = [];
    for (let i = 0; i < numNodes; i++) {
      newNodes.push({
        id: i,
        cx: Math.random() * 76 + 12,
        cy: Math.random() * 76 + 12
      });
    }
    setNodes(newNodes);
    setEdges([]);
    setPrunedEdges([]);
    setPhase('IDLE');
    setLiveCounter(0);
    setMetrics({
      bruteNodes: 0, bruteTime: 0, bruteCost: 0,
      mlNodes: 0, mlTime: 0, mlCost: 0,
      speedImprovement: 0, costImprovement: 0, score: 0
    });
  };

  useEffect(() => { generateRandomGraph(); }, []);

  // ─── Main solve handler ────────────────────────────────────────────
  const solveTSP = async () => {
    setIsSolving(true);
    setEdges([]);
    setPrunedEdges([]);
    setLiveCounter(0);

    try {
      const reqNodes = nodes.map(n => ({ x: n.cx, y: n.cy }));
      const apiUrl = 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/tsp/solve`, { coordinates: reqNodes });
      const data = res.data;

      // ── PHASE 1: BRUTE FORCE (slow, no pruning) ───────────────────
      setPhase('BRUTE');
      await animatePath(data.brute_path, 450, data.brute_nodes);

      // Brief pause between runs
      setPhase('PAUSE');
      setEdges([]);
      await sleep(1800);

      // ── PHASE 2: ML OPTIMISED (fast, with pruning) ────────────────
      setPrunedEdges(data.pruned_branches || []);
      setPhase('ML');
      setLiveCounter(0);
      await animatePath(data.ml_path, 120, data.ml_nodes);

      // ── DONE ──────────────────────────────────────────────────────
      setPhase('DONE');
      setIsSolving(false);
      setMetrics({
        bruteNodes: data.brute_nodes,
        bruteTime: data.brute_time_ms,
        bruteCost: data.brute_cost,
        mlNodes: data.ml_nodes,
        mlTime: data.ml_time_ms,
        mlCost: data.ml_cost,
        speedImprovement: data.speed_improvement,
        costImprovement: data.cost_improvement,
        score: data.score
      });
    } catch (e) {
      console.error(e);
      setIsSolving(false);
      setPhase('IDLE');
    }
  };

  // Animate a path step-by-step with a given delay per edge
  const animatePath = (path, delayMs, totalNodes) => {
    return new Promise(resolve => {
      let step = 0;
      const built = [];
      const nodesPerStep = Math.ceil(totalNodes / path.length);
      const iv = setInterval(() => {
        if (step < path.length) {
          const src = path[step];
          const tgt = path[(step + 1) % path.length];
          built.push({ source: src, target: tgt });
          setEdges([...built]);
          setLiveCounter(prev => prev + nodesPerStep);
          step++;
        } else {
          clearInterval(iv);
          resolve();
        }
      }, delayMs);
    });
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ─── Derived data ──────────────────────────────────────────────────
  const barData = [
    { name: 'Brute Force', value: metrics.bruteNodes, fill: '#6b7280' },
    { name: 'ML Guided',   value: metrics.mlNodes,    fill: '#a855f7' },
  ];

  const edgeColor = phase === 'BRUTE' ? '#6b7280' : '#a855f7';
  const nodeStroke = phase === 'BRUTE' ? '#6b7280' : '#a855f7';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-8 text-white flex items-center gap-3 tracking-tight">
        <BrainCircuit className="w-10 h-10 text-accent-500 animate-pulse-slow" />
        Neural Branch &amp; Bound
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ─── GRAPH CANVAS ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 glass-panel min-h-[550px] relative overflow-hidden border-accent-500/20">
          <svg className="absolute inset-0 w-full h-full p-6">
            {/* Pruned edges (only visible during ML phase) */}
            {prunedEdges.map((e, i) => {
              const s = nodes.find(n => n.id === e[0]);
              const t = nodes.find(n => n.id === e[1]);
              if (!s || !t) return null;
              return (
                <line key={`pr-${i}`}
                  x1={`${s.cx}%`} y1={`${s.cy}%`} x2={`${t.cx}%`} y2={`${t.cy}%`}
                  className="stroke-red-500/40" strokeWidth="2" strokeDasharray="6 6" />
              );
            })}

            {/* Active edges */}
            {edges.map((e, i) => {
              const s = nodes.find(n => n.id === e.source);
              const t = nodes.find(n => n.id === e.target);
              if (!s || !t) return null;
              return (
                <line key={`e-${i}`}
                  x1={`${s.cx}%`} y1={`${s.cy}%`} x2={`${t.cx}%`} y2={`${t.cy}%`}
                  stroke={edgeColor} strokeWidth="4" strokeLinecap="round"
                  className={phase === 'ML' ? 'animate-pulse' : ''} />
              );
            })}

            {/* Nodes */}
            {nodes.map(n => (
              <g key={n.id}>
                <circle cx={`${n.cx}%`} cy={`${n.cy}%`} r="16"
                  className="fill-dark-900" stroke={nodeStroke} strokeWidth="3"
                  style={{ filter: phase !== 'BRUTE' ? 'drop-shadow(0 0 10px rgba(168,85,247,0.4))' : 'none' }} />
                <text x={`${n.cx}%`} y={`${n.cy}%`} dy="5" textAnchor="middle"
                  className="fill-white font-bold text-xs font-mono">{n.id}</text>
              </g>
            ))}
          </svg>

          {/* ── Phase banner ─────────────────────────────────────────── */}
          <div className="absolute top-5 left-5">
            {phase === 'BRUTE' && (
              <div className="bg-gray-800/90 text-gray-200 px-4 py-2 rounded-lg font-bold border border-gray-600 animate-pulse flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Phase 1 — Brute Force (slow)
              </div>
            )}
            {phase === 'PAUSE' && (
              <div className="bg-dark-800/90 text-yellow-300 px-4 py-2 rounded-lg font-bold border border-yellow-600/50 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Switching to ML optimised solver…
              </div>
            )}
            {phase === 'ML' && (
              <div className="bg-accent-900/50 text-accent-300 px-4 py-2 rounded-lg font-bold border border-accent-500/50 animate-pulse flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                Phase 2 — Neural B&amp;B (fast)
              </div>
            )}
          </div>

          {/* Live node counter */}
          {(phase === 'BRUTE' || phase === 'ML') && (
            <div className="absolute bottom-5 left-5 bg-dark-900/80 backdrop-blur px-4 py-2 rounded-lg border border-dark-600 text-sm font-mono text-gray-300">
              Nodes explored: <span className="text-white font-bold">{liveCounter.toLocaleString()}</span>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-5 right-5 flex flex-col gap-2 bg-dark-900/80 p-3 rounded-xl backdrop-blur-md border border-dark-600 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-5 h-[3px] rounded-full" style={{ background: edgeColor }}></div>
              Tour Path
            </div>
            {prunedEdges.length > 0 && (
              <div className="flex items-center gap-2 font-semibold text-gray-400">
                <div className="w-5 h-[3px] border-b-2 border-dashed border-red-500"></div>
                ML Pruned
              </div>
            )}
          </div>

          {/* ── Results overlay ──────────────────────────────────────── */}
          {phase === 'DONE' && (
            <div className="absolute inset-0 bg-dark-900/75 backdrop-blur-sm flex items-center justify-center animate-fade-in z-10">
              <div className="bg-dark-800 border border-accent-500/40 p-8 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.25)] text-center max-w-md w-full">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent mb-1">
                  Comparison Complete
                </h2>
                <p className="text-gray-400 text-sm mb-6">Same graph, two approaches</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-dark-900/60 p-4 rounded-xl border border-dark-600">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Brute Force</p>
                    <p className="text-2xl font-bold text-gray-300">{metrics.bruteNodes.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">nodes · {metrics.bruteTime}ms</p>
                  </div>
                  <div className="bg-accent-900/20 p-4 rounded-xl border border-accent-500/30">
                    <p className="text-accent-400 text-xs uppercase font-bold tracking-wider mb-1">ML Guided</p>
                    <p className="text-2xl font-bold text-white">{metrics.mlNodes.toLocaleString()}</p>
                    <p className="text-accent-300/70 text-xs">nodes · {metrics.mlTime}ms</p>
                  </div>
                </div>

                <div className="text-5xl font-extrabold text-white mb-1">
                  {metrics.speedImprovement}%
                  <span className="text-xl text-gray-400 font-medium ml-2">faster</span>
                </div>
                <p className="text-gray-400 text-sm mb-6 flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  Tour cost reduced by {metrics.costImprovement}%
                </p>

                <button onClick={() => setPhase('IDLE')} className="btn-accent w-full flex items-center justify-center gap-2">
                  View Final Path
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── SIDEBAR ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="glass-panel bg-gradient-to-br from-dark-800 to-dark-900">
            <h2 className="text-2xl font-bold mb-6 text-white">Solver Controls</h2>
            <div className="flex flex-col gap-4">
              <button onClick={solveTSP} disabled={isSolving}
                className="btn-accent flex justify-center items-center gap-2 py-4 text-xl w-full">
                {isSolving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {phase === 'BRUTE' ? 'Brute forcing…' : phase === 'ML' ? 'ML solving…' : 'Preparing…'}
                  </div>
                ) : (
                  <><Zap className="w-6 h-6" /> Run Comparison</>
                )}
              </button>
              <button onClick={generateRandomGraph} disabled={isSolving}
                className="bg-dark-800 hover:bg-dark-700 text-gray-200 border border-dark-600 flex justify-center items-center gap-2 py-3 rounded-xl transition-all shadow-md mt-2 font-semibold">
                <Shuffle className="w-5 h-5" /> New Graph
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="glass-panel">
            <h2 className="text-xl font-bold text-white mb-4">Nodes Explored</h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232F4D" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false}
                    tick={{ fill: '#9ca3af', fontWeight: 600, fontSize: 13 }} dy={10} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #232F4D', borderRadius: '12px' }}
                    itemStyle={{ color: '#a855f7', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {metrics.score > 0 && (
              <div className="mt-3 text-center">
                <span className="bg-accent-500/20 text-accent-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-accent-500/50">
                  Model Confidence: {(metrics.score * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
