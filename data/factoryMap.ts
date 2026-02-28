export const TILE_SIZE = 32;
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 15;

// Tile types
export const TILE_FLOOR = 0;
export const TILE_WALL = 1;
export const TILE_DESK = 2;
export const TILE_MONITOR = 3;
export const TILE_TASKBOARD = 4;
export const TILE_PLANT = 5;

export const TILE_COLORS: Record<number, number> = {
  [TILE_FLOOR]: 0xe8e8e8,
  [TILE_WALL]: 0x404040,
  [TILE_DESK]: 0x8b6914,
  [TILE_MONITOR]: 0x333333,
  [TILE_TASKBOARD]: 0xffffff,
  [TILE_PLANT]: 0x2ecc71,
};

// W = wall, F = floor, D = desk, M = monitor, T = task board, P = plant
const layoutKey: Record<string, number> = {
  W: TILE_WALL,
  F: TILE_FLOOR,
  D: TILE_DESK,
  M: TILE_MONITOR,
  T: TILE_TASKBOARD,
  P: TILE_PLANT,
};

// 20 columns x 15 rows
const layoutStr = [
  'WWWWWWWWWWWWWWWWWWWW', // 0 - top wall
  'WTTTTTTTFFFFFFFFFFF W', // 1 - task board area
  'WFFFFFFFFFFFFFFFFFFFW', // 2
  'WFFFFFFFFDMFFFFFFFFW', // 3 - Manager desk
  'WFFFFFFFFFFFFFFFFFFFW', // 4
  'WFFDMFFFFDMFFFFDMFFFFDMFW', // 5 - desks row 1 (monitors)
  'WFFFFFFFFFFFFFFFFFFFFFFFFFFFFW', // 6 - agent row 1
  'WFFFFFFFFFFFFFFFFFFFW', // 7
  'WFFFFFFFFFFFFFFFFFFFW', // 8
  'WFFDMFFFFDMFFFFDMFPFW', // 9 - desks row 2
  'WFFFFFFFFFFFFFFFFFFFW', // 10 - agent row 2
  'WFFFFFFFFFFFFFFFFFFFW', // 11
  'WFFFFFFFFFFFFFFFFFFFPW', // 12
  'WFFFFFFFFFFFFFFFFFFFFW', // 13
  'WWWWWWWWWWWWWWWWWWWW', // 14 - bottom wall
];

// Generate a proper 20x15 grid programmatically
function generateLayout(): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (y === 0 || y === MAP_HEIGHT - 1 || x === 0 || x === MAP_WIDTH - 1) {
        row.push(TILE_WALL);
      } else if (y === 1 && x >= 1 && x <= 7) {
        row.push(TILE_TASKBOARD);
      } else if (y === 3 && x === 9) {
        row.push(TILE_DESK);
      } else if (y === 3 && x === 10) {
        row.push(TILE_MONITOR);
      } else if (y === 5 && (x === 3 || x === 7 || x === 11 || x === 15)) {
        row.push(TILE_DESK);
      } else if (y === 5 && (x === 4 || x === 8 || x === 12 || x === 16)) {
        row.push(TILE_MONITOR);
      } else if (y === 9 && (x === 3 || x === 7 || x === 11)) {
        row.push(TILE_DESK);
      } else if (y === 9 && (x === 4 || x === 8 || x === 12)) {
        row.push(TILE_MONITOR);
      } else if ((x === 17 && y === 9) || (x === 17 && y === 12)) {
        row.push(TILE_PLANT);
      } else {
        row.push(TILE_FLOOR);
      }
    }
    grid.push(row);
  }
  return grid;
}

export const mapLayout = generateLayout();

export type WorkstationDef = {
  agentRole: string;
  position: { x: number; y: number };
  deskPosition: { x: number; y: number };
};

export const workstations: WorkstationDef[] = [
  { agentRole: 'manager', position: { x: 9, y: 3 }, deskPosition: { x: 9, y: 3 } },
  { agentRole: 'researcher', position: { x: 3, y: 6 }, deskPosition: { x: 3, y: 5 } },
  { agentRole: 'engineer', position: { x: 7, y: 6 }, deskPosition: { x: 7, y: 5 } },
  { agentRole: 'designer', position: { x: 11, y: 6 }, deskPosition: { x: 11, y: 5 } },
  { agentRole: 'writer', position: { x: 15, y: 6 }, deskPosition: { x: 15, y: 5 } },
  { agentRole: 'reviewer', position: { x: 3, y: 10 }, deskPosition: { x: 3, y: 9 } },
  { agentRole: 'analyst', position: { x: 7, y: 10 }, deskPosition: { x: 7, y: 9 } },
  { agentRole: 'tester', position: { x: 11, y: 10 }, deskPosition: { x: 11, y: 9 } },
];
