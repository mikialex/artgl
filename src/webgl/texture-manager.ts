import { GLRenderer } from "./gl-renderer";
import { generateUUID } from "../math/uuid";
import { TextureFilter, TextureWrap } from "./const";
import { Texture } from "../core/texture";
import { GLReleasable } from '../type';

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

const defaultRenderTargetTextureDescriptor = DefaultTextureDescriptor;

interface WebGLTextureWithVersionIDWrap{
  version: number;
  texture: WebGLTexture;
}

/**
 * responsible for webgl texture resource allocation and reallocation
 * outside request create webgl texture from given source or description
 * 
 * @export
 * @class GLTextureManager
 */
export class GLTextureManager implements GLReleasable{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  readonly renderer: GLRenderer;
  private textures: Map<string, WebGLTexture>  = new Map();
  // private textures: Map<Texture, WebGLTextureWithVersionIDWrap> = new Map();

  init() {
    const gl = this.renderer.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  getGLTexture(storeId: string) {
    return this.textures.get(storeId);
  }

  deleteGLTexture(storeId: string) {
    const texture = this.getGLTexture(storeId);
    this.renderer.gl.deleteTexture(texture);
    this.textures.delete(storeId);
  }

  createTextureFromImageElement(image: HTMLImageElement, config?: TextureDescriptor): string {
    if (config === undefined) {
      config = DefaultTextureDescriptor;
    }
    const gl = this.renderer.gl;
    const glTexture = this.createWebGLTexture(config);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const id = generateUUID();
    this.textures.set(id, glTexture);
    return id;
  }

  createTextureForRenderTarget(width: number, height: number): string {
    const gl = this.renderer.gl;
    const glTexture = this.createWebGLTexture(defaultRenderTargetTextureDescriptor)

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
      width, height, border,
      format, type, data);

    const id = generateUUID();
    this.textures.set(id, glTexture);
    return id;
  }
  
  private createWebGLTexture(config: TextureDescriptor): WebGLTexture {
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

  releaseGL() {
    
  }
}
