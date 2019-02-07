import { GLProgram } from "../program";
import { Nullable } from "../../type";
import { GLTextureSlot } from "../states/gl-texture-slot";
import { ChannelType } from "../../core/material";

export enum GLTextureType{
  texture2D,
}

export interface TextureDescriptor {
  name: string,
  channelType?: ChannelType,
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
    this.program = program;
    this.slotManager = program.renderer.state.textureSlot;
    this.gl = program.getRenderer().gl;
    this.name = descriptor.name
    this.channel = descriptor.channelType;
    const glProgram = program.getProgram();
    const location = this.gl.getUniformLocation(glProgram, descriptor.name);
    this.isActive = location !== null;
    this.location = location;
    this.currentActiveSlot = -1;
  }
  name: string;
  channel: ChannelType;
  private gl: WebGLRenderingContext;
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
      this.program.renderer.stat.uniformUpload++;
      this.currentActiveSlot = textureSlot;
      this.gl.uniform1i(this.location, textureSlot);
    }
  }

}