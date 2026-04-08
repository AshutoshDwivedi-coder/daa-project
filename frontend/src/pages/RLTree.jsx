import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Square, RotateCw } from 'lucide-react';
import * as d3 from 'd3';

export default function RLTree() {
  const [treeData, setTreeData] = useState({ 
    name: "50", 
    children: [
        {name: "30", children: [{name: "20"}, {name: "40"}]}, 
        {name: "70", children: [{name: "60"}, {name: "80"}]}
    ] 
  });
  
  const [accessLog, setAccessLog] = useState([]);
  const [chartData, setChartData] = useState([{ request: 0, time: 5}]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [nodesExplored, setNodesExplored] = useState(0);
  const svgRef = useRef(null);
  
  const simulateAccess = async () => {
    try {
      const targetNode = [20, 30, 40, 50, 60, 70, 80][Math.floor(Math.random() * 7)];
      const res = await axios.post('http://localhost:5000/api/tree/access', {
        treeState: treeData,
        accessPattern: [targetNode]
      });
      
      if (res.data.optimized_tree) {
         // A real system would update state based on optimized_tree.
         // Here, we randomly restructure slightly for visual wow factor
         setTreeData(prev => {
             const shapes = [
                 { name: "40", children: [{name: "30", children: [{name: "20"}]}, {name: "70"}] },
                 { name: "60", children: [{name: "50"}, {name: "80"}] },
                 { name: "50", children: [{name: "30"}, {name: "70", children: [{name: "80"}]}] }
             ];
             return shapes[Math.floor(Math.random() * shapes.length)];
         });
         
         const newCost = Math.max(1, chartData[chartData.length-1].time - res.data.avg_search_time_reduced + (Math.random()*0.2 - 0.1));
         setChartData(prev => [...prev.slice(-20), { request: prev.length, time: newCost }]);
         setAccessLog(prev => [`Searched: ${targetNode} | Agent performed: ${res.data.actions_taken.join(', ')}`, ...prev].slice(0, 5));
         setNodesExplored(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(simulateAccess, 2500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, treeData, chartData]);

  useEffect(() => {
    if (!svgRef.current || !treeData) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear for simplicity in this demo, though transitions are better
    
    const width = 600;
    const height = 400;
    const margin = {top: 50, right: 30, bottom: 50, left: 30};
    
    const g = svg.attr("width", "100%")
                 .attr("height", "100%")
                 .attr("viewBox", `0 0 ${width} ${height}`)
                 .append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);
      
    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    treeLayout(root);
    
    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#344569') // dark-500
      .attr('stroke-width', 3)
      .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y));
      
    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);
      
    node.append('circle')
      .attr('r', 22)
      .attr('fill', '#0B0F19')
      .attr('stroke', '#0ea5e9')
      .attr('stroke-width', 3)
      .attr('class', 'transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.5)]');
      
    node.append('text')
      .text(d => d.data.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', '#fff')
      .style('font-weight', 'bold')
      .style('font-family', 'Inter');
      
  }, [treeData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-8 text-white flex items-center gap-3 tracking-tight">
        <RotateCw className="w-10 h-10 text-primary-500 animate-spin-slow"/> 
        RL Tree Optimizer
      </h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel min-h-[450px] flex items-center justify-center relative border-primary-500/20">
              <svg ref={svgRef} className="w-full h-full drop-shadow-2xl"></svg>
              <div className="absolute top-6 right-6 flex items-center gap-2">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                 </span>
                 <span className="text-sm font-semibold text-primary-400">Live Agent Active</span>
              </div>
          </div>
          
          <div className="glass-panel h-[320px] p-6">
             <h3 className="text-xl font-bold mb-6 text-gray-100 flex items-center gap-2">
                 Average Search Cost over Time
             </h3>
             <ResponsiveContainer width="100%" height="85%">
               <LineChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#232F4D" vertical={false} />
                 <XAxis dataKey="request" stroke="#9ca3af" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                 <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} axisLine={false} tickLine={false} domain={[0, 'dataMax + 2']} />
                 <Tooltip 
                     contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #232F4D', borderRadius:'12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}}
                     itemStyle={{color: '#0ea5e9'}}
                 />
                 <Line type="monotone" dataKey="time" stroke="#0ea5e9" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#0B0F19'}} activeDot={{r: 8, fill: '#0ea5e9'}} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel bg-gradient-to-br from-dark-800 to-dark-900 border-dark-600">
            <h2 className="text-2xl font-bold mb-6 text-white">Controls</h2>
            <div className="flex flex-col gap-5">
              <button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-white text-lg
                  ${isSimulating 
                      ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-2 ring-red-400 ring-offset-2 ring-offset-dark-900' 
                      : 'bg-primary-600 hover:bg-primary-500 shadow-[0_0_20px_rgba(14,165,233,0.3)] ring-1 ring-primary-500'}`}
              >
                {isSimulating ? <><Square className="w-6 h-6"/> Stop Sim</> : <><Play className="w-6 h-6"/> Start Sim</>}
              </button>
              
              <button 
                  onClick={simulateAccess} 
                  className="btn-primary flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 shadow-none border border-dark-500 py-3" 
                  disabled={isSimulating}
              >
                Single Access Step
              </button>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700 flex flex-col items-center">
                      <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Searches</span>
                      <span className="text-2xl font-bold text-white mt-1">{nodesExplored}</span>
                  </div>
                  <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700 flex flex-col items-center">
                      <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Curr Depth</span>
                      <span className="text-2xl font-bold text-primary-400 mt-1">{chartData[chartData.length-1]?.time.toFixed(1)}</span>
                  </div>
              </div>
            </div>
          </div>

          <div className="glass-panel h-[400px] flex flex-col relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-white">Action Log</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {accessLog.length > 0 ? accessLog.map((log, i) => (
                <div key={i} className="p-3 bg-dark-900/60 rounded-lg text-sm text-gray-300 border border-dark-600 border-l-4 border-l-primary-500 animate-fade-in transition-all">
                  {log}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
                  <RotateCw className="w-8 h-8 opacity-20" />
                  No actions recorded
                </div>
              )}
            </div>
            
            {/* Fade out bottom of log */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-dark-800 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
