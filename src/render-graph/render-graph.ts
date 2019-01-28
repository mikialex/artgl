import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, RenderTextureDefine } from "./interface";
import { PassGraphNode } from "./dag/pass-graph-node";
import { RenderTargetNode } from "./dag/render-target-node";
import { DAGNode } from "./dag/dag-node";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { TechniqueConfig, Technique } from "../core/technique";
import { GraphDebuggingViewer } from "./graph-viewer/graph-debugging-viewer";
import { QuadSource } from './quad-source';
import { GLFramebuffer } from '../webgl/gl-framebuffer';

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

  private renderTargets: Map<string, RenderTargetNode> = new Map();
  private passNodes: Map<string, PassGraphNode> = new Map();

  render() {
    this.composer.render();
  }

  reset() {
    this.renderTargets.clear();
    this.passNodes.clear();
    this.composer.clearPasses();
  }

  swapRenderTexture(from: string, to: string) {
    const fromTexture = this.renderTargets.get(from);
    const toTexture = this.renderTargets.get(to);
    const frambufferFrom = fromTexture.framebuffer.name;
    const frambufferTo = toTexture.framebuffer.name;

    // swap on node graph
    let temp: GLFramebuffer;
    temp = fromTexture.framebuffer;
    fromTexture.framebuffer = toTexture.framebuffer;
    toTexture.framebuffer = temp;

    // update pass
    fromTexture.updateConnectedPassFramebuffer(frambufferFrom, frambufferTo);
    toTexture.updateConnectedPassFramebuffer(frambufferTo, frambufferFrom);
  }

  public setGraph(graphDefine: GraphDefine) {
    this.reset();
    this.allocaterenderTargets(graphDefine.renderTargets);
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

  getTextureDependence(name: string): RenderTargetNode {
    return this.renderTargets.get(name);
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

  private allocaterenderTargets(textsDefine: RenderTextureDefine[]) {
    if (textsDefine === undefined) {
      return;
    }
    textsDefine.forEach(define => {
      if (this.renderTargets.has(define.name)) {
        throw 'render graph build error, dupilcate texture key namefound '
      }
      this.renderTargets.set(define.name, new RenderTargetNode(this, define));
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

  private passSources: Map<string, RenderSource> = new Map();
  private innerSourceRegx = /^artgl.\w*$/;
  isInnerSourceType(name: string) {
    return this.innerSourceRegx.test(name);
  }
  private quadSource = new QuadSource();
  getInnerSource(name: string): RenderSource {
    if (name === 'artgl.screenQuad') {
      return this.quadSource;
    } else {
      throw `inner source ${name} not supported`
    }
  }
  registSource(name: string, source: RenderSource) {
    if (this.isInnerSourceType(name)) {
      throw 'start with artgl.** is inner source and should not be registered'
    }

    if (this.passSources.has(name)) {
      throw 'duplicated source registration'
    }
    this.passSources.set(name, source);
  }
  getResgisteredSource(name: string) {
    return this.passSources.get(name);
  }
  
}