import { GLRenderer } from "./gl-renderer";
import { generateUUID } from "../math/uuid";
import { TextureFilter, TextureWrap } from "./const";

enum TextureFormat {
  RGBA,
  RGB,
  LUMINANCE_ALPHA,
  LUMINANCE,
  ALPHA
}

interface TextureDescriptor {
  minFilter: TextureFilter;
  maxFilter: TextureFilter;
  sWrap: TextureWrap;
  tWrap: TextureWrap;
}

const DefaultTextureDescriptor = {
  minFilter: TextureFilter.nearest,
  maxFilter: TextureFilter.nearest,
  sWrap: TextureWrap.clampToEdge,
  tWrap: TextureWrap.clampToEdge,
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
    this.renderer.gl.deleteTexture(texture);
    this.textures[storeId] = undefined;
  }

  createTextureFromImageElement(image: HTMLImageElement, config?: TextureDescriptor): string {
    if (config === undefined) {
      config = DefaultTextureDescriptor;
    }
    const gl = this.renderer.gl;
    const texture = this.createTexture(config);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const id = generateUUID();
    this.textures[id] = texture;
    return id;
  }

  createTextureForRenderTarget(width: number, height: number): string {
    
    const gl = this.renderer.gl;

    const texture = gl.createTexture();
    if (texture === null) {
      throw 'webgl texture create fail';
    }
    this.fillRenderTarget(texture, width, height);
    const id = generateUUID();
    this.textures[id] = texture;
    return id;
  }
  // updateRenderTargetSize

  fillRenderTarget(glTexture: WebGLTexture, width: number, height: number) {
    const gl = this.renderer.gl;
    gl.bindTexture(gl.TEXTURE_2D, glTexture);

    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
      width, height, border,
      format, type, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return glTexture;
  }

  private createTexture(config: TextureDescriptor): WebGLTexture {
    const gl = this.renderer.gl;
    const texture = gl.createTexture();
    if (texture === null) {
      throw 'webgl texture create fail';
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, config.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, config.maxFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, config.sWrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, config.tWrap);
    return texture;
  }
}
