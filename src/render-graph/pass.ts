import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { Texture } from "../core/texture";
import { ARTEngine } from "../engine/render-engine";
import { GLProgram } from "../webgl/program";

export class RenderPass{
  constructor() {
    
  }

  public name: string;

  private overrideProgram: GLProgram;

  private textureDependency: Texture[];
  private framebufferDependency: GLFramebuffer[];

  private outPutTarget: GLFramebuffer

  execute(engine: ARTEngine) {
    engine.setRenderTarget(this.outPutTarget);
    // engine.render();
  }
}