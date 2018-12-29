import { GLRenderer } from "./webgl-renderer";
import { generateUUID } from "../math/uuid";
import { TextureFilter, TextureWrap } from "./const";

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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true as any)
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

interface TextureDescriptor {
  minFilter: TextureFilter;
  maxFilter: TextureFilter;
  sWrap: TextureWrap;
  tWrap: TextureWrap;
}