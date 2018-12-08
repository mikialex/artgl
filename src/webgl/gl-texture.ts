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
    const glProgram = program.getProgram();
    const location = this.gl.getUniformLocation(glProgram, descriptor.name);
    if (location === null) {
      // if you declare a uniform , but not realy used in shader
      // that will may cause null location
      console.warn('create texture uniform fail: ', descriptor.name);
    }
    this.location = location;
    this.currentActiveSlot = -1;
  }
  private gl: WebGLRenderingContext;
  program: GLProgram;
  descriptor: TextureDescriptor;
  location: WebGLUniformLocation;

  webgltexture: Nullable<WebGLTexture> = null;
  currentActiveSlot: number;

  useTexture(renderer: GLRenderer, textureDataStoreId: string): void {
    const webgltexture = renderer.textureManger.getGLTexture(textureDataStoreId);
    let textureSlot = renderer.state.textureSlot.findSlot(webgltexture);
    if (textureSlot === -1) {
      textureSlot = renderer.state.textureSlot.updateSlotTexture(webgltexture);
    }
    this.gl.uniform1i(this.location, textureSlot);
  }
}