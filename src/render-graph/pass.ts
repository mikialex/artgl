import { GLFramebuffer } from "../webgl/gl-framebuffer";
import { Texture } from "../core/texture";
import { ARTEngine } from "../engine/render-engine";

export class RenderPass{
  constructor() {
    
  }

  public name: string;

  private textureDependency: Texture[]
  private framebufferDependency: GLFramebuffer[];

  private outPutTarget: GLFramebuffer

  execute(engine: ARTEngine) {
    
  }
}