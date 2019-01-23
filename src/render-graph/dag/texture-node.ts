import { DAGNode } from "./dag-node";
import { PassDefine, RenderTextureDefine, DimensionType } from "../interface";
import { RenderGraph } from "../render-graph";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { PassGraphNode } from './pass-graph-node';

export class TextureNode extends DAGNode{
  constructor(graph: RenderGraph, define: RenderTextureDefine) {
    super();
    this.name = define.name;
    this.define = define;
    this.graph = graph;

    let width: number;
    let height: number;
    if (define.format.dimensionType === DimensionType.fixed) {
      width = define.format.width;
      height = define.format.height;
    }

    const enableDepth = define.format.disableDepthBuffer !== undefined ? define.format.disableDepthBuffer : true;
    this.framebuffer = graph.engine.renderer.frambufferManager.createFrameBuffer(
      this.name, width, height, enableDepth);
    
  }
  readonly name: string;
  readonly define: RenderTextureDefine;
  readonly graph: RenderGraph;

  framebuffer: GLFramebuffer;

  updateConnectedPassFramebuffer(oldFrambufferName:string, newFrambufferName: string) {
    this.toNode.forEach(node => {
      if (node instanceof PassGraphNode) {
        const uniformMaped = node.pass.inputTarget.get(oldFrambufferName);
        node.pass.inputTarget.delete(oldFrambufferName);
        node.pass.inputTarget.set(newFrambufferName, uniformMaped);
      }
    })
    this.fromNode.forEach(node => {
      if (node instanceof PassGraphNode) {
        node.pass.setOutPutTarget(this);
      }
    })
  }
}