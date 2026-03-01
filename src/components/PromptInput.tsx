import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export function PromptInput({ worldId }: { worldId: Id<'worlds'> }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitPrompt = useMutation(api.factory.prompts.submitPrompt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitPrompt({ worldId, text: text.trim() });
      setText('');
    } catch (err: any) {
      console.error('Failed to submit prompt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="> Enter a prompt for your AI agents..."
        className="flex-1 px-3 py-2 rounded bg-factory-800 border border-factory-600 text-factory-50 placeholder-factory-500 focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange text-sm font-mono"
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="px-5 py-2 rounded bg-accent-orange text-white font-bold text-sm hover:bg-accent-orange-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
      >
        {submitting ? '...' : 'Send'}
      </button>
    </form>
  );
}
