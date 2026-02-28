import { v } from 'convex/values';

const IdShortCodes = {
  agents: 'a',
  operations: 'o',
} as const;

type IdTypes = keyof typeof IdShortCodes;

export type GameId<T extends IdTypes> = string & { __type: T };

export function parseGameId<T extends IdTypes>(type: T, id: string): GameId<T> {
  const shortCode = IdShortCodes[type];
  if (!id.startsWith(`${shortCode}:`)) {
    throw new Error(`Invalid ${type} id: ${id}`);
  }
  return id as GameId<T>;
}

export const agentId = v.string();
