import { PixiComponent } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { TILE_COLORS } from '../../data/factoryMap';
import { FactoryMap } from '../../convex/factory/factoryMap';

interface PixiFactoryMapProps {
  map: FactoryMap;
}

const PixiFactoryMap = PixiComponent<PixiFactoryMapProps, PIXI.Container>('FactoryMap', {
  create(props) {
    const container = new PIXI.Container();
    const { map } = props;
    const { tileDim, layout, workstations } = map;

    // Draw tiles
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const tileType = layout[y][x];
        const color = TILE_COLORS[tileType] ?? 0xe8e8e8;
        const g = new PIXI.Graphics();
        g.beginFill(color);
        g.drawRect(x * tileDim, y * tileDim, tileDim, tileDim);
        g.endFill();
        // Add subtle grid lines
        g.lineStyle(1, 0xcccccc, 0.2);
        g.drawRect(x * tileDim, y * tileDim, tileDim, tileDim);
        container.addChild(g);
      }
    }

    // Draw workstation labels
    for (const ws of workstations) {
      const label = new PIXI.Text(ws.agentRole.toUpperCase(), {
        fontSize: 8,
        fill: 0x999999,
        fontFamily: 'system-ui',
        align: 'center',
      });
      label.anchor.set(0.5, 0);
      label.x = ws.deskPosition.x * tileDim + tileDim / 2;
      label.y = ws.deskPosition.y * tileDim - 2;
      container.addChild(label);
    }

    // Draw "TASK BOARD" label
    const boardLabel = new PIXI.Text('TASK BOARD', {
      fontSize: 12,
      fill: 0x333333,
      fontFamily: 'system-ui',
      fontWeight: 'bold',
    });
    boardLabel.x = 2 * tileDim;
    boardLabel.y = 1 * tileDim + 4;
    container.addChild(boardLabel);

    return container;
  },
  applyProps(container, oldProps, newProps) {
    // Static map, no updates needed
  },
});

export default PixiFactoryMap;
