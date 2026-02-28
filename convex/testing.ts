import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, mutation } from './_generated/server';
import { ENGINE_ACTION_DURATION } from './constants';

export const stop = mutation({
  handler: async (ctx) => {
    const worldStatus = await ctx.db
      .query('worldStatus')
      .filter((q) => q.eq(q.field('isDefault'), true))
      .unique();
    if (!worldStatus) throw new Error('No default world found');
    await ctx.db.patch(worldStatus._id, { status: 'stoppedByDeveloper' });
    const engine = await ctx.db.get(worldStatus.engineId);
    if (engine) {
      await ctx.db.patch(engine._id, { running: false });
    }
  },
});

export const resume = mutation({
  handler: async (ctx) => {
    const worldStatus = await ctx.db
      .query('worldStatus')
      .filter((q) => q.eq(q.field('isDefault'), true))
      .unique();
    if (!worldStatus) throw new Error('No default world found');
    await ctx.db.patch(worldStatus._id, { status: 'running' });
    const engine = await ctx.db.get(worldStatus.engineId);
    if (engine) {
      await ctx.db.patch(engine._id, { running: true });
      await ctx.scheduler.runAfter(0, internal.factory.main.runStep, {
        worldId: worldStatus.worldId,
        generationNumber: engine.generationNumber,
        maxDuration: ENGINE_ACTION_DURATION,
      });
    }
  },
});

export const kick = mutation({
  handler: async (ctx) => {
    const worldStatus = await ctx.db
      .query('worldStatus')
      .filter((q) => q.eq(q.field('isDefault'), true))
      .unique();
    if (!worldStatus) throw new Error('No default world found');
    const engine = await ctx.db.get(worldStatus.engineId);
    if (engine && engine.running) {
      await ctx.scheduler.runAfter(0, internal.factory.main.runStep, {
        worldId: worldStatus.worldId,
        generationNumber: engine.generationNumber,
        maxDuration: ENGINE_ACTION_DURATION,
      });
    }
  },
});

export const wipeAllTables = mutation({
  handler: async (ctx) => {
    const tables = [
      'worlds',
      'worldStatus',
      'maps',
      'agentDescriptions',
      'engines',
      'inputs',
      'prompts',
      'subtasks',
      'workLogs',
    ] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
  },
});
