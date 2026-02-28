import { v, Infer } from 'convex/values';

export const serializedAgentDescription = {
  agentId: v.string(),
  name: v.string(),
  role: v.string(),
  identity: v.string(),
  emoji: v.string(),
  color: v.number(),
};

export type SerializedAgentDescription = Infer<typeof v.object(serializedAgentDescription)>;

export class AgentDescription {
  agentId: string;
  name: string;
  role: string;
  identity: string;
  emoji: string;
  color: number;

  constructor(serialized: SerializedAgentDescription) {
    this.agentId = serialized.agentId;
    this.name = serialized.name;
    this.role = serialized.role;
    this.identity = serialized.identity;
    this.emoji = serialized.emoji;
    this.color = serialized.color;
  }

  serialize(): SerializedAgentDescription {
    return {
      agentId: this.agentId,
      name: this.name,
      role: this.role,
      identity: this.identity,
      emoji: this.emoji,
      color: this.color,
    };
  }
}
