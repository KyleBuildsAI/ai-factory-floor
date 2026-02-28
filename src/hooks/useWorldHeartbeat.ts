import { useMutation, useQuery } from 'convex/react';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';
import { WORLD_HEARTBEAT_INTERVAL } from '../../convex/constants';

export function useWorldHeartbeat() {
  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;

  const heartbeat = useMutation(api.world.heartbeatWorld);
  useEffect(() => {
    const sendHeartBeat = () => {
      if (!worldStatus) return;
      if (Date.now() - WORLD_HEARTBEAT_INTERVAL / 2 < worldStatus.lastViewed) return;
      void heartbeat({ worldId: worldStatus.worldId });
    };
    sendHeartBeat();
    const id = setInterval(sendHeartBeat, WORLD_HEARTBEAT_INTERVAL);
    return () => clearInterval(id);
  }, [worldId, heartbeat]);
}
