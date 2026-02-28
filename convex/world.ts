import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { engineInsertInput } from './engine/abstractGame';

export const defaultWorldStatus = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('worldStatus')
      .filter((q) => q.eq(q.field('isDefault'), true))
      .unique();
  },
});

export const worldState = query({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    const world = await ctx.db.get(args.worldId);
    if (!world) throw new Error(`World ${args.worldId} not found`);
    return { world };
  },
});

export const gameDescriptions = query({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    const map = await ctx.db
      .query('maps')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .unique();
    const agentDescriptions = await ctx.db
      .query('agentDescriptions')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .collect();
    return {
      factoryMap: map,
      agentDescriptions,
    };
  },
});

export const heartbeatWorld = mutation({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    const worldStatus = await ctx.db
      .query('worldStatus')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .unique();
    if (!worldStatus) throw new Error(`No world status for ${args.worldId}`);
    await ctx.db.patch(worldStatus._id, { lastViewed: Date.now() });
  },
});

export const sendWorldInput = mutation({
  args: {
    engineId: v.id('engines'),
    name: v.string(),
    args: v.any(),
  },
  handler: async (ctx, args) => {
    return await engineInsertInput(ctx, args.engineId, args.name, args.args);
  },
});
