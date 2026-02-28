import { v, Infer } from 'convex/values';
import { FactoryAgent, serializedAgent } from './agent';
import { GameId } from './ids';

export const serializedWorld = {
  nextId: v.number(),
  agents: v.array(v.object(serializedAgent)),
};

export type SerializedWorld = Infer<typeof v.object(serializedWorld)>;

export class FactoryWorld {
  nextId: number;
  agents: Map<GameId<'agents'>, FactoryAgent>;

  constructor(serialized: SerializedWorld) {
    this.nextId = serialized.nextId;
    this.agents = new Map();
    for (const agent of serialized.agents) {
      const a = new FactoryAgent(agent);
      this.agents.set(a.id, a);
    }
  }

  serialize(): SerializedWorld {
    return {
      nextId: this.nextId,
      agents: [...this.agents.values()].map((a) => a.serialize()),
    };
  }

  allocId<T extends 'agents' | 'operations'>(type: T): GameId<T> {
    const shortCodes = { agents: 'a', operations: 'o' } as const;
    const id = `${shortCodes[type]}:${this.nextId}` as GameId<T>;
    this.nextId++;
    return id;
  }
}
