import { MutationCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { engineInsertInput } from '../engine/abstractGame';

export async function insertInput(
  ctx: MutationCtx,
  worldId: Id<'worlds'>,
  name: string,
  args: any,
): Promise<Id<'inputs'>> {
  const worldStatus = await ctx.db
    .query('worldStatus')
    .withIndex('worldId', (q) => q.eq('worldId', worldId))
    .unique();
  if (!worldStatus) {
    throw new Error(`No world status found for world ${worldId}`);
  }
  return await engineInsertInput(ctx, worldStatus.engineId, name, args);
}
