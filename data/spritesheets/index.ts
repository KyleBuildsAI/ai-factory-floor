import { SpritesheetData } from './types';

// 32x32folk.png is 384x256:
// 4 characters per row, 2 rows = 8 characters
// Each character: 96px wide (3 frames x 32), 128px tall (4 directions x 32)
// Row order per character: down, left, right, up

function makeCharacterSheet(charIndex: number): SpritesheetData {
  const col = charIndex % 4;
  const row = Math.floor(charIndex / 4);
  const ox = col * 96; // x offset for this character
  const oy = row * 128; // y offset for this character
  const w = 32;
  const h = 32;

  const frame = (fx: number, fy: number) => ({
    frame: { x: ox + fx * w, y: oy + fy * h, w, h },
    sourceSize: { w, h },
    spriteSourceSize: { x: 0, y: 0 },
  });

  return {
    frames: {
      down: frame(0, 0),
      down2: frame(1, 0),
      down3: frame(2, 0),
      left: frame(0, 1),
      left2: frame(1, 1),
      left3: frame(2, 1),
      right: frame(0, 2),
      right2: frame(1, 2),
      right3: frame(2, 2),
      up: frame(0, 3),
      up2: frame(1, 3),
      up3: frame(2, 3),
    },
    meta: { scale: '1' },
    animations: {
      down: ['down', 'down2', 'down3'],
      left: ['left', 'left2', 'left3'],
      right: ['right', 'right2', 'right3'],
      up: ['up', 'up2', 'up3'],
    },
  };
}

// Character index → agent role mapping:
// 0 (f1): Manager - blue/purple outfit, authoritative
// 1 (f2): Analyst - dark outfit, analytical
// 2 (f3): Researcher - brown hair, studious
// 3 (f4): Reviewer - silver hair, experienced
// 4 (f5): Engineer - practical outfit
// 5 (f6): Designer - pink outfit, creative
// 6 (f7): Writer - blonde, thoughtful
// 7 (f8): Tester - blonde male
export const characterSheets: Record<string, SpritesheetData> = {
  manager: makeCharacterSheet(0),
  analyst: makeCharacterSheet(1),
  researcher: makeCharacterSheet(2),
  reviewer: makeCharacterSheet(3),
  engineer: makeCharacterSheet(4),
  designer: makeCharacterSheet(5),
  writer: makeCharacterSheet(6),
  tester: makeCharacterSheet(7),
};

export const CHARACTER_TEXTURE_URL = '/assets/32x32folk.png';
