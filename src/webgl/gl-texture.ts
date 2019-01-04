import { GLProgram } from "artgl";
import { GLRenderer } from "./webgl-renderer";
import { Nullable } from "type";

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
  private program: GLProgram;
  readonly descriptor: TextureDescriptor;
  private location: WebGLUniformLocation;
  isActive: boolean;


  webgltexture: Nullable<WebGLTexture> = null;
  currentActiveSlot: number;

  useTexture(renderer: GLRenderer, textureDataStoreId: string): void {
    if (!this.isActive) {
      return;
    }
    const webgltexture = renderer.textureManger.getGLTexture(textureDataStoreId);
    const textureSlot = renderer.state.textureSlot.updateSlotTexture(webgltexture);
    this.currentActiveSlot = textureSlot;
    this.gl.uniform1i(this.location, textureSlot);
  }
}