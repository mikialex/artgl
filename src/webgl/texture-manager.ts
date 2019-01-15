import { GLRenderer } from "./webgl-renderer";
import { generateUUID } from "../math/uuid";
import { TextureFilter, TextureWrap } from "./const";


interface TextureDescriptor {
  minFilter: TextureFilter;
  maxFilter: TextureFilter;
  sWrap: TextureWrap;
  tWrap: TextureWrap;
}


/**
 * responsible for webgltexture resource allocation and deallocation
 * outside request create webgltexture from given source or description
 * 
 * @export
 * @class GLTextureManager
 */
export class GLTextureManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  readonly renderer: GLRenderer;
  readonly gl: WebGLRenderingContext;
  private textures: { [index: string]: WebGLTexture } = {};

  init() {
    const gl = this.renderer.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true as any);
  }

  getGLTexture(storeId: string) {
    return this.textures[storeId];
  }

  deleteGLTexture(storeId: string) {
    const texture = this.getGLTexture(storeId);
    this.gl.deleteTexture(texture);
  }

  createTextureFromImageElement(image: HTMLImageElement): string {
    const gl = this.renderer.gl;
    const texture = gl.createTexture();
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
    return id;
  }

  createTextureForRenderTarget(width: number, height: number): WebGLTexture {
    
    const gl = this.renderer.gl;

    const texture = gl.createTexture();
    if (texture === null) {
      throw 'webgl texture create fail';
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
                  width, height, border,
                  format, type, data);
  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const id = generateUUID();
    this.textures[id] = texture;
    return texture;
  }

  private createTexture(config: TextureDescriptor) {
    const gl = this.renderer.gl;
    const texture = gl.createTexture();
    switch (config.minFilter) {
      case TextureFilter.linear:
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        break;
      case TextureFilter.nearest:
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        break;
      default:
        break;
    }
  }
}
