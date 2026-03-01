import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { StatusBadge } from './StatusBadge';

export function PromptList({ worldId }: { worldId: Id<'worlds'> }) {
  const prompts = useQuery(api.factory.prompts.listPrompts, { worldId });
  const [expandedId, setExpandedId] = useState<Id<'prompts'> | null>(null);

  if (!prompts || prompts.length === 0) {
    return (
      <div className="p-4 text-center text-factory-500 text-xs font-mono">
        No prompts yet. Submit one above to get started.
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {prompts.map((prompt: any) => (
        <div
          key={prompt._id}
          className="rounded bg-factory-800 border border-factory-700 overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === prompt._id ? null : prompt._id)}
            className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-factory-700 transition-colors"
          >
            <StatusBadge status={prompt.status} />
            <span className="flex-1 text-xs text-factory-200 truncate font-mono">{prompt.text}</span>
            <span className="text-[10px] text-factory-500 font-mono">
              {new Date(prompt.submittedAt).toLocaleTimeString()}
            </span>
          </button>
          {expandedId === prompt._id && (
            <ExpandedPrompt promptId={prompt._id} />
          )}
        </div>
      ))}
    </div>
  );
}

function ExpandedPrompt({ promptId }: { promptId: Id<'prompts'> }) {
  const data = useQuery(api.factory.prompts.getPromptWithSubtasks, { promptId });

  if (!data) return <div className="p-3 text-factory-500 text-xs font-mono">Loading...</div>;

  const { prompt, subtasks } = data;

  return (
    <div className="border-t border-factory-700 p-3 space-y-3 bg-factory-850">
      {/* Full prompt text */}
      <div>
        <h5 className="text-[10px] uppercase text-factory-500 tracking-wider mb-1">Prompt</h5>
        <p className="text-xs text-factory-300 font-mono">{prompt.text}</p>
      </div>

      {/* Subtasks */}
      {subtasks.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase text-factory-500 tracking-wider mb-1">
            Subtasks ({subtasks.length})
          </h5>
          <div className="space-y-1">
            {subtasks.map((st: any) => (
              <div
                key={st._id}
                className="flex items-center gap-2 p-2 rounded bg-factory-900 text-xs"
              >
                <StatusBadge status={st.status} />
                <span className="text-factory-300 flex-1 truncate font-mono">{st.title}</span>
                <span className="text-[10px] text-factory-500 uppercase font-mono">{st.assignedRole}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final output */}
      {prompt.finalOutput && (
        <div>
          <h5 className="text-[10px] uppercase text-factory-500 tracking-wider mb-1">Output</h5>
          <div className="p-2 rounded bg-factory-950 border border-factory-700 text-xs text-factory-300 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
            {prompt.finalOutput}
          </div>
        </div>
      )}
    </div>
  );
}
