import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, TextureDefine } from "./interface";
import { PassGraphNode } from "./dag/pass-graph-node";
import { TextureNode } from "./dag/texture-node";
import { DAGNode } from "./dag/dag-node";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { TechniqueConfig, Technique } from "../core/technique";
import { GraphDebuggingViewer } from "./graph-viewer/graph-debugging-viewer";

export class RenderGraph{
  constructor(engine: ARTEngine) {
    this.engine = engine;
    this.composer = new EffectComposer(this);
    this.debugViewer = new GraphDebuggingViewer(this);
  }
  engine: ARTEngine;
  composer: EffectComposer;

  enableDebuggingView: boolean = false;
  debugViewer: GraphDebuggingViewer;

  private renderTextures: Map<string, TextureNode> = new Map();
  private passNodes: Map<string, PassGraphNode> = new Map();

  render(source: RenderSource) {
    this.composer.render(source);
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
      if (!this.passNodes.has(define.name)) {
        this.passNodes.set(define.name, new PassGraphNode(this, define));
      } else {
        throw 'duplicate pass define found'
      }
    })
  }

  private updateComposer() {
    const rootPassNode = this.findScreenRootPass();
    const renderPassQueue = rootPassNode.generateDependencyOrderList();
    this.composer.updatePasses(renderPassQueue);
  }

  getTextureDependence(name: string): TextureNode {
    return this.renderTextures.get(name);
  }

  private findScreenRootPass(): PassGraphNode{
    let rootPass: PassGraphNode;
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


  private passTechniques: Map<string, Technique> = new Map();
  registTechnique(name: string, technique: Technique) {
    if (this.passTechniques.has(name)) {
      throw 'duplicated technique registration'
    }
    this.passTechniques.set(name, technique);
  }
  getResgisteredTechnique(name: string) {
    return this.passTechniques.get(name);
  }
  
}