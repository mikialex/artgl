import { DAGNode, Observable, Nullable } from "@artgl/shared"
import { Vector4 } from "@artgl/math";
import { PassGraphNode } from "./pass-graph-node";
import { RenderGraphBackEnd } from "../interface";
import { PixelFormat } from "@artgl/webgl";


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

  _afterContentReceived = new Observable<RenderTargetNode>();
  afterContentReceived(callback: (node: RenderTargetNode) => any) {
    this._afterContentReceived.add(callback);
    return this;
  }

  cleanConnections() {
    this.from(null)
    this.toNodes.forEach(n => {
      if (n instanceof PassGraphNode) {
        n.clearAllInput();
        n.clearAllDepends();
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
    this.formatKey = FBOProvider.buildFBOFormatKey(
      this.widthAbs, this.heightAbs, this.enableDepth
    );
  }

  // update abs size info from given engine render size
  updateSize(engine: RenderGraphBackEnd) {

    if (this.dimensionType === DimensionType.bindRenderSize) {
      this.widthAbs = Math.max(5, engine.renderBufferWidth() * this.autoWidthRatio);
      this.heightAbs = Math.max(5, engine.renderBufferHeight() * this.autoHeightRatio);
    }
    this.updateFormatKey();

  }

}