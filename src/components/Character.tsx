import { BaseTexture, ISpritesheetData, Spritesheet } from 'pixi.js';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatedSprite, Container, Graphics, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

const EMOTE_STYLE = new PIXI.TextStyle({ fontSize: 20 });

const DOTS_STYLE = new PIXI.TextStyle({
  fontSize: 14,
  fill: 0x44dd66,
  fontWeight: 'bold',
  fontFamily: 'monospace',
});

const NAME_STYLE = new PIXI.TextStyle({
  fontSize: 10,
  fill: 0xffffff,
  fontFamily: '"Courier New", monospace',
  fontWeight: 'bold',
  align: 'center',
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowAlpha: 0.8,
  dropShadowDistance: 1,
  dropShadowBlur: 1,
});

const BUBBLE_TEXT_STYLE = new PIXI.TextStyle({
  fontSize: 9,
  fill: 0x1a1a2e,
  fontFamily: '"Courier New", monospace',
  wordWrap: true,
  wordWrapWidth: 100,
  lineHeight: 12,
});

const STATUS_EMOJIS: Record<string, string> = {
  working: '',
  thinking: '',
  reviewing: '',
};

export const Character = ({
  textureUrl,
  spritesheetData,
  x,
  y,
  orientation,
  isMoving = false,
  isThinking = false,
  isSpeaking = false,
  emoji = '',
  name = '',
  status = 'idle',
  speechBubble = '',
  selected = false,
  speed = 0.1,
  onClick,
}: {
  textureUrl: string;
  spritesheetData: ISpritesheetData;
  x: number;
  y: number;
  orientation: number;
  isMoving?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  emoji?: string;
  name?: string;
  status?: string;
  speechBubble?: string;
  selected?: boolean;
  speed?: number;
  onClick?: () => void;
}) => {
  const [spriteSheet, setSpriteSheet] = useState<Spritesheet>();
  useEffect(() => {
    const parseSheet = async () => {
      const sheet = new Spritesheet(
        BaseTexture.from(textureUrl, {
          scaleMode: PIXI.SCALE_MODES.NEAREST,
        }),
        spritesheetData,
      );
      await sheet.parse();
      setSpriteSheet(sheet);
    };
    void parseSheet();
  }, []);

  const roundedOrientation = Math.floor(orientation / 90);
  const direction = ['right', 'down', 'left', 'up'][roundedOrientation];

  // Prevent animation stop on texture change
  const ref = useRef<PIXI.AnimatedSprite | null>(null);
  useEffect(() => {
    if (isMoving) {
      ref.current?.play();
    }
  }, [direction, isMoving]);

  // Bobbing animation for active agents
  const [bobTick, setBobTick] = useState(0);
  useEffect(() => {
    if (status === 'idle') return;
    const interval = setInterval(() => setBobTick((t) => t + 1), 150);
    return () => clearInterval(interval);
  }, [status]);
  const bobY = status !== 'idle' ? Math.sin(bobTick * 0.2) * 1.5 : 0;

  // Typing animation dots for working agents
  const [dots, setDots] = useState('');
  useEffect(() => {
    if (status !== 'working') {
      setDots('');
      return;
    }
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [status]);

  const drawShadow = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0x000000, 0.25);
    g.drawEllipse(0, 12, 12, 5);
    g.endFill();
  }, []);

  const drawSelection = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      if (!selected) return;
      g.lineStyle(2, 0xff6b35, 0.9);
      g.drawCircle(0, 0, 18);
      g.lineStyle(0);
      // Orange glow
      g.beginFill(0xff6b35, 0.08);
      g.drawCircle(0, 0, 20);
      g.endFill();
    },
    [selected],
  );

  const drawStatusGlow = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      if (status === 'idle') return;
      const colors: Record<string, number> = {
        working: 0x44dd66,
        thinking: 0xffaa33,
        reviewing: 0x4488dd,
      };
      const color = colors[status] ?? 0x888888;
      const pulse = 0.06 + Math.sin(bobTick * 0.15) * 0.04;
      g.beginFill(color, pulse);
      g.drawCircle(0, 0, 20);
      g.endFill();
    },
    [status, bobTick],
  );

  const drawBubble = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      if (!speechBubble) return;

      const text = speechBubble.slice(0, 40);
      const bw = Math.max(50, Math.min(120, text.length * 5.5 + 20));
      const bh = 22;

      // Shadow
      g.beginFill(0x000000, 0.15);
      g.drawRoundedRect(-bw / 2 + 2, -bh - 6, bw, bh, 6);
      g.endFill();

      // Background
      g.beginFill(0xffffff, 0.95);
      g.lineStyle(2, 0x2a2040, 0.8);
      g.drawRoundedRect(-bw / 2, -bh - 8, bw, bh, 6);
      g.endFill();

      // Triangle pointer
      g.lineStyle(0);
      g.beginFill(0xffffff, 0.95);
      g.moveTo(-4, -8);
      g.lineTo(4, -8);
      g.lineTo(0, -2);
      g.closePath();
      g.endFill();

      // Pointer border
      g.lineStyle(2, 0x2a2040, 0.8);
      g.moveTo(-5, -8);
      g.lineTo(0, -1);
      g.moveTo(5, -8);
      g.lineTo(0, -1);
      g.lineStyle(0);
    },
    [speechBubble],
  );

  if (!spriteSheet) return null;

  const statusEmoji = STATUS_EMOJIS[status] || '';
  const displayEmoji = emoji || statusEmoji;

  return (
    <Container
      x={x}
      y={y}
      interactive={true}
      pointerdown={onClick}
      cursor="pointer"
    >
      {/* Selection ring */}
      <Graphics draw={drawSelection} />

      {/* Status glow */}
      <Graphics draw={drawStatusGlow} />

      {/* Ground shadow */}
      <Graphics draw={drawShadow} />

      {/* Thought bubble */}
      {isThinking && (
        <Text
          x={-18}
          y={-20 + bobY}
          scale={{ x: -0.9, y: 0.9 }}
          text="&#x1F4AD;"
          anchor={{ x: 0.5, y: 0.5 }}
          style={EMOTE_STYLE}
        />
      )}

      {/* Speech indicator */}
      {isSpeaking && !speechBubble && (
        <Text
          x={18}
          y={-18 + bobY}
          scale={0.9}
          text="&#x1F4AC;"
          anchor={{ x: 0.5, y: 0.5 }}
          style={EMOTE_STYLE}
        />
      )}

      {/* Character sprite */}
      <AnimatedSprite
        ref={ref}
        isPlaying={isMoving || status === 'working'}
        textures={spriteSheet.animations[direction]}
        animationSpeed={status === 'working' ? 0.05 : speed}
        anchor={{ x: 0.5, y: 0.5 }}
        y={bobY}
      />

      {/* Emoji/reaction above head */}
      {displayEmoji && (
        <Text
          x={0}
          y={-26 + bobY}
          scale={{ x: -0.8, y: 0.8 }}
          text={displayEmoji}
          anchor={{ x: 0.5, y: 0.5 }}
          style={EMOTE_STYLE}
        />
      )}

      {/* Typing dots when working */}
      {status === 'working' && dots && (
        <Text
          x={14}
          y={-6 + bobY}
          text={dots}
          anchor={{ x: 0, y: 0.5 }}
          style={DOTS_STYLE}
        />
      )}

      {/* Name label */}
      {name && (
        <Text
          text={name}
          anchor={{ x: 0.5, y: 0 }}
          y={18}
          style={NAME_STYLE}
        />
      )}

      {/* Speech bubble */}
      {speechBubble && (
        <Container y={-24 + bobY}>
          <Graphics draw={drawBubble} />
          <Text
            text={speechBubble.slice(0, 40)}
            anchor={{ x: 0.5, y: 0.5 }}
            y={-19}
            style={BUBBLE_TEXT_STYLE}
          />
        </Container>
      )}
    </Container>
  );
};
