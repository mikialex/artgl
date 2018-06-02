import { Geometry } from "../core/geometry";

interface CubeGeometryParam {
  width: number,
  height: number,
  depth: number,
  widthSegments: number,
  heightSegments: number,
  depthSegments: number,
}
export class CubeGeometry extends Geometry {
  constructor(width?: number, height?: number, depth?: number) {
    super();
    if (width !== undefined) { this.parameters.width = width; }
    if (height !== undefined) { this.parameters.height = height; }
    if (depth !== undefined) { this.parameters.depth = depth; }
    if (width !== undefined) { this.parameters.width = width; }
    if (height !== undefined) { this.parameters.height = height; }
    if (depth !== undefined) { this.parameters.depth = depth; }
  }

  parameters: CubeGeometryParam = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
  }

  populate() {
    const position = [];
    position.push()
  }

      
}