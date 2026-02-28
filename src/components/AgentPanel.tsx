import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ServerGame } from '../hooks/serverGame';
import { GameId } from '../../convex/factory/ids';
import { StatusBadge } from './StatusBadge';
import { Id } from '../../convex/_generated/dataModel';

export function AgentPanel({
  game,
  selectedAgentId,
  worldId,
}: {
  game: ServerGame;
  selectedAgentId: GameId<'agents'> | null;
  worldId: Id<'worlds'>;
}) {
  const agent = selectedAgentId ? game.world.agents.get(selectedAgentId) : null;
  const desc = selectedAgentId ? game.agentDescriptions.get(selectedAgentId) : null;

  // Get work logs if agent has a current subtask
  const subtaskId = agent?.currentSubtaskId as Id<'subtasks'> | undefined;
  const workLogs = useQuery(
    api.factory.prompts.getWorkLogs,
    subtaskId ? { subtaskId } : 'skip',
  );

  if (!agent || !desc) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold text-factory-200 mb-4">Agents</h3>
        <div className="space-y-2">
          {[...game.world.agents.values()].map((a) => {
            const d = game.agentDescriptions.get(a.id);
            if (!d) return null;
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2 rounded bg-factory-800 border border-factory-700"
              >
                <span className="text-lg">{d.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-factory-200">{d.name}</div>
                  <div className="text-xs text-factory-400">{d.role}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Agent header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `#${desc.color.toString(16).padStart(6, '0')}` }}
        >
          {desc.emoji}
        </div>
        <div>
          <h3 className="text-lg font-bold text-factory-100">{desc.name}</h3>
          <div className="text-sm text-factory-400 capitalize">{desc.role}</div>
          <StatusBadge status={agent.status} />
        </div>
      </div>

      {/* Identity */}
      <div className="mb-4">
        <h4 className="text-xs uppercase text-factory-500 mb-1">Identity</h4>
        <p className="text-sm text-factory-300">{desc.identity}</p>
      </div>

      {/* Current task */}
      {agent.speechBubble && (
        <div className="mb-4">
          <h4 className="text-xs uppercase text-factory-500 mb-1">Current Activity</h4>
          <div className="p-2 rounded bg-factory-800 border border-factory-700 text-sm text-factory-200">
            {agent.speechBubble}
          </div>
        </div>
      )}

      {/* Work output */}
      {workLogs && workLogs.length > 0 && (
        <div>
          <h4 className="text-xs uppercase text-factory-500 mb-1">Work Output</h4>
          <div className="p-3 rounded bg-factory-900 border border-factory-700 text-sm text-factory-300 max-h-64 overflow-y-auto font-mono whitespace-pre-wrap">
            {workLogs.map((log: any) => log.content).join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
