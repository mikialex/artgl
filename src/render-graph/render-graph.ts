import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, RenderTargetDefine } from "./interface";
import { PassGraphNode } from "./dag/pass-graph-node";
import { RenderTargetNode } from "./dag/render-target-node";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { Technique } from "../core/technique";
import { QuadSource } from './quad-source';
import { Vector4 } from "../math/vector4";
import { RenderPass } from "./pass";

export class RenderGraph {
  static screenRoot: string = 'artgl-rendergraph-screen-rt';
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

  getNodeByID(id: string) {
    let n;
    this.renderTargetNodes.forEach(node => {
      if (node.uuid === id) {
        n = node;
      }
    })
    this.passNodes.forEach(node => {
      if (node.uuid === id) {
        n = node;
      }
    })
    return n;
  }

  /**
   * Render a frame by this graph
   *
   * @memberof RenderGraph
   */
  public render() {
    this.composer.render();
  }

  /**
   * Clear the graph pass info as needed
   *
   * @memberof RenderGraph
   */
  public reset() {
    this.renderTargetNodes.clear();
    this.passNodes.clear();
    this.composer.clearPasses();
  }

  /**
   * Setup a new Graph configuration
   *
   * @param {GraphDefine} graphDefine
   * @memberof RenderGraph
   */
  public setGraph(graphDefine: GraphDefine): void {
    this.reset();
    this.allocaterenderTargetNodes(graphDefine.renderTargets);
    this.constructPassGraph(graphDefine.passes);
    this.update();
  }

  /**
   * Update the pass queue from current graph configure
   *
   * @memberof RenderGraph
   */
  update() {
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

  getRootScreenTargetNode() {
    let screenNode;
    this.renderTargetNodes.forEach(node => {
      if (node.isScreenNode) {
        screenNode = node;
      }
    })
    return screenNode;
  }

  private allocaterenderTargetNodes(textsDefine: RenderTargetDefine[]) {
    textsDefine.forEach(define => {
      if (this.renderTargetNodes.has(define.name)) {
        throw 'render graph build error, dupilcate texture key namefound '
      }
      const renderTargetNode = new RenderTargetNode(this, define);
      if (define.name === RenderGraph.screenRoot) {
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