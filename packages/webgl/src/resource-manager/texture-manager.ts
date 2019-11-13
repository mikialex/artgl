import { GLRenderer } from "../gl-renderer";
import { Texture, TextureWrap, TextureFilter } from "../../core/texture";
import { FramebufferAttachTexture } from "../gl-framebuffer";
import { GLTextureSlot } from "../states/gl-texture-slot";
import { TextureSource } from "../../core/texture-source";
import { CubeTexture } from "../../core/texture-cube";
import { GLTextureTypeRaw } from "../const";

interface TextureDescriptor {
  minFilter: TextureFilter;
  magFilter: TextureFilter;
  wrapS: TextureWrap;
  wrapT: TextureWrap;
}

const DefaultTextureDescriptor: TextureDescriptor = {
  minFilter: TextureFilter.nearest,
  magFilter: TextureFilter.nearest,
  wrapS: TextureWrap.clampToEdge,
  wrapT: TextureWrap.clampToEdge,
}

const defaultRenderTargetTextureDescriptor = DefaultTextureDescriptor;

type StoredTexture = Texture | CubeTexture;

/**
 * responsible for webgl texture resource allocation and reallocation
 * outside request create webgl texture from given source or description
 * 
 * @export
 * @class GLTextureManager
 */
export class GLTextureManager implements GLReleasable {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
    this.slotManager = renderer.state.textureSlot;
    const gl = this.renderer.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }
  readonly renderer: GLRenderer;
  private slotManager: GLTextureSlot;
  private textures: Map<StoredTexture, WebGLTexture> = new Map();
  texturesVersion: Map<StoredTexture, number> = new Map();

  getGLTexture(texture: StoredTexture) {
    return this.textures.get(texture);
  }

  deleteGLTexture(texture: StoredTexture) {
    const glTexture = this.getGLTexture(texture);
    if (glTexture === undefined) {
      return
    }
    this.renderer.gl.deleteTexture(glTexture);
    this.textures.delete(texture);
    this.texturesVersion.delete(texture);
  }

  createTextureForRenderTarget(texture: FramebufferAttachTexture) {
    const gl = this.renderer.gl;
    const glTexture = this.createEmptyWebGLTexture()
    this.updateTextureParameters(glTexture, defaultRenderTargetTextureDescriptor, gl.TEXTURE_2D)

    this.slotManager.bindTexture(gl.TEXTURE_2D, glTexture);
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat,
      texture.originalWidth, texture.originalHeight, border,
      format, type, data);

    this.textures.set(texture, glTexture);

    return glTexture;
  }

  private updateTextureParameters(
    glTexture: WebGLTexture,
    description: TextureDescriptor,
    bindType: GLTextureTypeRaw
  )
    : WebGLTexture {
    const gl = this.renderer.gl;
    this.slotManager.bindTexture(bindType, glTexture);
    gl.texParameteri(bindType, gl.TEXTURE_MIN_FILTER, description.minFilter);
    gl.texParameteri(bindType, gl.TEXTURE_MIN_FILTER, description.magFilter);
    gl.texParameteri(bindType, gl.TEXTURE_WRAP_S, description.wrapS);
    gl.texParameteri(bindType, gl.TEXTURE_WRAP_T, description.wrapT);
    return glTexture
  }

  private createEmptyWebGLTexture(): WebGLTexture {
    const gl = this.renderer.gl;
    const glTexture = gl.createTexture();
    if (glTexture === null) {
      throw 'webgl texture create fail';
    }
    return glTexture
  }

  createWebGLCubeTexture(texture: CubeTexture): WebGLTexture {
    const gl = this.renderer.gl;
    texture.validateAllTextureSource();

    const glTexture = this.createEmptyWebGLTexture();
    this.updateTextureParameters(glTexture, texture, gl.TEXTURE_CUBE_MAP)

    const level = 0;
    const internalFormat = gl.RGBA;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      level, internalFormat, format, type,
      texture.positiveXMap!.source as TexImageSource);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      level, internalFormat, format, type,
      texture.positiveYMap!.source as TexImageSource);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      level, internalFormat, format, type,
      texture.positiveZMap!.source as TexImageSource);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      level, internalFormat, format, type,
      texture.negativeXMap!.source as TexImageSource);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      level, internalFormat, format, type,
      texture.negativeYMap!.source as TexImageSource);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      level, internalFormat, format, type,
      texture.negativeZMap!.source as TexImageSource);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    this.textures.set(texture, glTexture);
    this.texturesVersion.set(texture, texture.getVersion())
    return glTexture;
  }

  createWebGLTexture(texture: Texture): WebGLTexture {
    const gl = this.renderer.gl;
    const glTexture = this.createEmptyWebGLTexture();
    this.updateTextureParameters(glTexture, texture, gl.TEXTURE_2D)
    const renderUsedDataSource = texture.getRenderUsedDataSource(this.renderer.ctxVersion === 2);
    if (texture.isDataTexture) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        renderUsedDataSource.width, renderUsedDataSource.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, renderUsedDataSource.source as ArrayBufferView);
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D, 0,
        gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        renderUsedDataSource.source as TexImageSource);
    }

    this.textures.set(texture, glTexture);
    this.texturesVersion.set(texture, texture.getVersion())
    return glTexture;
  }

  uploadWebGLMipMap(glTexture: WebGLTexture) {
    const gl = this.renderer.gl;
    this.slotManager.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  uploadCustomMipMap(_glTexture: WebGLTexture, _sources: TextureSource[]) {
    // TODO
  }

  releaseGL() {
    // TODO
  }
}
