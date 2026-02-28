import { v } from 'convex/values';

const IdShortCodes = {
  agents: 'a',
  operations: 'o',
} as const;

type IdTypes = keyof typeof IdShortCodes;

export type GameId<T extends IdTypes> = string & { __type: T };

let nextId = 0;

export function allocGameId<T extends IdTypes>(type: T, currentNextId: number): [GameId<T>, number] {
  const shortCode = IdShortCodes[type];
  const id = `${shortCode}:${currentNextId}` as GameId<T>;
  return [id, currentNextId + 1];
}

export function parseGameId<T extends IdTypes>(type: T, id: string): GameId<T> {
  const shortCode = IdShortCodes[type];
  if (!id.startsWith(`${shortCode}:`)) {
    throw new Error(`Invalid ${type} id: ${id}`);
  }
  return id as GameId<T>;
}

export const agentId = v.string();
