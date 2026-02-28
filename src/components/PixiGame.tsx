import { useCallback, useState } from 'react';
import { Container } from '@pixi/react';
import PixiFactoryMap from './PixiFactoryMap';
import { AgentSprite } from './AgentSprite';
import { ServerGame } from '../hooks/serverGame';
import { GameId } from '../../convex/factory/ids';

export default function PixiGame({
  game,
  width,
  height,
  selectedAgentId,
  onSelectAgent,
}: {
  game: ServerGame;
  width: number;
  height: number;
  selectedAgentId: GameId<'agents'> | null;
  onSelectAgent: (id: GameId<'agents'> | null) => void;
}) {
  const { world, factoryMap, agentDescriptions } = game;
  const tileDim = factoryMap.tileDim;

  // Scale to fit the available space
  const mapPixelW = factoryMap.width * tileDim;
  const mapPixelH = factoryMap.height * tileDim;
  const scale = Math.min(width / mapPixelW, height / mapPixelH, 2);

  const offsetX = (width - mapPixelW * scale) / 2;
  const offsetY = (height - mapPixelH * scale) / 2;

  return (
    <Container x={offsetX} y={offsetY} scale={scale}>
      {/* Map tiles */}
      <PixiFactoryMap map={factoryMap} />

      {/* Agents */}
      {[...world.agents.values()].map((agent) => {
        const desc = agentDescriptions.get(agent.id);
        if (!desc) return null;
        return (
          <AgentSprite
            key={agent.id}
            x={agent.workstationPosition.x}
            y={agent.workstationPosition.y}
            name={desc.name}
            emoji={desc.emoji}
            color={desc.color}
            status={agent.status}
            speechBubble={agent.speechBubble}
            selected={selectedAgentId === agent.id}
            onClick={() =>
              onSelectAgent(selectedAgentId === agent.id ? null : agent.id)
            }
            tileDim={tileDim}
          />
        );
      })}
    </Container>
  );
}
