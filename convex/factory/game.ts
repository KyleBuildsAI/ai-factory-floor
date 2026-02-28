import { Value } from 'convex/values';
import { Doc, Id } from '../_generated/dataModel';
import { ActionCtx, MutationCtx } from '../_generated/server';
import { AbstractGame, EngineUpdate } from '../engine/abstractGame';
import { FactoryWorld, SerializedWorld } from './world';
import { FactoryMap, SerializedFactoryMap } from './factoryMap';
import { AgentDescription, SerializedAgentDescription } from './agentDescription';
import { GameId } from './ids';
import { inputs } from './inputs';
import { internal } from '../_generated/api';

export class FactoryGame extends AbstractGame {
  tickDuration = 16;
  stepDuration = 1000;
  maxTicksPerStep = 600;
  maxInputsPerStep = 32;

  world: FactoryWorld;
  factoryMap: FactoryMap;
  agentDescriptions: Map<GameId<'agents'>, AgentDescription>;
  worldId: Id<'worlds'>;

  pendingOperations: Array<{ name: string; args: any }> = [];

  constructor(
    engine: Doc<'engines'>,
    worldId: Id<'worlds'>,
    world: SerializedWorld,
    factoryMap: SerializedFactoryMap,
    agentDescriptions: SerializedAgentDescription[],
  ) {
    super(engine);
    this.worldId = worldId;
    this.world = new FactoryWorld(world);
    this.factoryMap = new FactoryMap(factoryMap);
    this.agentDescriptions = new Map();
    for (const desc of agentDescriptions) {
      this.agentDescriptions.set(desc.agentId as GameId<'agents'>, new AgentDescription(desc));
    }
  }

  handleInput(now: number, name: string, args: object): Value {
    const handler = (inputs as any)[name];
    if (!handler) {
      throw new Error(`Unknown input: ${name}`);
    }
    return handler.handler(this, now, args);
  }

  tick(now: number): void {
    for (const agent of this.world.agents.values()) {
      agent.tick(this, now);
    }
  }

  scheduleOperation(name: string, args: any) {
    const operationId = `op:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const agentId = args.agentId as GameId<'agents'>;
    const agent = this.world.agents.get(agentId);
    if (agent) {
      agent.startOperation(name, operationId, this.engine.currentTime ?? Date.now());
    }
    this.pendingOperations.push({
      name,
      args: { ...args, operationId, worldId: this.worldId },
    });
  }

  async saveStep(ctx: ActionCtx, engineUpdate: EngineUpdate): Promise<void> {
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    await ctx.runMutation(internal.factory.main.saveWorld, {
      engineId: this.engine._id,
      engineUpdate,
      worldId: this.worldId,
      worldDiff: this.world.serialize(),
    });

    // Dispatch agent operations
    for (const op of operations) {
      await runAgentOperation(ctx, op.name, op.args);
    }
  }
}

async function runAgentOperation(ctx: ActionCtx, name: string, args: any) {
  const ops: Record<string, any> = {
    managerCheckWork: internal.factory.agentOperations.managerCheckWork,
    agentCheckWork: internal.factory.agentOperations.agentCheckWork,
    managerDecomposePrompt: internal.factory.agentOperations.managerDecomposePrompt,
    agentProcessSubtask: internal.factory.agentOperations.agentProcessSubtask,
    managerAssembleOutput: internal.factory.agentOperations.managerAssembleOutput,
    agentIdleBehavior: internal.factory.agentOperations.agentIdleBehavior,
  };
  const fn = ops[name];
  if (!fn) {
    throw new Error(`Unknown agent operation: ${name}`);
  }
  await ctx.scheduler.runAfter(0, fn, args);
}
