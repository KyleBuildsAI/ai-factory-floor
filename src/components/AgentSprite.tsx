import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useCallback } from 'react';

const STATUS_COLORS: Record<string, number> = {
  idle: 0x888888,
  working: 0x27ae60,
  thinking: 0xf39c12,
  reviewing: 0x3498db,
};

const nameStyle = new TextStyle({
  fontSize: 9,
  fill: 0x333333,
  fontFamily: 'system-ui',
  align: 'center',
});

const emojiStyle = new TextStyle({
  fontSize: 18,
  align: 'center',
});

const bubbleStyle = new TextStyle({
  fontSize: 8,
  fill: 0x333333,
  fontFamily: 'system-ui',
  wordWrap: true,
  wordWrapWidth: 80,
});

export function AgentSprite({
  x,
  y,
  name,
  emoji,
  color,
  status,
  speechBubble,
  selected,
  onClick,
  tileDim,
}: {
  x: number;
  y: number;
  name: string;
  emoji: string;
  color: number;
  status: string;
  speechBubble?: string;
  selected?: boolean;
  onClick?: () => void;
  tileDim: number;
}) {
  const px = x * tileDim + tileDim / 2;
  const py = y * tileDim + tileDim / 2;
  const statusColor = STATUS_COLORS[status] ?? 0x888888;

  const drawAgent = useCallback(
    (g: any) => {
      g.clear();
      // Selection ring
      if (selected) {
        g.lineStyle(2, 0x4a90d9, 0.8);
        g.drawCircle(0, 0, 14);
      }
      // Agent circle
      g.lineStyle(0);
      g.beginFill(color, 0.9);
      g.drawCircle(0, 0, 12);
      g.endFill();
      // Status dot
      g.beginFill(statusColor);
      g.drawCircle(10, -10, 4);
      g.endFill();
      // Make interactive
      g.eventMode = 'static';
      g.cursor = 'pointer';
      g.hitArea = { contains: (px: number, py: number) => px * px + py * py < 196 };
    },
    [color, statusColor, selected],
  );

  const drawBubble = useCallback(
    (g: any) => {
      if (!speechBubble) return;
      g.clear();
      g.beginFill(0xffffff, 0.95);
      g.lineStyle(1, 0xcccccc);
      g.drawRoundedRect(-45, -40, 90, 28, 6);
      g.endFill();
      // Triangle pointer
      g.beginFill(0xffffff, 0.95);
      g.moveTo(-4, -12);
      g.lineTo(4, -12);
      g.lineTo(0, -6);
      g.closePath();
      g.endFill();
    },
    [speechBubble],
  );

  return (
    <Container x={px} y={py}>
      {/* Agent body */}
      <Graphics draw={drawAgent} pointerdown={onClick} />
      {/* Emoji */}
      <Text text={emoji} anchor={0.5} y={-2} style={emojiStyle} />
      {/* Name label */}
      <Text text={name} anchor={{ x: 0.5, y: 0 }} y={14} style={nameStyle} />
      {/* Speech bubble */}
      {speechBubble && (
        <Container y={-20}>
          <Graphics draw={drawBubble} />
          <Text
            text={speechBubble.slice(0, 30)}
            anchor={{ x: 0.5, y: 0.5 }}
            y={-26}
            style={bubbleStyle}
          />
        </Container>
      )}
    </Container>
  );
}
