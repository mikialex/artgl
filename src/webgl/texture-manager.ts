import { GLRenderer } from "./webgl-renderer";
import { generateUUID } from "../math/uuid";

export class GLTextureManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  renderer: GLRenderer;
  private textures: { [index: string]: WebGLTexture } = {};

  getGLTexture(storeId: string) {
    return this.textures[storeId];
  }

  createTextureFromImageElement(image: HTMLImageElement) {
    const gl = this.renderer.gl;
    var texture = gl.createTexture();
    if (texture === null) {
      throw 'webgl texture create fail';
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const id = generateUUID();
    this.textures[id] = texture;
  }
}