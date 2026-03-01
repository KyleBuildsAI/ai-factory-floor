import { Container } from '@pixi/react';
import PixiFactoryMap from './PixiFactoryMap';
import { Character } from './Character';
import { ServerGame } from '../hooks/serverGame';
import { GameId } from '../../convex/factory/ids';
import { characterSheets, CHARACTER_TEXTURE_URL } from '../../data/spritesheets';
import { ISpritesheetData } from 'pixi.js';

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

  // Scale to fit with padding
  const mapPixelW = factoryMap.width * tileDim;
  const mapPixelH = factoryMap.height * tileDim;
  const padding = 16;
  const scale = Math.min(
    (width - padding * 2) / mapPixelW,
    (height - padding * 2) / mapPixelH,
    2.5,
  );

  const offsetX = (width - mapPixelW * scale) / 2;
  const offsetY = (height - mapPixelH * scale) / 2;

  return (
    <Container x={offsetX} y={offsetY} scale={scale}>
      {/* Tileset-based map */}
      <PixiFactoryMap map={factoryMap} />

      {/* Character sprites */}
      {[...world.agents.values()].map((agent) => {
        const desc = agentDescriptions.get(agent.id);
        if (!desc) return null;

        const role = desc.role;
        const sheetData = characterSheets[role];
        if (!sheetData) return null;

        // Position: center of the tile
        const px = agent.workstationPosition.x * tileDim + tileDim / 2;
        const py = agent.workstationPosition.y * tileDim + tileDim / 2;

        // Orientation: agents face up toward their desk (270 degrees)
        // Manager (desk same as position) faces down (90 degrees)
        const deskAbove = agent.workstationPosition.y > 0; // most agents have desk above
        const orientation = role === 'manager' ? 90 : 270;

        // Status-based animation props
        const isWorking = agent.status === 'working';
        const isThinking = agent.status === 'thinking';
        const isReviewing = agent.status === 'reviewing';
        const isActive = isWorking || isThinking || isReviewing;

        // Emoji based on status
        let emoji = '';
        if (isWorking) emoji = '\u{1F4BB}'; // laptop
        if (isThinking) emoji = '\u{1F914}'; // thinking face
        if (isReviewing) emoji = '\u{1F50D}'; // magnifying glass

        return (
          <Character
            key={agent.id}
            textureUrl={CHARACTER_TEXTURE_URL}
            spritesheetData={sheetData as unknown as ISpritesheetData}
            x={px}
            y={py}
            orientation={orientation}
            isMoving={isActive}
            isThinking={isThinking}
            isSpeaking={!!agent.speechBubble && !isThinking}
            emoji={emoji}
            name={desc.name}
            status={agent.status}
            speechBubble={agent.speechBubble}
            selected={selectedAgentId === agent.id}
            speed={isWorking ? 0.08 : 0.12}
            onClick={() =>
              onSelectAgent(selectedAgentId === agent.id ? null : agent.id)
            }
          />
        );
      })}
    </Container>
  );
}
