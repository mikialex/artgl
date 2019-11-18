import { Vector3, Geometry, Nullable } from 'artgl';

export class World{
  constructor() {
    this.chunks.push(createDemoChunk());
  }

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

function createDemoChunk() {
  const chunk = new VoxChunk();
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 20; j++) {
      for (let k = 0; k < 20; k++) {
        chunk.setBlock(i, j, k, 1)
      }
    }
  }
  return chunk
}

export class VoxChunk{
  constructor() {
    this.vox = new Uint8Array(this.width * this.height * this.depth);
  }
  private vox: Uint8Array;

  width: number = 20;
  height: number = 20;
  depth: number = 10;

  getBlock(x: number, y:number, z: number) {
    return this.vox[y * this.width * this.height + x * this.depth + z];
  }

  setBlock(x: number, y: number, z: number, index: number) {
    this.vox[y * this.width * this.height + x * this.depth + z] = index;
  }

  voxData: Nullable<VoxData>[] = [null];
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