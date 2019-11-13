import { GLProgram } from "../program";
import { GLTextureSlot } from "../../states/gl-texture-slot";
import { GLRenderer } from '../../gl-renderer';
import { GLTextureTypeRaw } from "../../const";
import { TextureDescriptor, GLTextureType } from "../../interface";
import { Nullable } from "@artgl/shared";


export class GLTextureUniform {
  constructor(program: GLProgram, descriptor: TextureDescriptor, location: WebGLUniformLocation) {
    this.renderer = program.renderer;
    this.slotManager = program.renderer.state.textureSlot;
    this.gl = program.renderer.gl;
    this.name = descriptor.name
    this.location = location;
    this.currentActiveSlot = -1;
    this.textureType = descriptor.type;
  }
  name: string;
  private gl: WebGLRenderingContext;
  private slotManager: GLTextureSlot;
  private renderer: GLRenderer;
  private location: Nullable<WebGLUniformLocation>;
  private textureType: GLTextureType

  webglTexture: Nullable<WebGLTexture> = null;
  private currentActiveSlot: number;
  getCurrentActiveSlot() {
    return this.currentActiveSlot;
  }

  useTexture(webglTexture: WebGLTexture): void {

    let textureSlot;
    if (this.textureType === GLTextureType.texture2D) {
      textureSlot = this.slotManager.updateSlotTexture(webglTexture, GLTextureTypeRaw.texture2D);
    } else {
      textureSlot = this.slotManager.updateSlotTexture(webglTexture, GLTextureTypeRaw.textureCubeMap);
    }

    if (this.currentActiveSlot !== textureSlot) {
      this.renderer.stat.uniformUpload++;
      this.currentActiveSlot = textureSlot;
      this.gl.uniform1i(this.location, textureSlot);
    }
  }

}