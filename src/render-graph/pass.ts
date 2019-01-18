import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { Texture } from "../core/texture";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { Technique } from "../core/technique";
import { RenderGraph } from "./render-graph";
import { PassDefine } from "./interface";
import { TextureNode } from "./dag/texture-node";

export class RenderPass{
  constructor(graph: RenderGraph, define: PassDefine) {
    this.define = define;
    this.name = define.name;
    if (define.technique !== undefined) {
      const overrideTechnique = graph.getResgisteredTechnique(define.technique);
      if (overrideTechnique === undefined) {
        throw `technique '${define.technique}' not defined`
      }
      this.overrideTechnique = overrideTechnique;
    }

    if (define.output !== 'screen') {
      this.isOutputScreen = false;
    }
  }

  readonly define: PassDefine;
  public name: string;

  private overrideTechnique: Technique;

  private textureDependency: Texture[];
  private framebufferDependency: GLFramebuffer[];

  private outputTarget: GLFramebuffer
  private isOutputScreen: boolean = true;

  setOutPutTarget(textureNode: TextureNode) {
    this.outputTarget = textureNode.framebuffer;
  }

  execute(engine: ARTEngine, source: RenderSource) {

    if (this.isOutputScreen) {
      engine.renderer.setRenderTargetScreen();
    } else {
      engine.renderer.setRenderTarget(this.outputTarget);
    }

    if (this.overrideTechnique !== undefined) {
      engine.overrideTechnique = this.overrideTechnique;
    }

    engine.renderer.clear();

    engine.render(source);

    engine.overrideTechnique = null;

  }
}