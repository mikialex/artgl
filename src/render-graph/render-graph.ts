import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, TextureDefine } from "./interface";
import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { PassGraphNode } from "./dag/pass-graph-node";
import { TextureNode } from "./dag/texture-node";

export class RenderGraph{
  constructor(){

  }
  composer: EffectComposer;

  private renderTextures: Map<string, TextureNode> = new Map();

  render() {
    this.composer.render();
  }

  reset() {
    this.renderTextures.clear();
    this.composer.clearPasses();
  }

  setGraph(graphDefine: GraphDefine) {
    this.reset();
    this.allocateRenderTextures(graphDefine.renderTextures);
    this.setPassse(graphDefine.passes);
  }

  private setPassse(passesDefine: PassDefine[]) {
    const rootPass = this.findScreenRootPass(passesDefine);
    const passMap: {[index: string]: PassGraphNode} = {};
    passesDefine.forEach(pass => {
      if (passMap[pass.name] === undefined) {
        passMap[pass.name] = new PassGraphNode(this, pass);
      } else {
        throw 'duplicate pass define found'
      }
    })
    for (const key in passMap) {
      const passNode = passMap[key];
      if (passNode.define.inputs !== undefined) {
        // passNode.define.inputs.forEach()
      }
      
      passNode.connectTo
    }
    
  }

  getTextureDependence(name: string): TextureNode {
    return this.renderTextures.get(name);
  }

  private findScreenRootPass(passesDefine: PassDefine[]): PassDefine{
    let rootPass;
    passesDefine.forEach(define => {
      if (define.output === 'screen') {
        if (rootPass !== undefined) {
          throw 'render graph build error, dupilcate root screen pass '
        }
        rootPass = define;
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