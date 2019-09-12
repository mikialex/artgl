import { DAGNode } from "../../core/dag-node";
import { GLFramebuffer } from "../../webgl/gl-framebuffer";
import { Nullable } from "../../type";
import { Vector4 } from '../../math/vector4';
import { PixelFormat } from "../../webgl/const";
import { PassGraphNode } from "./pass-graph-node";
import { RenderEngine } from "../../engine/render-engine";
import { PingPongTarget } from "../node-maker";


export enum DimensionType {
  bindRenderSize,
  fixed
}

export class RenderTargetNode extends DAGNode {
  constructor(name: string, isScreenNode: boolean) {
    super();
    this.name = name;
    this.isScreenNode = isScreenNode;
  }
  readonly isScreenNode: boolean;
  readonly name: string;
  readonly pixelFormat: PixelFormat = PixelFormat.RGBA;

  debugViewPort: Vector4 = new Vector4(0, 0, 200, 200);

  _keepContent: boolean = false;
  keepContent() {
    this._keepContent = true;
    return this;
  }
  notNeedKeepContent() {
    this._keepContent = false;
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

  cleanConnections() {
    this.from(null)
    this.toNodes.forEach(n => {
      if (n instanceof PassGraphNode) {
        n.clearAllInput();
      } else {
        n.clearAllFrom();
      }
    })
  }
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