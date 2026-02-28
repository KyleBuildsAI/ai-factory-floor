import { v } from 'convex/values';
import { inputHandler } from './inputHandler';
import { agentId, parseGameId } from './ids';
import { FactoryAgent } from './agent';

export const inputs = {
  // Create an agent in the world
  createAgent: inputHandler({
    args: {
      role: v.string(),
      workstationPosition: v.object({ x: v.number(), y: v.number() }),
    },
    handler: (game, now, args) => {
      const id = game.world.allocId('agents');
      game.world.agents.set(
        id,
        new FactoryAgent({
          id,
          role: args.role,
          status: 'idle',
          workstationPosition: args.workstationPosition,
          speechBubble: undefined,
          currentSubtaskId: undefined,
          currentPromptId: undefined,
          inProgressOperation: undefined,
          lastWakeup: undefined,
        }),
      );
      return { agentId: id };
    },
  }),

  // Update an agent's status and speech bubble (called by operations)
  updateAgentStatus: inputHandler({
    args: {
      agentId,
      status: v.string(),
      speechBubble: v.optional(v.string()),
      currentSubtaskId: v.optional(v.string()),
      currentPromptId: v.optional(v.string()),
    },
    handler: (game, now, args) => {
      const id = parseGameId('agents', args.agentId);
      const agent = game.world.agents.get(id);
      if (!agent) {
        throw new Error(`Agent ${id} not found`);
      }
      agent.status = args.status;
      if (args.speechBubble !== undefined) {
        agent.speechBubble = args.speechBubble || undefined;
      }
      if (args.currentSubtaskId !== undefined) {
        agent.currentSubtaskId = args.currentSubtaskId || undefined;
      }
      if (args.currentPromptId !== undefined) {
        agent.currentPromptId = args.currentPromptId || undefined;
      }
      return null;
    },
  }),

  // Mark an operation as finished, releasing the agent
  finishOperation: inputHandler({
    args: {
      agentId,
      operationId: v.string(),
    },
    handler: (game, now, args) => {
      const id = parseGameId('agents', args.agentId);
      const agent = game.world.agents.get(id);
      if (!agent) {
        throw new Error(`Agent ${id} not found`);
      }
      if (
        !agent.inProgressOperation ||
        agent.inProgressOperation.operationId !== args.operationId
      ) {
        console.debug(`Agent ${id} doesn't have operation ${args.operationId} in progress`);
        return null;
      }
      agent.inProgressOperation = undefined;
      return null;
    },
  }),
};

export type Inputs = typeof inputs;
export type InputArgs<Name extends keyof Inputs> = Parameters<Inputs[Name]['handler']>[2];
export type InputReturnValue<Name extends keyof Inputs> = ReturnType<Inputs[Name]['handler']>;
