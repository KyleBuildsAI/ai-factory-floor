import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Stage } from '@pixi/react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PixiGame from './PixiGame';
import { AgentPanel } from './AgentPanel';
import { PromptInput } from './PromptInput';
import { PromptList } from './PromptList';
import { useServerGame } from '../hooks/serverGame';
import { useWorldHeartbeat } from '../hooks/useWorldHeartbeat';
import { GameId } from '../../convex/factory/ids';

function convexUrl(): string {
  const url = import.meta.env.VITE_CONVEX_URL as string;
  if (!url) throw new Error("Couldn't find the Convex deployment URL.");
  return url;
}

const convex = new ConvexReactClient(convexUrl(), { unsavedChangesWarning: false });

export default function Game() {
  useWorldHeartbeat();

  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const game = useServerGame(worldId);

  const [selectedAgentId, setSelectedAgentId] = useState<GameId<'agents'> | null>(null);

  if (!worldStatus || !game) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-factory-400 text-lg">Loading factory floor...</div>
      </div>
    );
  }

  const canvasWidth = 640;
  const canvasHeight = 480;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* PixiJS canvas */}
        <div className="flex-shrink-0 flex justify-center p-4 bg-factory-800">
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            options={{ backgroundColor: 0xf0f0f0 }}
          >
            <ConvexProvider client={convex}>
              <PixiGame
                game={game}
                width={canvasWidth}
                height={canvasHeight}
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
              />
            </ConvexProvider>
          </Stage>
        </div>

        {/* Prompt input + list */}
        <div className="flex-1 flex flex-col border-t border-factory-700 overflow-hidden">
          <div className="p-4 border-b border-factory-700">
            <PromptInput worldId={worldId} />
          </div>
          <div className="flex-1 overflow-y-auto">
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
