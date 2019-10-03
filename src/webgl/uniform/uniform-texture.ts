import { GLProgram } from "../program";
import { Nullable } from "../../type";
import { GLTextureSlot } from "../states/gl-texture-slot";
import { GLRenderer } from '../gl-renderer';

export enum GLTextureType{
  texture2D,
  textureCube,
}

export interface TextureDescriptor {
  name: string,
  type: GLTextureType,
}

/**
 * for texture uniform uploading
 * 
 * @export
 * @class GLTextureUniform
 */
export class GLTextureUniform{
  constructor(program: GLProgram, descriptor: TextureDescriptor) {
    this.renderer = program.renderer;
    this.slotManager = program.renderer.state.textureSlot;
    this.gl = program.renderer.gl;
    this.name = descriptor.name
    const glProgram = program.getProgram();
    const location = this.gl.getUniformLocation(glProgram, descriptor.name);
    this.isActive = location !== null;
    this.location = location;
    this.currentActiveSlot = -1;
  }
  name: string;
  private gl: WebGLRenderingContext;
  private slotManager: GLTextureSlot;
  private renderer: GLRenderer;
  private location: Nullable<WebGLUniformLocation>;
  isActive: boolean;


  webglTexture: Nullable<WebGLTexture> = null;
  currentActiveSlot: number;

  useTexture(webglTexture: WebGLTexture): void {
    if (!this.isActive) {
      return;
    }
    const textureSlot = this.slotManager.updateSlotTexture(webglTexture);
    if (this.currentActiveSlot !== textureSlot) {
      this.renderer.stat.uniformUpload++;
      this.currentActiveSlot = textureSlot;
      this.gl.uniform1i(this.location, textureSlot);
    }
  }

}