import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, TextureDefine } from "./interface";
import { PassGraphNode } from "./dag/pass-graph-node";
import { TextureNode } from "./dag/texture-node";
import { DAGNode } from "./dag/dag-node";
import { ARTEngine } from "../engine/render-engine";

export class RenderGraph{
  constructor(engine: ARTEngine){
    this.composer = new EffectComposer(engine);
  }
  composer: EffectComposer;

  private renderTextures: Map<string, TextureNode> = new Map();
  private passNodes: Map<string, PassGraphNode> = new Map();

  render() {
    this.composer.render();
  }

  reset() {
    this.renderTextures.clear();
    this.passNodes.clear();
    this.composer.clearPasses();
  }

  public setGraph(graphDefine: GraphDefine) {
    this.reset();
    this.allocateRenderTextures(graphDefine.renderTextures);
    this.constructPassGraph(graphDefine.passes);
    this.updateComposer();
  }

  private constructPassGraph(passesDefine: PassDefine[]) {
    passesDefine.forEach(define => {
      if (this.passNodes.has(define.name)) {
        this.passNodes.set(define.name, new PassGraphNode(this, define));
      } else {
        throw 'duplicate pass define found'
      }
    })
  }

  private updateComposer() {
    const rootPassNode = this.findScreenRootPass();
    const renderPassQueue = rootPassNode.generateDependencyOrderList();
  }

  getTextureDependence(name: string): TextureNode {
    return this.renderTextures.get(name);
  }

  private findScreenRootPass(): PassGraphNode{
    let rootPass;
    this.passNodes.forEach(node => {
      if (node.define.output === 'screen') {
        if (rootPass !== undefined) {
          throw 'render graph build error, dupilcate root screen pass '
        }
        rootPass = node;
      }
    });
    if (rootPass === undefined) {
      throw 'render graph build error, miss root screen pass '
    }
    return rootPass;
  }

  private allocateRenderTextures(textsDefine: TextureDefine[]) {
    if (textsDefine === undefined) {
      return;
    }
    textsDefine.forEach(define => {
      if (this.renderTextures.has(define.name)) {
        throw 'render graph build error, dupilcate texture key namefound '
      }
      this.renderTextures.set(define.name, new TextureNode(this, define));
    })
  }
}