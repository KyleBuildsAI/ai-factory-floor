import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { engineTables } from './engine/schema';
import { serializedAgent } from './factory/agent';
import { serializedAgentDescription } from './factory/agentDescription';
import { serializedFactoryMap } from './factory/factoryMap';

export default defineSchema({
  ...engineTables,

  // World state (single document per world, updated each step)
  worlds: defineTable({
    nextId: v.number(),
    agents: v.array(v.object(serializedAgent)),
  }),

  // World lifecycle
  worldStatus: defineTable({
    worldId: v.id('worlds'),
    isDefault: v.boolean(),
    engineId: v.id('engines'),
    lastViewed: v.number(),
    status: v.union(
      v.literal('running'),
      v.literal('stoppedByDeveloper'),
      v.literal('inactive'),
    ),
  }).index('worldId', ['worldId']),

  // Factory map (layout, workstations)
  maps: defineTable({
    worldId: v.id('worlds'),
    ...serializedFactoryMap,
  }).index('worldId', ['worldId']),

  // Agent descriptions (stable metadata, not updated per tick)
  agentDescriptions: defineTable({
    worldId: v.id('worlds'),
    ...serializedAgentDescription,
  }).index('worldId', ['worldId', 'agentId']),

  // User-submitted prompts
  prompts: defineTable({
    worldId: v.id('worlds'),
    text: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('decomposing'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    submittedAt: v.number(),
    completedAt: v.optional(v.number()),
    finalOutput: v.optional(v.string()),
  }).index('byWorld', ['worldId', 'status']),

  // Subtasks (created by Manager, assigned to specialists)
  subtasks: defineTable({
    worldId: v.id('worlds'),
    promptId: v.id('prompts'),
    title: v.string(),
    description: v.string(),
    assignedRole: v.string(),
    assignedAgentId: v.optional(v.string()),
    status: v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    dependsOn: v.optional(v.array(v.id('subtasks'))),
    output: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index('byPrompt', ['promptId', 'order'])
    .index('byWorld', ['worldId', 'status'])
    .index('byAgent', ['assignedAgentId', 'status']),

  // Work output log (streaming chunks from agents)
  workLogs: defineTable({
    worldId: v.id('worlds'),
    subtaskId: v.id('subtasks'),
    agentId: v.string(),
    content: v.string(),
    timestamp: v.number(),
  }).index('bySubtask', ['subtaskId', 'timestamp']),
});
