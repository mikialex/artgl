import { GLRenderer } from "./gl-renderer";
import { Texture, TextureWrap, TextureFilter } from "../core/texture";
import { GLReleasable } from '../type';
import { FramebufferAttachTexture } from "./gl-framebuffer";
import { GLTextureSlot } from "./states/gl-texture-slot";
import { TextureSource } from "../core/texture-source";

interface TextureDescriptor {
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  wrapS: TextureWrap;
  wrapT: TextureWrap;
}

const DefaultTextureDescriptor: TextureDescriptor  = {
  minFilter: TextureFilter.nearest,
  magFilter: TextureFilter.nearest,
  wrapS: TextureWrap.clampToEdge,
  wrapT: TextureWrap.clampToEdge,
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
    this.slotManager = renderer.state.textureSlot;
    this.POTResizeCanvas = document.createElement('canvas')
    const gl = this.renderer.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }
  readonly renderer: GLRenderer;
  private slotManager: GLTextureSlot;
  private textures: Map<Texture, WebGLTexture> = new Map();
  private POTResizeCanvas: HTMLCanvasElement;

  getGLTexture(texture: Texture) {
    return this.textures.get(texture);
  }

  deleteGLTexture(texture: Texture) {
    const glTexture = this.getGLTexture(texture);
    if (glTexture === undefined) {
      return 
    }
    this.renderer.gl.deleteTexture(glTexture);
    this.textures.delete(texture);
  }

  createTextureForRenderTarget(texture: FramebufferAttachTexture) {
    const gl = this.renderer.gl;
    const glTexture = this.createEmptyWebGLTexture(defaultRenderTargetTextureDescriptor)

    this.slotManager.bindTexture(gl.TEXTURE_2D, glTexture);
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

  private createEmptyWebGLTexture(description: TextureDescriptor): WebGLTexture {
    const gl = this.renderer.gl;
    const glTexture = gl.createTexture();
    if (glTexture === null) {
      throw 'webgl texture create fail';
    }
    this.slotManager.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, description.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, description.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, description.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, description.wrapT);
    return glTexture
  }
  
  createWebGLTexture(texture: Texture): WebGLTexture {
    const gl = this.renderer.gl;
    const glTexture = this.createEmptyWebGLTexture(texture);
    if (texture.isDataTexture) { // which is a data texture
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        texture.width, texture.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, texture.renderUsedDataSource.source as ArrayBufferView);
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D, 0,
        gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        texture.renderUsedDataSource.source as TexImageSource);
    }

    this.textures.set(texture, glTexture);
    return glTexture;
  }

  uploadWebGLMipMap(glTexture: WebGLTexture) {
    const gl = this.renderer.gl;
    this.slotManager.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.generateMipmap(gl.TEXTURE_2D); 
  }

  uploadCustomMipMap(glTexture: WebGLTexture, sources: TextureSource[]) {
    // TODO
  }

  releaseGL() {
    // TODO
  }
}
