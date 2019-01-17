import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { Texture } from "../core/texture";
import { ARTEngine, RenderSource } from "../engine/render-engine";
import { GLProgram } from "../webgl/program";
import { Technique } from "../core/technique";
import { RenderGraph } from "./render-graph";
import { PassDefine } from "./interface";

export class RenderPass{
  constructor(graph: RenderGraph, define: PassDefine) {

    this.name = define.name;
    if (define.technique !== undefined) {
      const overrideTechnique = graph.getResgisteredTechnique(define.technique);
      if (overrideTechnique === undefined) {
        throw `technique '${define.technique}' not defined`
      }
      this.overrideTechnique = overrideTechnique;
    }
  }

  public name: string;

  private overrideTechnique: Technique;

  private textureDependency: Texture[];
  private framebufferDependency: GLFramebuffer[];

  private outPutTarget: GLFramebuffer

  execute(engine: ARTEngine, source: RenderSource) {
    engine.setRenderTarget(this.outPutTarget);
    if (this.overrideTechnique !== undefined) {
      engine.overrideTechnique = this.overrideTechnique;
    }

    engine.render(source);

    engine.overrideTechnique = null;

  }
}