import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { internal } from '../_generated/api';
import {
  DatabaseReader,
  MutationCtx,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from '../_generated/server';
import { loadEngine, applyEngineUpdate, engineUpdate, engineInsertInput } from '../engine/abstractGame';
import { FactoryGame } from './game';
import { ENGINE_ACTION_DURATION } from '../constants';

export const runStep = internalAction({
  args: {
    worldId: v.id('worlds'),
    generationNumber: v.number(),
    maxDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const deadline = Date.now() + args.maxDuration;

    // Load game state
    const gameState = await ctx.runQuery(internal.factory.main.loadWorld, {
      worldId: args.worldId,
      generationNumber: args.generationNumber,
    });
    if (!gameState) {
      return;
    }
    const game = new FactoryGame(
      gameState.engine,
      args.worldId,
      gameState.world,
      gameState.factoryMap,
      gameState.agentDescriptions,
    );

    // Run steps until deadline
    while (Date.now() < deadline) {
      await game.runStep(ctx, Date.now());
      // Small yield to prevent CPU hogging
      if (Date.now() + 100 > deadline) break;
    }

    // Re-schedule ourselves
    const worldStatus = await ctx.runQuery(internal.factory.main.getWorldStatus, {
      worldId: args.worldId,
    });
    if (worldStatus && worldStatus.status === 'running') {
      await ctx.scheduler.runAfter(0, internal.factory.main.runStep, {
        worldId: args.worldId,
        generationNumber: game.engine.generationNumber,
        maxDuration: ENGINE_ACTION_DURATION,
      });
    }
  },
});

export const loadWorld = internalQuery({
  args: {
    worldId: v.id('worlds'),
    generationNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const engine = await loadWorldEngine(ctx.db, args.worldId, args.generationNumber);
    if (!engine) return null;

    const world = await ctx.db.get(args.worldId);
    if (!world) throw new Error(`World ${args.worldId} not found`);

    const map = await ctx.db
      .query('maps')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .unique();
    if (!map) throw new Error(`Map for world ${args.worldId} not found`);

    const agentDescriptions = await ctx.db
      .query('agentDescriptions')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .collect();

    return {
      engine,
      world: {
        nextId: world.nextId,
        agents: world.agents,
      },
      factoryMap: {
        width: map.width,
        height: map.height,
        tileDim: map.tileDim,
        layout: map.layout,
        workstations: map.workstations,
      },
      agentDescriptions: agentDescriptions.map((d) => ({
        agentId: d.agentId,
        name: d.name,
        role: d.role,
        identity: d.identity,
        emoji: d.emoji,
        color: d.color,
      })),
    };
  },
});

export const getWorldStatus = internalQuery({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('worldStatus')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .unique();
  },
});

export const saveWorld = internalMutation({
  args: {
    engineId: v.id('engines'),
    engineUpdate,
    worldId: v.id('worlds'),
    worldDiff: v.object({
      nextId: v.number(),
      agents: v.array(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    await applyEngineUpdate(ctx, args.engineId, args.engineUpdate);
    await ctx.db.patch(args.worldId, {
      nextId: args.worldDiff.nextId,
      agents: args.worldDiff.agents,
    });
  },
});

export const sendInput = internalMutation({
  args: {
    engineId: v.id('engines'),
    name: v.string(),
    args: v.any(),
  },
  handler: async (ctx, args) => {
    return await engineInsertInput(ctx, args.engineId, args.name, args.args);
  },
});

export const inputStatus = query({
  args: { inputId: v.id('inputs') },
  handler: async (ctx, args) => {
    const input = await ctx.db.get(args.inputId);
    if (!input) return null;
    return input.returnValue ?? null;
  },
});

async function loadWorldEngine(
  db: DatabaseReader,
  worldId: Id<'worlds'>,
  generationNumber: number,
) {
  const worldStatus = await db
    .query('worldStatus')
    .withIndex('worldId', (q) => q.eq('worldId', worldId))
    .unique();
  if (!worldStatus) {
    throw new Error(`No world status for ${worldId}`);
  }
  try {
    return await loadEngine(db, worldStatus.engineId, generationNumber);
  } catch (e: any) {
    if (e.data?.kind === 'engineNotRunning' || e.data?.kind === 'generationNumber') {
      return null;
    }
    throw e;
  }
}

export async function createEngine(ctx: MutationCtx) {
  return await ctx.db.insert('engines', {
    currentTime: undefined,
    lastStepTs: undefined,
    generationNumber: 0,
    running: true,
    processedInputNumber: undefined,
  });
}
