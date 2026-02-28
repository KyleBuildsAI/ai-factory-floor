import { v, Infer } from 'convex/values';

export const serializedFactoryMap = {
  width: v.number(),
  height: v.number(),
  tileDim: v.number(),
  layout: v.array(v.array(v.number())),
  workstations: v.array(
    v.object({
      agentRole: v.string(),
      position: v.object({ x: v.number(), y: v.number() }),
      deskPosition: v.object({ x: v.number(), y: v.number() }),
    }),
  ),
};

const serializedFactoryMapValidator = v.object(serializedFactoryMap);
export type SerializedFactoryMap = Infer<typeof serializedFactoryMapValidator>;

export class FactoryMap {
  width: number;
  height: number;
  tileDim: number;
  layout: number[][];
  workstations: Array<{
    agentRole: string;
    position: { x: number; y: number };
    deskPosition: { x: number; y: number };
  }>;

  constructor(serialized: SerializedFactoryMap) {
    this.width = serialized.width;
    this.height = serialized.height;
    this.tileDim = serialized.tileDim;
    this.layout = serialized.layout;
    this.workstations = serialized.workstations;
  }

  serialize(): SerializedFactoryMap {
    return {
      width: this.width,
      height: this.height,
      tileDim: this.tileDim,
      layout: this.layout,
      workstations: this.workstations,
    };
  }
}
