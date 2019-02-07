import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, RenderTextureDefine } from "./interface";
import { PassGraphNode } from "./dag/pass-graph-node";
import { RenderTargetNode } from "./dag/render-target-node";
import { DAGNode } from "./dag/dag-node";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { TechniqueConfig, Technique } from "../core/technique";
import { QuadSource } from './quad-source';
import { GLFramebuffer } from '../webgl/gl-framebuffer';
import { Vector4 } from "../math/vector4";
import { RenderPass } from "./pass";

export class RenderGraph {
  constructor(engine: ARTEngine) {
    this.engine = engine;
    this.composer = new EffectComposer(this);
  }
  engine: ARTEngine;
  composer: EffectComposer;

  enableDebuggingView: boolean = false;

  private screenNode: RenderTargetNode;
  renderTargetNodes: Map<string, RenderTargetNode> = new Map();
  passNodes: Map<string, PassGraphNode> = new Map();

  render() {
    this.composer.render();
  }

  reset() {
    this.renderTargetNodes.clear();
    this.passNodes.clear();
    this.composer.clearPasses();
  }

  public setGraph(graphDefine: GraphDefine) {
    this.reset();
    this.allocaterenderTargetNodes(graphDefine.renderTargets);
    this.constructPassGraph(graphDefine.passes);
    this.update();
  }

  public update() {
    this.updateNodesConnection();
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

  private updateNodesConnection() {
    this.passNodes.forEach(node => {
      node.updateDependNode();
    });
    this.renderTargetNodes.forEach(node => {
      node.updateDependNode();
    });
  }

  private updateComposer() {
    const renderPassQueue = this.screenNode.generateDependencyOrderList();
    this.composer.updatePasses(renderPassQueue);
  }

  getRenderTargetDependence(name: string): RenderTargetNode {
    return this.renderTargetNodes.get(name);
  }

  getRenderPassDependence(name: string): PassGraphNode {
    return this.passNodes.get(name);
  }

  private allocaterenderTargetNodes(textsDefine: RenderTextureDefine[]) {
    textsDefine.forEach(define => {
      if (this.renderTargetNodes.has(define.name)) {
        throw 'render graph build error, dupilcate texture key namefound '
      }
      const renderTargetNode = new RenderTargetNode(this, define);
      if (define.name === 'screen') {
        if (this.screenNode !== undefined) {
          throw "duplicate screen root node"
        }
        this.screenNode = renderTargetNode
      }
      this.renderTargetNodes.set(define.name, renderTargetNode);
    })

    if (this.screenNode === undefined) {
      throw "screen root not found"
    }
  }



  // pass technique registration
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



  // pass source registration
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


  updateRenderTargetDebugView(nodeId: string, viewPort: Vector4) {
    if (this.screenNode.uuid === nodeId) {
      RenderPass.screenDebugViewPort.copy(viewPort);
      return
    }

    this.renderTargetNodes.forEach(node => {
      if (node.uuid === nodeId) {
        node.framebuffer.debuggingViewport.copy(viewPort);
      }
    })
  }

}