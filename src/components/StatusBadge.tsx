import clsx from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse?: boolean }> = {
  idle: { label: 'Idle', color: 'bg-factory-500' },
  working: { label: 'Working', color: 'bg-accent-green', pulse: true },
  thinking: { label: 'Thinking', color: 'bg-accent-yellow', pulse: true },
  reviewing: { label: 'Reviewing', color: 'bg-accent-blue', pulse: true },
  pending: { label: 'Pending', color: 'bg-factory-500' },
  decomposing: { label: 'Decomposing', color: 'bg-accent-yellow', pulse: true },
  in_progress: { label: 'In Progress', color: 'bg-accent-orange', pulse: true },
  completed: { label: 'Completed', color: 'bg-accent-green' },
  failed: { label: 'Failed', color: 'bg-accent-red' },
  assigned: { label: 'Assigned', color: 'bg-accent-purple' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'bg-factory-500' };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono">
      <span
        className={clsx(
          'w-2 h-2 rounded-full',
          config.color,
          config.pulse && 'animate-pulse-dot',
        )}
      />
      <span className="text-factory-300 uppercase tracking-wider text-[10px]">{config.label}</span>
    </span>
  );
}
