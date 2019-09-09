import { DAGNode } from "../../core/dag-node";
import { DimensionType } from "../interface";
import { RenderGraph } from "../render-graph";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { MathUtil } from '../../math/util'
import { Nullable } from "../../type";
import { Vector4 } from '../../math/vector4';
import { PixelFormat } from "../../webgl/const";
import { RenderPass } from "../pass";
import { PassGraphNode } from "./pass-graph-node";
import { RenderEngine } from "../../engine/render-engine";

export class RenderTargetNode extends DAGNode{
  constructor(name: string) {
    super();
    this.name = name;

  }
  readonly isScreenNode: boolean = false;
  readonly name: string;
  readonly pixelFormat: PixelFormat = PixelFormat.RGBA;
  readonly dimensionType: DimensionType = DimensionType.bindRenderSize;

  debugViewPort: Vector4 = new Vector4(0, 0, 200, 200);

  keepContent: () => boolean  = () => false;

  autoWidthRatio: number = 1;
  autoHeightRatio: number = 1;
  enableDepth: boolean = false;

  widthAbs: number = 0;
  heightAbs: number = 0;

  formatKey: string = "";

  private from: Nullable<string> = null;

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
    if (define.format && define.format.dimensionType === DimensionType.fixed) {
      width = define.format.width !== undefined ? define.format.width : engine.renderBufferWidth();
      height = define.format.height !== undefined ? define.format.height : engine.renderBufferHeight();
    } else { //  === DimensionType.bindRenderSize
      width = Math.max(5, engine.renderBufferWidth() * this.autoWidthRatio);
      height = Math.max(5, engine.renderBufferHeight() * this.autoHeightRatio);
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
      const passNode = graph.getRenderPassDependence(this.from)!;
      this.fromPassNode = passNode;
    }
  }

  // from updated graph structure, setup render pass
  updatePass(
    engine: RenderEngine,
    pass: RenderPass
  ) {
    this.updateSize(engine);
    pass.outputTarget = this;
  }

}