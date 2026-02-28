import { internal } from './_generated/api';
import { DatabaseReader, MutationCtx, mutation } from './_generated/server';
import { DefaultAgents } from '../data/agents';
import { mapLayout, workstations, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '../data/factoryMap';
import { createEngine } from './factory/main';
import { ENGINE_ACTION_DURATION } from './constants';
import { Id } from './_generated/dataModel';

const init = mutation({
  handler: async (ctx) => {
    const { worldStatus, engine } = await getOrCreateDefaultWorld(ctx);
    if (worldStatus.status !== 'running') {
      console.warn(
        `Engine ${engine._id} is not active! Run "npx convex run testing:resume" to restart it.`,
      );
      return;
    }
    const shouldCreate = await shouldCreateAgents(ctx.db, worldStatus.worldId);
    if (shouldCreate) {
      // Create agents directly in world document with known IDs
      const world = await ctx.db.get(worldStatus.worldId);
      if (!world) throw new Error(`World ${worldStatus.worldId} not found`);

      let nextId = world.nextId;
      const agents = [];

      for (const agentDef of DefaultAgents) {
        const agentId = `a:${nextId}`;
        nextId++;

        agents.push({
          id: agentId,
          role: agentDef.role,
          status: 'idle',
          workstationPosition: agentDef.workstationPosition,
        });

        await ctx.db.insert('agentDescriptions', {
          worldId: worldStatus.worldId,
          agentId,
          name: agentDef.name,
          role: agentDef.role,
          identity: agentDef.identity,
          emoji: agentDef.emoji,
          color: agentDef.color,
        });
      }

      await ctx.db.patch(worldStatus.worldId, {
        nextId,
        agents,
      });
    }
  },
});
export default init;

async function getOrCreateDefaultWorld(ctx: MutationCtx) {
  const now = Date.now();

  let worldStatus = await ctx.db
    .query('worldStatus')
    .filter((q) => q.eq(q.field('isDefault'), true))
    .unique();
  if (worldStatus) {
    const engine = (await ctx.db.get(worldStatus.engineId))!;
    return { worldStatus, engine };
  }

  const engineId = await createEngine(ctx);
  const engine = (await ctx.db.get(engineId))!;
  const worldId = await ctx.db.insert('worlds', {
    nextId: 0,
    agents: [],
  });
  const worldStatusId = await ctx.db.insert('worldStatus', {
    engineId,
    isDefault: true,
    lastViewed: now,
    status: 'running',
    worldId,
  });
  worldStatus = (await ctx.db.get(worldStatusId))!;

  // Insert factory map
  await ctx.db.insert('maps', {
    worldId,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tileDim: TILE_SIZE,
    layout: mapLayout,
    workstations,
  });

  // Start the engine loop
  await ctx.scheduler.runAfter(0, internal.factory.main.runStep, {
    worldId,
    generationNumber: engine.generationNumber,
    maxDuration: ENGINE_ACTION_DURATION,
  });

  return { worldStatus, engine };
}

async function shouldCreateAgents(db: DatabaseReader, worldId: Id<'worlds'>) {
  const world = await db.get(worldId);
  if (!world) throw new Error(`World ${worldId} not found`);
  return world.agents.length === 0;
}
