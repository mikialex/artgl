import { DAGNode } from "../../core/dag-node";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { Nullable } from "../../type";
import { Vector4 } from '../../math/vector4';
import { PixelFormat } from "../../webgl/const";
import { PassGraphNode } from "./pass-graph-node";
import { RenderEngine } from "../../engine/render-engine";


export enum DimensionType {
  bindRenderSize,
  fixed
}

export class RenderTargetNode extends DAGNode {
  constructor(name: string) {
    super();
    this.name = name;

  }
  readonly isScreenNode: boolean = false;
  readonly name: string;
  readonly pixelFormat: PixelFormat = PixelFormat.RGBA;

  debugViewPort: Vector4 = new Vector4(0, 0, 200, 200);

  _keepContent: boolean = false;
  keepContent() {
    this._keepContent = true;
    return this;
  }

  widthAbs: number = 5;
  heightAbs: number = 5;
  autoWidthRatio: number = 1;
  autoHeightRatio: number = 1;
  readonly dimensionType: DimensionType = DimensionType.bindRenderSize;

  enableDepth: boolean = false;
  needDepth() {
    this.enableDepth = true;
    return this;
  }

  formatKey: string = "";


  private _fromPassNode: Nullable<PassGraphNode> = null
  from(node: Nullable<PassGraphNode>) {
    if (this._fromPassNode !== null) {
      this._fromPassNode.disconnectTo(this);
    }
    this._fromPassNode = node;
    if (this._fromPassNode !== null) {
      this._fromPassNode.connectTo(this);
    }
    return this;
  }

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

    if (this.dimensionType === DimensionType.bindRenderSize) {
      this.widthAbs = Math.max(5, engine.renderBufferWidth() * this.autoWidthRatio);
      this.heightAbs = Math.max(5, engine.renderBufferHeight() * this.autoHeightRatio);
    }
    this.updateFormatKey();

  }

}