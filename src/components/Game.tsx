import { useState, useRef, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { Stage } from '@pixi/react';
import { ConvexProvider } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { convexClient } from './ConvexClientProvider';
import PixiGame from './PixiGame';
import { AgentPanel } from './AgentPanel';
import { PromptInput } from './PromptInput';
import { PromptList } from './PromptList';
import { useServerGame } from '../hooks/serverGame';
import { useWorldHeartbeat } from '../hooks/useWorldHeartbeat';
import { GameId } from '../../convex/factory/ids';

export default function Game() {
  useWorldHeartbeat();

  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const game = useServerGame(worldStatus?.worldId);

  const [selectedAgentId, setSelectedAgentId] = useState<GameId<'agents'> | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 720, h: 540 });

  // Responsive canvas sizing
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({
            w: Math.floor(Math.min(width, 960)),
            h: Math.floor(Math.min(height, 720)),
          });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!worldStatus || !game) {
    return (
      <div className="flex-1 flex items-center justify-center bg-factory-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
          <div className="text-factory-400 text-sm font-mono">Loading factory floor...</div>
        </div>
      </div>
    );
  }

  const worldId = worldStatus.worldId;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* PixiJS canvas */}
        <div
          ref={canvasRef}
          className="flex-1 flex items-center justify-center bg-[#1a1410] min-h-[300px]"
        >
          <Stage
            width={canvasSize.w}
            height={canvasSize.h}
            options={{ backgroundColor: 0x2a2018, antialias: false }}
          >
            <ConvexProvider client={convexClient}>
              <PixiGame
                game={game}
                width={canvasSize.w}
                height={canvasSize.h}
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
              />
            </ConvexProvider>
          </Stage>
        </div>

        {/* Prompt input + list */}
        <div className="flex flex-col border-t border-factory-700 max-h-[40vh] overflow-hidden">
          <div className="p-3 border-b border-factory-700 bg-factory-900">
            <PromptInput worldId={worldId} />
          </div>
          <div className="flex-1 overflow-y-auto bg-factory-950">
            <PromptList worldId={worldId} />
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-80 border-l border-factory-700 overflow-y-auto bg-factory-900">
        <AgentPanel
          game={game}
          selectedAgentId={selectedAgentId}
          worldId={worldId}
        />
      </div>
    </div>
  );
}
