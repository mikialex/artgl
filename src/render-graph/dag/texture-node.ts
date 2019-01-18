import { DAGNode } from "./dag-node";
import { PassDefine, TextureDefine, DimensionType } from "../interface";
import { RenderGraph } from "../render-graph";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";

export class TextureNode extends DAGNode{
  constructor(graph: RenderGraph, define: TextureDefine) {
    super();
    this.name = define.name;
    this.define = define;
    this.graph = graph;

    let width: number;
    let height: number;
    if (define.format.dimensionType = DimensionType.fixed) {
      width = define.format.width;
      height = define.format.height;
    }

    this.framebuffer = graph.engine.renderer.frambufferManager.createFrameBuffer(
      this.name, width, height);
    
  }
  readonly name: string;
  readonly define: TextureDefine;
  readonly graph: RenderGraph;

  framebuffer: GLFramebuffer;
}