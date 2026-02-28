import { v } from 'convex/values';
import { internalMutation, internalQuery } from '../_generated/server';

// Internal queries used by agent operations

export const getPendingPrompts = internalQuery({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('prompts')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId).eq('status', 'pending'))
      .collect();
  },
});

export const getInProgressPrompts = internalQuery({
  args: { worldId: v.id('worlds') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('prompts')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId).eq('status', 'in_progress'))
      .collect();
  },
});

export const getPrompt = internalQuery({
  args: { promptId: v.id('prompts') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.promptId);
  },
});

export const allSubtasksCompleted = internalQuery({
  args: { promptId: v.id('prompts') },
  handler: async (ctx, args) => {
    const subtasks = await ctx.db
      .query('subtasks')
      .withIndex('byPrompt', (q) => q.eq('promptId', args.promptId))
      .collect();
    if (subtasks.length === 0) return false;
    return subtasks.every((st) => st.status === 'completed' || st.status === 'failed');
  },
});

export const getSubtasksForPrompt = internalQuery({
  args: { promptId: v.id('prompts') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('subtasks')
      .withIndex('byPrompt', (q) => q.eq('promptId', args.promptId))
      .collect();
  },
});

export const getSubtask = internalQuery({
  args: { subtaskId: v.id('subtasks') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.subtaskId);
  },
});

export const getAgentDescription = internalQuery({
  args: { worldId: v.id('worlds'), agentId: v.string() },
  handler: async (ctx, args) => {
    const descs = await ctx.db
      .query('agentDescriptions')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .collect();
    return descs.find((d) => d.agentId === args.agentId) ?? null;
  },
});

export const findReadySubtask = internalQuery({
  args: { worldId: v.id('worlds'), role: v.string() },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query('subtasks')
      .withIndex('byWorld', (q) => q.eq('worldId', args.worldId).eq('status', 'pending'))
      .collect();

    for (const subtask of pending) {
      if (subtask.assignedRole !== args.role) continue;

      // Check dependencies
      if (subtask.dependsOn && subtask.dependsOn.length > 0) {
        let depsReady = true;
        for (const depId of subtask.dependsOn) {
          const dep = await ctx.db.get(depId);
          if (!dep || (dep.status !== 'completed' && dep.status !== 'failed')) {
            depsReady = false;
            break;
          }
        }
        if (!depsReady) continue;
      }

      return subtask;
    }
    return null;
  },
});

// Internal mutations

export const updatePromptStatus = internalMutation({
  args: {
    promptId: v.id('prompts'),
    status: v.union(
      v.literal('pending'),
      v.literal('decomposing'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed'),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.promptId, { status: args.status });
  },
});

export const completePrompt = internalMutation({
  args: {
    promptId: v.id('prompts'),
    finalOutput: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.promptId, {
      status: 'completed',
      finalOutput: args.finalOutput,
      completedAt: Date.now(),
    });
  },
});

export const insertSubtask = internalMutation({
  args: {
    worldId: v.id('worlds'),
    promptId: v.id('prompts'),
    title: v.string(),
    description: v.string(),
    assignedRole: v.string(),
    order: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('subtasks', {
      worldId: args.worldId,
      promptId: args.promptId,
      title: args.title,
      description: args.description,
      assignedRole: args.assignedRole,
      status: 'pending',
      order: args.order,
      createdAt: args.createdAt,
    });
  },
});

export const claimSubtask = internalMutation({
  args: {
    subtaskId: v.id('subtasks'),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subtaskId, {
      assignedAgentId: args.agentId,
      status: 'assigned',
    });
  },
});

export const updateSubtaskStatus = internalMutation({
  args: {
    subtaskId: v.id('subtasks'),
    status: v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed'),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subtaskId, { status: args.status });
  },
});

export const completeSubtask = internalMutation({
  args: {
    subtaskId: v.id('subtasks'),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subtaskId, {
      status: 'completed',
      output: args.output,
      completedAt: Date.now(),
    });
  },
});

export const insertWorkLog = internalMutation({
  args: {
    worldId: v.id('worlds'),
    subtaskId: v.id('subtasks'),
    agentId: v.string(),
    content: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('workLogs', args);
  },
});
