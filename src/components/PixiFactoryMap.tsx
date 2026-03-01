import { PixiComponent } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { FactoryMap } from '../../convex/factory/factoryMap';

const TILESET_URL = '/assets/gentle-obj.png';
const TS_COLS = 45;
const TS_ROWS = 32;

// Tile type constants (match data/factoryMap.ts)
const T_FLOOR = 0;
const T_WALL = 1;
const T_DESK = 2;
const T_MONITOR = 3;
const T_TASKBOARD = 4;
const T_PLANT = 5;

// Tileset tile indices (col + row * 45)
const GRASS_CENTER = [1066, 1066, 1066, 1072, 1073]; // weighted toward pure grass
const DARK_GRASS = [1117, 1118];
const WOOD_FLOOR = [1069, 1024, 1025, 1068, 1070];
const DIRT_PATH = [46, 47, 91, 92];

// Object indices
const TREES = [938, 939, 940];
const BUSHES = [894, 895];
const FLOWERS = [845, 847, 934, 935, 936];
const ROCKS = [848, 896];
const SMALL_PLANTS = [888, 889, 890];
const NOTICE_BOARD = 985;
const DESK_TL = 942;
const DESK_TR = 943;
const CRATE = 851;
const BOOKSHELF_TL = 853;
const BOOKSHELF_TR = 854;

// Seeded random for consistent decoration placement
function srand(x: number, y: number): number {
  const s = x * 31 + y * 97 + 13;
  return ((Math.sin(s) * 43758.5453) % 1 + 1) % 1;
}

function pick<T>(arr: T[], x: number, y: number, salt = 0): T {
  return arr[Math.floor(srand(x + salt, y + salt) * arr.length)];
}

// Check if a floor tile should be a dirt path
function isPath(x: number, y: number, W: number, H: number): boolean {
  // Vertical center path
  if ((x === 9 || x === 10) && y >= 2 && y <= H - 3) return true;
  // Horizontal paths at desk rows (connecting to workstations)
  if (y === 5 && x >= 2 && x <= W - 3) return true;
  if (y === 6 && x >= 2 && x <= W - 3) return true;
  if (y === 9 && x >= 2 && x <= 12) return true;
  if (y === 10 && x >= 2 && x <= 12) return true;
  // Path at row 7-8 (central crosswalk)
  if ((y === 7 || y === 8) && x >= 4 && x <= 16) return true;
  return false;
}

interface PixiFactoryMapProps {
  map: FactoryMap;
}

const PixiFactoryMap = PixiComponent<PixiFactoryMapProps, PIXI.Container>('FactoryMap', {
  create(props) {
    const container = new PIXI.Container();
    const { map } = props;
    const { tileDim: T, layout, workstations } = map;
    const W = layout[0]?.length ?? 20;
    const H = layout.length;

    // Load tileset and create tile textures
    const bt = PIXI.BaseTexture.from(TILESET_URL, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });

    const tiles: PIXI.Texture[] = [];
    for (let tx = 0; tx < TS_COLS; tx++) {
      for (let ty = 0; ty < TS_ROWS; ty++) {
        tiles[tx + ty * TS_COLS] = new PIXI.Texture(
          bt,
          new PIXI.Rectangle(tx * 32, ty * 32, 32, 32),
        );
      }
    }

    function addTile(index: number, px: number, py: number, alpha = 1) {
      if (index < 0 || index >= tiles.length) return;
      const sprite = new PIXI.Sprite(tiles[index]);
      sprite.x = px;
      sprite.y = py;
      if (alpha < 1) sprite.alpha = alpha;
      container.addChild(sprite);
    }

    // === LAYER 0: BACKGROUND ===
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tileType = layout[y][x];
        const px = x * T;
        const py = y * T;

        if (tileType === T_WALL) {
          // Walls get dark grass background (trees go on top)
          addTile(pick(DARK_GRASS, x, y), px, py);
        } else if (tileType === T_DESK || tileType === T_MONITOR) {
          // Desk/monitor areas get wood floor
          addTile(pick(WOOD_FLOOR, x, y), px, py);
        } else if (isPath(x, y, W, H) && tileType === T_FLOOR) {
          // Dirt path tiles
          addTile(pick(DIRT_PATH, x, y), px, py);
        } else {
          // Regular grass floor
          addTile(pick(GRASS_CENTER, x, y), px, py);
        }
      }
    }

    // === LAYER 1: WALL OBJECTS ===
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tileType = layout[y][x];
        const px = x * T;
        const py = y * T;

        if (tileType === T_WALL) {
          // Outer perimeter: trees, inner: bushes
          const isEdge = y === 0 || y === H - 1 || x === 0 || x === W - 1;
          if (isEdge) {
            addTile(pick(TREES, x, y), px, py);
          } else {
            addTile(pick(BUSHES, x, y), px, py);
          }
        }
      }
    }

    // === LAYER 2: FURNITURE ===
    for (const ws of workstations) {
      const dx = ws.deskPosition.x * T;
      const dy = ws.deskPosition.y * T;

      // Desk surface (2 tiles wide: desk tile + monitor tile)
      addTile(DESK_TL, dx, dy);
      addTile(DESK_TR, dx + T, dy);

      // Small decoration on some desks
      const r = srand(ws.deskPosition.x, ws.deskPosition.y);
      if (r > 0.5) {
        addTile(CRATE, dx + T * 2, dy, 0.7); // crate next to desk
      }
    }

    // === LAYER 3: TASKBOARD & PLANTS ===
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tileType = layout[y][x];
        const px = x * T;
        const py = y * T;

        if (tileType === T_TASKBOARD) {
          addTile(NOTICE_BOARD, px, py);
        } else if (tileType === T_PLANT) {
          addTile(pick([...SMALL_PLANTS, ...FLOWERS], x, y, 77), px, py);
        }
      }
    }

    // === LAYER 4: AMBIENT DECORATIONS ===
    // Scatter flowers and small plants on empty grass tiles
    for (let y = 2; y < H - 2; y++) {
      for (let x = 2; x < W - 2; x++) {
        if (layout[y][x] !== T_FLOOR) continue;
        if (isPath(x, y, W, H)) continue;
        const r = srand(x * 3 + 7, y * 5 + 11);
        if (r > 0.85) {
          const deco = pick([...FLOWERS, ...SMALL_PLANTS, ...ROCKS], x + 50, y + 50);
          addTile(deco, x * T, y * T);
        }
      }
    }

    // === BOOKSHELVES near task board ===
    // Place a small bookshelf decoration near the task board area
    const boardY = layout.findIndex((row) => row.some((t) => t === T_TASKBOARD));
    if (boardY >= 0) {
      // Find the rightmost taskboard tile
      let maxBoardX = 0;
      for (let x = 0; x < W; x++) {
        if (layout[boardY][x] === T_TASKBOARD) maxBoardX = x;
      }
      // Place bookshelf tiles adjacent
      if (maxBoardX + 2 < W && layout[boardY][maxBoardX + 2] !== T_WALL) {
        addTile(BOOKSHELF_TL, (maxBoardX + 2) * T, boardY * T);
        addTile(BOOKSHELF_TR, (maxBoardX + 3) * T, boardY * T);
      }
    }

    // === TASK BOARD LABEL ===
    let boardMinX = W;
    let boardMaxX = 0;
    for (let x = 0; x < W; x++) {
      if (layout[1]?.[x] === T_TASKBOARD) {
        boardMinX = Math.min(boardMinX, x);
        boardMaxX = Math.max(boardMaxX, x);
      }
    }
    if (boardMinX < W) {
      const label = new PIXI.Text('TASK BOARD', {
        fontSize: 9,
        fill: 0xffffff,
        fontFamily: '"Courier New", monospace',
        fontWeight: 'bold',
        letterSpacing: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowAlpha: 0.8,
        dropShadowDistance: 1,
        dropShadowBlur: 1,
      });
      label.anchor.set(0.5, 1);
      label.x = ((boardMinX + boardMaxX + 1) / 2) * T;
      label.y = boardY * T - 2;
      container.addChild(label);
    }

    return container;
  },
  applyProps() {},
});

export default PixiFactoryMap;
