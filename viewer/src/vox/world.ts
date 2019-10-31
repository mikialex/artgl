import { Vector3 } from '../../../src/math';
import { Geometry } from '../../../src/artgl';

export class World{
  chunks: VoxChunk[] = [];

  updateRender() {
    this.chunks.forEach(c => {
      c.updateRenderGeometry();
    })
  }

  render() {
    this.chunks.forEach(c => {
      c.render();
    })
  }
}

export class VoxChunk{
  constructor() {
    this.vox = new Uint8Array(this.width * this.height * this.depth);
  }
  vox: Uint8Array;
  width: number = 20;
  height: number = 20;
  depth: number = 10;
  voxData: VoxData[] = [];
  worldStart = new Vector3();

  renderGeometry?: Geometry;

  updateRenderGeometry() {
    
  }

  render() {
    
  }
}

export class VoxData{
  color: Vector3 = new Vector3();
}