import clsx from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse?: boolean }> = {
  idle: { label: 'Idle', color: 'bg-gray-400' },
  working: { label: 'Working', color: 'bg-green-500', pulse: true },
  thinking: { label: 'Thinking', color: 'bg-yellow-500', pulse: true },
  reviewing: { label: 'Reviewing', color: 'bg-blue-500', pulse: true },
  pending: { label: 'Pending', color: 'bg-gray-400' },
  decomposing: { label: 'Decomposing', color: 'bg-yellow-500', pulse: true },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', pulse: true },
  completed: { label: 'Completed', color: 'bg-green-500' },
  failed: { label: 'Failed', color: 'bg-red-500' },
  assigned: { label: 'Assigned', color: 'bg-purple-500' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-400' };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={clsx(
          'w-2 h-2 rounded-full',
          config.color,
          config.pulse && 'animate-pulse-dot',
        )}
      />
      <span className="text-factory-300">{config.label}</span>
    </span>
  );
}
