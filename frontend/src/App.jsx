import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import RLTree from './pages/RLTree';
import NeuralTSP from './pages/NeuralTSP';
import { Network, TreeDeciduous } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-dark-900 text-gray-100 font-sans">
        {/* Navbar */}
        <nav className="bg-dark-800/80 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-primary-400 transition-colors">
                <div className="p-2 bg-primary-600/20 rounded-lg">
                  <Network className="w-6 h-6 text-primary-500" />
                </div>
                AI Algo Visualizer
              </Link>
              <div className="flex gap-4">
                <Link to="/rl-tree" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hover:bg-dark-700 flex items-center gap-2">
                  <TreeDeciduous className="w-4 h-4" />
                  RL Tree
                </Link>
                <Link to="/neural-tsp" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors hover:bg-dark-700 flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Neural TSP
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rl-tree" element={<RLTree />} />
            <Route path="/neural-tsp" element={<NeuralTSP />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
