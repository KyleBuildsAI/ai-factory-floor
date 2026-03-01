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

  const subtaskId = agent?.currentSubtaskId as Id<'subtasks'> | undefined;
  const workLogs = useQuery(
    api.factory.prompts.getWorkLogs,
    subtaskId ? { subtaskId } : 'skip',
  );

  if (!agent || !desc) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-bold text-factory-300 mb-3 uppercase tracking-wider">
          Agents
        </h3>
        <div className="space-y-1.5">
          {[...game.world.agents.values()].map((a) => {
            const d = game.agentDescriptions.get(a.id);
            if (!d) return null;
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2 rounded bg-factory-800 border border-factory-700 hover:border-factory-600 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: `#${d.color.toString(16).padStart(6, '0')}30` }}
                >
                  <span>{d.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-factory-200">{d.name}</div>
                  <div className="text-[10px] text-factory-500 uppercase">{d.role}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const colorHex = `#${desc.color.toString(16).padStart(6, '0')}`;

  return (
    <div className="p-4">
      {/* Agent header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-factory-700">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${colorHex}30`, border: `2px solid ${colorHex}60` }}
        >
          {desc.emoji}
        </div>
        <div>
          <h3 className="text-base font-bold text-factory-50">{desc.name}</h3>
          <div className="text-[10px] text-factory-400 uppercase tracking-wider mb-1">{desc.role}</div>
          <StatusBadge status={agent.status} />
        </div>
      </div>

      {/* Identity */}
      <div className="mb-4">
        <h4 className="text-[10px] uppercase text-factory-500 tracking-wider mb-1">Identity</h4>
        <p className="text-xs text-factory-300 leading-relaxed">{desc.identity}</p>
      </div>

      {/* Current task */}
      {agent.speechBubble && (
        <div className="mb-4">
          <h4 className="text-[10px] uppercase text-factory-500 tracking-wider mb-1">Activity</h4>
          <div className="p-2 rounded bg-factory-800 border border-factory-700 text-xs text-factory-200 font-mono">
            {agent.speechBubble}
          </div>
        </div>
      )}

      {/* Work output */}
      {workLogs && workLogs.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase text-factory-500 tracking-wider mb-1">Output</h4>
          <div className="p-2 rounded bg-factory-950 border border-factory-700 text-xs text-factory-300 max-h-64 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
            {workLogs.map((log: any) => log.content).join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}
