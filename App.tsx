import React, { useState } from 'react';
import { BenchmarkScene } from './components/BenchmarkScene';
import { UIOverlay } from './components/UIOverlay';

interface BenchmarkConfig {
  objectCount: number;
  enablePostProcessing: boolean;
  enableShadows: boolean;
  rotationSpeed: number;
  complexity: number;
}

function App() {
  const [config, setConfig] = useState<BenchmarkConfig>({
    objectCount: 5000,
    enablePostProcessing: true,
    enableShadows: true,
    rotationSpeed: 0.5,
    complexity: 0.2,
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-cyan-500 selection:text-black">
      
      {/* 3D Scene Background */}
      <BenchmarkScene 
        objectCount={config.objectCount}
        enablePostProcessing={config.enablePostProcessing}
        enableShadows={config.enableShadows}
        rotationSpeed={config.rotationSpeed}
        complexity={config.complexity}
      />

      {/* Foreground UI */}
      <UIOverlay config={config} setConfig={setConfig} />

    </div>
  );
}

export default App;
