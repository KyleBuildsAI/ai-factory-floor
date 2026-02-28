import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
import { internalMutation } from './_generated/server';
import { IDLE_WORLD_TIMEOUT } from './constants';

const crons = cronJobs();

export const stopInactiveWorlds = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const worldStatuses = await ctx.db.query('worldStatus').collect();
    for (const worldStatus of worldStatuses) {
      if (
        worldStatus.status === 'running' &&
        now - worldStatus.lastViewed > IDLE_WORLD_TIMEOUT
      ) {
        console.log(`Stopping inactive world ${worldStatus.worldId}`);
        await ctx.db.patch(worldStatus._id, { status: 'inactive' });
        const engine = await ctx.db.get(worldStatus.engineId);
        if (engine) {
          await ctx.db.patch(engine._id, { running: false });
        }
      }
    }
  },
});

crons.interval('stop inactive worlds', { seconds: 30 }, internal.crons.stopInactiveWorlds);

export default crons;
