import { GLProgram } from "./program";
import { GLRenderer } from "./webgl-renderer";
import { Nullable } from "../type";
import { GLTextureManager } from "./texture-manager";
import { GLTextureSlot } from "./states/gl-texture-slot";

export enum GLTextureType{
  texture2D,
}

export interface TextureDescriptor {
  name: string,
  type: GLTextureType,
}

/**
 * for texture uniform uploading
 * 
 * @export
 * @class GLTexture
 */
export class GLTexture{
  constructor(program: GLProgram, descriptor: TextureDescriptor) {
    this.program = program;
    this.textureManger = program.renderer.textureManger;
    this.slotManager = program.renderer.state.textureSlot;
    this.gl = program.getRenderer().gl;
    this.name = descriptor.name
    const glProgram = program.getProgram();
    const location = this.gl.getUniformLocation(glProgram, descriptor.name);
    this.isActive = location !== null;
    this.location = location;
    this.currentActiveSlot = -1;
  }
  name: string;
  private gl: WebGLRenderingContext;
  private textureManger: GLTextureManager;
  private slotManager: GLTextureSlot;
  private program: GLProgram;
  readonly descriptor: TextureDescriptor;
  private location: WebGLUniformLocation;
  isActive: boolean;


  webgltexture: Nullable<WebGLTexture> = null;
  currentActiveSlot: number;

  useTexture(webgltexture: WebGLTexture): void {
    if (!this.isActive) {
      return;
    }
    const textureSlot = this.slotManager.updateSlotTexture(webgltexture);
    if (this.currentActiveSlot !== textureSlot) {
      this.currentActiveSlot = textureSlot;
      this.gl.uniform1i(this.location, textureSlot);
    }
  }

}