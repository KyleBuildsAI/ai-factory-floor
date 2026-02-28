import { v, Infer } from 'convex/values';
import { GameId } from './ids';
import { AGENT_WAKEUP_THRESHOLD } from '../constants';

export const serializedAgent = {
  id: v.string(),
  role: v.string(),
  status: v.string(), // 'idle' | 'working' | 'thinking' | 'reviewing'
  workstationPosition: v.object({ x: v.number(), y: v.number() }),
  speechBubble: v.optional(v.string()),
  currentSubtaskId: v.optional(v.string()),
  currentPromptId: v.optional(v.string()),
  inProgressOperation: v.optional(
    v.object({
      name: v.string(),
      operationId: v.string(),
      started: v.number(),
    }),
  ),
  lastWakeup: v.optional(v.number()),
};

export type SerializedAgent = Infer<typeof v.object(serializedAgent)>;

export class FactoryAgent {
  id: GameId<'agents'>;
  role: string;
  status: string;
  workstationPosition: { x: number; y: number };
  speechBubble?: string;
  currentSubtaskId?: string;
  currentPromptId?: string;
  inProgressOperation?: {
    name: string;
    operationId: string;
    started: number;
  };
  lastWakeup?: number;

  constructor(serialized: SerializedAgent) {
    this.id = serialized.id as GameId<'agents'>;
    this.role = serialized.role;
    this.status = serialized.status;
    this.workstationPosition = serialized.workstationPosition;
    this.speechBubble = serialized.speechBubble;
    this.currentSubtaskId = serialized.currentSubtaskId;
    this.currentPromptId = serialized.currentPromptId;
    this.inProgressOperation = serialized.inProgressOperation;
    this.lastWakeup = serialized.lastWakeup;
  }

  serialize(): SerializedAgent {
    return {
      id: this.id,
      role: this.role,
      status: this.status,
      workstationPosition: this.workstationPosition,
      speechBubble: this.speechBubble,
      currentSubtaskId: this.currentSubtaskId,
      currentPromptId: this.currentPromptId,
      inProgressOperation: this.inProgressOperation,
      lastWakeup: this.lastWakeup,
    };
  }

  tick(game: any, now: number) {
    // Don't wake up too frequently
    if (this.lastWakeup && now - this.lastWakeup < AGENT_WAKEUP_THRESHOLD) {
      return;
    }

    // If we have an operation in progress, wait for it
    if (this.inProgressOperation) {
      return;
    }

    this.lastWakeup = now;

    // Schedule the appropriate operation based on role
    if (this.role === 'manager') {
      game.scheduleOperation('managerCheckWork', {
        agentId: this.id,
      });
    } else {
      game.scheduleOperation('agentCheckWork', {
        agentId: this.id,
      });
    }
  }

  startOperation(name: string, operationId: string, now: number) {
    this.inProgressOperation = { name, operationId, started: now };
  }
}
