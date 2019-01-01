import { EffectComposer } from "./effect-composer";
import { PassDefine, GraphDefine, TextureDefine } from "./interface";

export class RenderGraph{
  constructor(){

  }
  composer: EffectComposer;

  private renderTextures: Map<string, RenderTarget> = new Map();

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
  }

  private setPassse(passesDefine: PassDefine[]) {
    const rootPass = this.findScreenRootPass(passesDefine);
  }

  getTextureDependence(name: string) {
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
      this.renderTextures.set(new RenderTarget(define));
    })
  }
}