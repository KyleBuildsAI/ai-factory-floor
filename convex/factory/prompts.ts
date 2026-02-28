import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

export const submitPrompt = mutation({
  args: {
    worldId: v.id('worlds'),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('prompts', {
      worldId: args.worldId,
      text: args.text,
      status: 'pending',
      submittedAt: Date.now(),
    });
  },
});

export const listPrompts = query({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('prompts')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId))
      .order('desc')
      .collect();
  },
});

export const getPromptWithSubtasks = query({
  args: { promptId: v.id('prompts') },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) return null;
    const subtasks = await ctx.db
      .query('subtasks')
      .withIndex('byPrompt', (q) => q.eq('promptId', args.promptId))
      .collect();
    return { prompt, subtasks };
  },
});

export const getWorkLogs = query({
  args: { subtaskId: v.id('subtasks') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workLogs')
      .withIndex('bySubtask', (q) => q.eq('subtaskId', args.subtaskId))
      .collect();
  },
});

export const activePrompts = query({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query('prompts')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId).eq('status', 'pending'))
      .collect();
    const decomposing = await ctx.db
      .query('prompts')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId).eq('status', 'decomposing'))
      .collect();
    const inProgress = await ctx.db
      .query('prompts')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId).eq('status', 'in_progress'))
      .collect();
    return [...pending, ...decomposing, ...inProgress];
  },
});
