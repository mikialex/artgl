import { DAGNode } from "./dag-node";
import { RenderTextureDefine, DimensionType } from "../interface";
import { RenderGraph } from "../render-graph";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { PassGraphNode } from './pass-graph-node';
import { MathUtil } from '../../math/util'
import { Observer } from "../../core/observable";
import { Size } from "../../engine/render-engine";
import { Nullable } from "../../type";

export class RenderTargetNode extends DAGNode{
  constructor(graph: RenderGraph, define: RenderTextureDefine) {
    super();
    this.name = define.name;
    this.define = define;
    this.graph = graph;

    let width: number;
    let height: number;
    if (define.format.dimensionType === DimensionType.fixed) {
      width = define.format.width !== undefined ? define.format.width : graph.engine.renderer.width;
      height = define.format.height !== undefined ? define.format.height : graph.engine.renderer.height;
    } else if (define.format.dimensionType === DimensionType.bindRenderSize) {
      this.autoWidthRatio = define.format.width !== undefined ? MathUtil.clamp(define.format.width, 0, 1) : 1;
      this.autoHeightRatio = define.format.height !== undefined ? MathUtil.clamp(define.format.height, 0, 1) : 1;
      width = this.autoWidth;
      height = this.autoHeight;
      this.resizeObserver = this.graph.engine.resizeObservable.add(() => {
        this.framebuffer.resize(this.autoWidth, this.autoHeight);
      })
    }

    const enableDepth = define.format.disableDepthBuffer !== undefined ? define.format.disableDepthBuffer : true;
    this.framebuffer = graph.engine.renderer.frambufferManager.createFrameBuffer(
      this.name, width, height, enableDepth);
    
  }
  readonly name: string;
  readonly define: RenderTextureDefine;
  readonly graph: RenderGraph;

  autoWidthRatio: number = 0;
  autoHeightRatio: number = 0;
  private resizeObserver: Nullable<Observer<Size>> = null;
  get autoWidth() {
    return Math.max(5, this.graph.engine.renderer.width * this.autoWidthRatio);
  }
  get autoHeight() {
    return Math.max(5, this.graph.engine.renderer.height * this.autoHeightRatio);
  }

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

  dispose() {
    if (this.resizeObserver !== null) {
      this.graph.engine.resizeObservable.remove(this.resizeObserver);
    }
  }
}