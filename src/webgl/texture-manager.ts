import { GLRenderer } from "./webgl-renderer";
import { generateUUID } from "../math/uuid";
import { GLTextureType, TextureFilter, TextureWrap } from "./const";

interface textureBindInfo {
  type: GLTextureType,
  texture: WebGLTexture
}

export class GLTextureManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  readonly renderer: GLRenderer;
  readonly gl: WebGLRenderingContext;
  private textures: { [index: string]: WebGLTexture } = {};

  activeTexture(slot: number) {
    if ( this.currentTextureSlot !== slot ) {
      this.gl.activeTexture(slot);
			this.currentTextureSlot = slot;
		}
  }

  private currentTextureSlot = null;
  private currentBindTextures: textureBindInfo[];
  bindTexture(webglType: GLTextureType, webglTexture: WebGLTexture ) {
		if ( this.currentTextureSlot === null ) {
			this.activeTexture(0);
		}
		let boundTexture = this.currentBindTextures[ this.currentTextureSlot ];
		if ( boundTexture === undefined ) {
			boundTexture = { type: undefined, texture: undefined };
      this.currentBindTextures[this.currentTextureSlot] = boundTexture;
		}
		if ( boundTexture.type !== webglType || boundTexture.texture !== webglTexture ) {
			this.gl.bindTexture( webglType, webglTexture);
			boundTexture.type = webglType;
			boundTexture.texture = webglTexture;
		}
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