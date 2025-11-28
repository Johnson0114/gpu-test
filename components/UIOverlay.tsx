import React from 'react';
import { Zap, Activity, Layers, Aperture, Monitor, AlertTriangle } from 'lucide-react';
import { useFPS } from '../hooks/useFPS';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UIOverlayProps {
  config: {
    objectCount: number;
    enablePostProcessing: boolean;
    enableShadows: boolean;
    rotationSpeed: number;
    complexity: number;
  };
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

// Helper to generate fake history data for the chart based on current FPS (simulated for visual)
const FPSChart = ({ fps }: { fps: number }) => {
    const [data, setData] = React.useState<{time: number, fps: number}[]>([]);

    React.useEffect(() => {
        setData(prev => {
            const next = [...prev, { time: Date.now(), fps }];
            if (next.length > 20) next.shift();
            return next;
        })
    }, [fps]);

    return (
        <div className="h-24 w-full mt-2 opacity-80">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="fps" stroke="#00f3ff" fillOpacity={1} fill="url(#colorFps)" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ config, setConfig }) => {
  const fps = useFPS();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Presets
  const setPreset = (level: 'low' | 'medium' | 'high' | 'extreme') => {
    switch (level) {
      case 'low':
        setConfig({ objectCount: 1000, enablePostProcessing: false, enableShadows: false, rotationSpeed: 0.5, complexity: 0.1 });
        break;
      case 'medium':
        setConfig({ objectCount: 5000, enablePostProcessing: true, enableShadows: true, rotationSpeed: 1, complexity: 0.3 });
        break;
      case 'high':
        setConfig({ objectCount: 25000, enablePostProcessing: true, enableShadows: true, rotationSpeed: 2, complexity: 0.7 });
        break;
      case 'extreme':
        setConfig({ objectCount: 100000, enablePostProcessing: true, enableShadows: true, rotationSpeed: 5, complexity: 1.0 });
        break;
    }
  };

  // Dynamic Color based on FPS
  const fpsColor = fps > 50 ? 'text-cyber-blue' : fps > 20 ? 'text-cyber-yellow' : 'text-cyber-neon';

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="pointer-events-auto bg-cyber-black/80 backdrop-blur-md border-l-4 border-cyber-neon p-4 rounded-r-lg shadow-[0_0_15px_rgba(255,0,60,0.3)]">
            <h1 className="text-3xl font-black tracking-tighter italic text-white uppercase flex items-center gap-2">
                <Zap className="text-cyber-neon" />
                GPU Inferno
            </h1>
            <p className="text-xs text-gray-400 font-mono tracking-widest">WEBGL STRESS TEST // V1.0</p>
        </div>

        {/* Stats Panel */}
        <div className="pointer-events-auto w-64 bg-cyber-black/80 backdrop-blur-md border-r-4 border-cyber-blue p-4 rounded-l-lg shadow-[0_0_15px_rgba(0,243,255,0.2)]">
             <div className="flex justify-between items-end">
                 <span className="text-gray-400 font-mono text-sm">FRAMERATE</span>
                 <span className={`text-5xl font-mono font-bold ${fpsColor}`}>{fps}</span>
             </div>
             <FPSChart fps={fps} />
             <div className="mt-2 flex justify-between text-xs font-mono text-gray-500">
                 <span>OBJ: {(config.objectCount / 1000).toFixed(1)}k</span>
                 <span>GPU LOAD: {(config.complexity * 100).toFixed(0)}%</span>
             </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pointer-events-auto w-full max-w-2xl mx-auto bg-cyber-dark/90 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
        <div 
            className="bg-cyber-panel px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-900"
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            <div className="flex items-center gap-2 font-bold text-white">
                <Activity size={18} className="text-cyber-blue"/>
                Control Center
            </div>
            <span className="text-xs font-mono bg-cyber-neon text-black px-2 py-1 rounded font-bold">
                {isCollapsed ? 'EXPAND' : 'COLLAPSE'}
            </span>
        </div>

        {!isCollapsed && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Presets */}
            <div className="col-span-1 md:col-span-2 flex gap-2 justify-center mb-4">
                {['low', 'medium', 'high', 'extreme'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setPreset(level as any)}
                        className="px-6 py-2 font-mono uppercase text-xs font-bold border border-gray-700 hover:border-cyber-blue hover:text-cyber-blue hover:bg-cyber-blue/10 transition-all rounded"
                    >
                        {level}
                    </button>
                ))}
            </div>

            {/* Left Column */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="flex justify-between text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-2"><Layers size={14}/> INSTANCE COUNT</span>
                        <span className="text-cyber-blue">{config.objectCount}</span>
                    </label>
                    <input 
                        type="range" min="1000" max="200000" step="1000"
                        value={config.objectCount}
                        onChange={(e) => setConfig({...config, objectCount: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-blue"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="flex justify-between text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-2"><Zap size={14}/> GEOMETRY COMPLEXITY</span>
                        <span className="text-cyber-yellow">{(config.complexity * 100).toFixed(0)}%</span>
                    </label>
                    <input 
                        type="range" min="0" max="1" step="0.01"
                        value={config.complexity}
                        onChange={(e) => setConfig({...config, complexity: parseFloat(e.target.value)})}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyber-yellow"
                    />
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="flex justify-between text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-2"><Aperture size={14}/> POST-FX & LIGHTING</span>
                    </label>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setConfig({...config, enablePostProcessing: !config.enablePostProcessing})}
                            className={`flex-1 py-2 text-xs border ${config.enablePostProcessing ? 'border-cyber-neon bg-cyber-neon/10 text-cyber-neon' : 'border-gray-700 text-gray-500'}`}
                        >
                            POST-PROCESS
                        </button>
                         <button 
                            onClick={() => setConfig({...config, enableShadows: !config.enableShadows})}
                            className={`flex-1 py-2 text-xs border ${config.enableShadows ? 'border-cyber-neon bg-cyber-neon/10 text-cyber-neon' : 'border-gray-700 text-gray-500'}`}
                        >
                            SHADOWS
                        </button>
                    </div>
                </div>

                 <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded flex items-start gap-3 mt-2">
                    <AlertTriangle className="text-yellow-500 shrink-0" size={16} />
                    <p className="text-[10px] text-yellow-500 leading-tight font-mono">
                        WARNING: "Extreme" preset may crash browser contexts on mobile devices or integrated graphics. Use with caution.
                    </p>
                </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};
