import { GLRenderer } from "./gl-renderer";
import { TextureFilter, TextureWrap } from "./const";
import { Texture, HTMLImageTexture } from "../core/texture";
import { GLReleasable } from '../type';
import { FramebufferAttachTexture } from "./gl-framebuffer";

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
  private textures: Map<Texture, WebGLTexture>  = new Map();
  // private textures: Map<Texture, WebGLTextureWithVersionIDWrap> = new Map();

  init() {
    const gl = this.renderer.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  getGLTexture(texture: Texture) {
    return this.textures.get(texture);
  }

  deleteGLTexture(texture: Texture) {
    const glTexture = this.getGLTexture(texture);
    this.renderer.gl.deleteTexture(glTexture);
    this.textures.delete(texture);
  }

  createTextureFromImageElement(texture: HTMLImageTexture) {
    const gl = this.renderer.gl;
    const glTexture = this.createWebGLTexture(DefaultTextureDescriptor);
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
  
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    this.textures.set(texture, glTexture);
    return glTexture;
  }

  createTextureForRenderTarget(texture: FramebufferAttachTexture) {
    const gl = this.renderer.gl;
    const glTexture = this.createWebGLTexture(defaultRenderTargetTextureDescriptor)

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
      texture.width, texture.height, border,
      format, type, data);
    
    this.textures.set(texture, glTexture);

    return glTexture;
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
