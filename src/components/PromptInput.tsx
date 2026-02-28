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
        placeholder="Enter a prompt for your AI agents..."
        className="flex-1 px-4 py-2 rounded-lg bg-factory-800 border border-factory-600 text-factory-100 placeholder-factory-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue text-sm"
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting || !text.trim()}
        className="px-6 py-2 rounded-lg bg-accent-blue text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
