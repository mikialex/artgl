import { DAGNode } from "./dag-node";
import { RenderTargetDefine, DimensionType, PixelFormat } from "../interface";
import { RenderGraph } from "../render-graph";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { PassGraphNode } from './pass-graph-node';
import { MathUtil } from '../../math/util'
import { Observer } from "../../core/observable";
import { Size } from "../../engine/render-engine";
import { Nullable } from "../../type";
import { Vector4 } from '../../math/vector4';

export class RenderTargetNode extends DAGNode{
  constructor(graph: RenderGraph, define: RenderTargetDefine) {
    super();
    this.name = define.name;
    this.define = define;
    this.graph = graph;

    this.fromGetter = define.from;

    if (define.name === RenderGraph.screenRoot) {
      this.isScreenNode = true;
      return
    }

    // set a default format config
    if (define.format === undefined) {
      define.format = {
        pixelFormat: PixelFormat.rgba,
        dimensionType: DimensionType.bindRenderSize,
      }
    }

    let width: number;
    let height: number;
    // decide inital size and create resize observer
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
  readonly isScreenNode: boolean;
  readonly name: string;
  readonly define: RenderTargetDefine;
  readonly graph: RenderGraph;

  debugViewPort: Vector4 = new Vector4(0, 0, 200, 200);

  autoWidthRatio: number = 0;
  autoHeightRatio: number = 0;
  private resizeObserver: Nullable<Observer<Size>> = null;
  get autoWidth() {
    return Math.max(5, this.graph.engine.renderer.width * this.autoWidthRatio);
  }
  get autoHeight() {
    return Math.max(5, this.graph.engine.renderer.height * this.autoHeightRatio);
  }

  get width() {
    return this.framebuffer.width
  }

  get height() {
    return this.framebuffer.height
  }

  framebuffer: GLFramebuffer;

  private fromGetter: () => Nullable<string>
  private from: string = null;

  updateDependNode() {
    if (this.from !== null) {
      const passNode = this.graph.getRenderPassDependence(this.from);
      passNode.deConnectTo(this);
    }

    this.from = this.fromGetter();

    if (this.from !== null) {
      const passNode = this.graph.getRenderPassDependence(this.from);
      passNode.connectTo(this);
    }
    
  }

  dispose() {
    if (this.resizeObserver !== null) {
      this.graph.engine.resizeObservable.remove(this.resizeObserver);
    }
  }
}