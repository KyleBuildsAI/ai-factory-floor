export const ACTION_TIMEOUT = 120_000;

export const IDLE_WORLD_TIMEOUT = 5 * 60 * 1000;
export const WORLD_HEARTBEAT_INTERVAL = 60 * 1000;

export const MAX_STEP = 10 * 60 * 1000;
export const TICK = 16;
export const STEP_INTERVAL = 1000;

export const ENGINE_ACTION_DURATION = 30000;

// How long to wait before an agent checks for new work
export const AGENT_WAKEUP_THRESHOLD = 2000;

// How long idle behavior lasts before checking again
export const IDLE_DURATION_MIN = 3000;
export const IDLE_DURATION_MAX = 8000;

// Manager-specific
export const MANAGER_CHECK_INTERVAL = 2000;

// Subtask processing
export const SUBTASK_MAX_TOKENS = 2000;
export const DECOMPOSE_MAX_TOKENS = 1500;
export const ASSEMBLE_MAX_TOKENS = 3000;

// Idle messages shown in speech bubbles when agents have nothing to do
export const IDLE_MESSAGES = [
  'Reviewing documentation...',
  'Checking metrics...',
  'Organizing workspace...',
  'Reading latest updates...',
  'Optimizing workflow...',
  'Reviewing best practices...',
  'Updating notes...',
  'Scanning for updates...',
  'Calibrating tools...',
  'Coffee break ☕',
];
