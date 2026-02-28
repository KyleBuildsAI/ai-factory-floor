import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { FactoryWorld } from '../../convex/factory/world';
import { FactoryMap } from '../../convex/factory/factoryMap';
import { AgentDescription } from '../../convex/factory/agentDescription';
import { GameId } from '../../convex/factory/ids';

export type ServerGame = {
  world: FactoryWorld;
  factoryMap: FactoryMap;
  agentDescriptions: Map<GameId<'agents'>, AgentDescription>;
};

export function useServerGame(worldId: Id<'worlds'> | undefined): ServerGame | undefined {
  const worldState = useQuery(api.world.worldState, worldId ? { worldId } : 'skip');
  const descriptions = useQuery(api.world.gameDescriptions, worldId ? { worldId } : 'skip');

  const game = useMemo(() => {
    if (!worldState || !descriptions || !descriptions.factoryMap) {
      return undefined;
    }
    const agentDescMap = new Map<GameId<'agents'>, AgentDescription>();
    for (const desc of descriptions.agentDescriptions) {
      if (desc.agentId) {
        agentDescMap.set(
          desc.agentId as GameId<'agents'>,
          new AgentDescription(desc as any),
        );
      }
    }
    return {
      world: new FactoryWorld(worldState.world as any),
      factoryMap: new FactoryMap(descriptions.factoryMap as any),
      agentDescriptions: agentDescMap,
    };
  }, [worldState, descriptions]);

  return game;
}
