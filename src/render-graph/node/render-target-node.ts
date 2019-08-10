import { DAGNode } from "../../core/dag-node";
import { RenderTargetDefine, DimensionType } from "../interface";
import { RenderGraph } from "../render-graph";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { MathUtil } from '../../math/util'
import { RenderEngine } from "../../engine/render-engine";
import { Nullable } from "../../type";
import { Vector4 } from '../../math/vector4';
import { PixelFormat } from "../../webgl/const";
import { FrameBufferPool } from "../framebuffer-pool";
import { RenderPass } from "../pass";
import { PassGraphNode } from "./pass-graph-node";

export class RenderTargetNode extends DAGNode{
  constructor(define: RenderTargetDefine) {
    super();
    this.name = define.name;
    this.define = define;

    this.fromGetter = define.from;

    this.isScreenNode = define.name === RenderGraph.screenRoot;
    if (this.isScreenNode) {
      return
    }

    // set a default format config
    if (define.format === undefined) {
      define.format = {
        pixelFormat: PixelFormat.RGBA,
        dimensionType: DimensionType.bindRenderSize,
      }
    } else {
      if (define.format.pixelFormat === undefined) {
        define.format.pixelFormat = PixelFormat.RGBA;
      }
      if (define.format.dimensionType === undefined) {
        define.format.dimensionType = DimensionType.bindRenderSize;
      }
    }

    if (define.format.dimensionType === DimensionType.bindRenderSize) {
      this.autoWidthRatio = define.format.width !== undefined ? MathUtil.clamp(define.format.width, 0, 1) : 1;
      this.autoHeightRatio = define.format.height !== undefined ? MathUtil.clamp(define.format.height, 0, 1) : 1;
    }
    this.enableDepth = define.format.enableDepthBuffer !== undefined ? define.format.enableDepthBuffer : false;
    
  }
  readonly isScreenNode: boolean;
  readonly name: string;
  readonly define: RenderTargetDefine;

  debugViewPort: Vector4 = new Vector4(0, 0, 200, 200);

  autoWidthRatio: number = 0;
  autoHeightRatio: number = 0;
  enableDepth: boolean = false;

  widthAbs: number = 0;
  heightAbs: number = 0;

  formatKey: string = "";

  private fromGetter: () => Nullable<string>
  private from: string = null;

  private _fromPassNode: Nullable<PassGraphNode> = null

  set fromPassNode(node: Nullable<PassGraphNode>) {
    if (node === null) {
      this._fromPassNode = node;
      this.clearAllFrom();
      return 
    }
    this._fromPassNode = node;
    node.connectTo(this);
  }

  get fromPassNode() {
    return this._fromPassNode
  }

  private updateFormatKey() {
    this.formatKey = GLFramebuffer.buildFBOFormatKey(
      this.widthAbs, this.heightAbs, this.enableDepth
    );
  }

  // update abs size info from given engine render size
  updateSize(engine: RenderEngine) {
    if (this.isScreenNode) {
      return;
    }
    const define = this.define;
    let width: number;
    let height: number;
    // decide initial size and create resize observer
    if (define.format.dimensionType === DimensionType.fixed) {
      width = define.format.width !== undefined ? define.format.width : engine.renderer.width;
      height = define.format.height !== undefined ? define.format.height : engine.renderer.height;
    } else { //  === DimensionType.bindRenderSize
      width = Math.max(5, engine.renderer.width * this.autoWidthRatio);
      height = Math.max(5, engine.renderer.height * this.autoHeightRatio);
    }
    this.widthAbs = Math.max(5, width);
    this.heightAbs = Math.max(5, height);
    this.updateFormatKey();
  }

  // update graph structure
  updateDependNode(graph: RenderGraph) {
    // disconnect depends pass node
    this.fromPassNode = null;

    this.from = this.fromGetter();

    if (this.from !== null) {
      const passNode = graph.getRenderPassDependence(this.from);
      this.fromPassNode = passNode;
    }
  }

    // from updated graph structure, setup render pass
  updatePass(engine: RenderEngine, pass: RenderPass) {
    this.updateSize(engine);
    if (this.name === RenderGraph.screenRoot) {
      pass.isOutputScreen = true;
    } else {
      pass.outputWidth = this.widthAbs;
      pass.outputHeight = this.heightAbs;
      pass.outputHasDepth = this.enableDepth;
      pass.isOutputScreen = false;
    }
  }

}