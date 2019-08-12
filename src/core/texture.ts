import { RenderEngine } from "../engine/render-engine";
import { GraphicResourceReleasable } from "../type";

export const enum PixelFormat {
  AlphaFormat = 1021,
  RGBFormat = 1022,
  RGBAFormat = 1023,
}

export const enum PixelDataType {
  UNSIGNED_BYTE,
  UNSIGNED_SHORT_5_6_5,
  UNSIGNED_SHORT_4_4_4_4,
  UNSIGNED_SHORT_5_5_5_1,
  FLOAT,
}

export const enum TextureWrap {
  repeat = 0x2901,
  clampToEdge = 0x812F,
  mirroredRepeat = 0x8370
}

export const enum TextureFilter {
  nearest = 0x2600,
  linear = 0x2601,
  nearest_mipmap_nearest = 0x2700,
  linear_mipmap_nearest = 0x2701,
  nearest_mipmap_linear = 0x2702,
  linear_mipmap_linear = 0x2703
}

type WebGLTextureSource = TexImageSource | ArrayBufferView;

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export class Texture implements GraphicResourceReleasable {
  constructor(dataSource: WebGLTextureSource) {
    this._dataSource = dataSource;
  }

  isDataTexture: boolean = false;

  private needUpdate: boolean = true;

  private _dataSource: WebGLTextureSource;
  get dataSource() { return this._dataSource }

  private mipmapArray: WebGLTextureSource[] = [];
  private useWebGLMipMap: boolean = true;

  private _format: PixelFormat = PixelFormat.RGBAFormat
  get format() { return this._format }
  set format(value) {
    this.setNeedUpdate();
    this._format = value;
  }
  setFormat(format: PixelFormat) {
    this.setNeedUpdate();
    this._format = format;
    return this;
  }

  private _dataType: PixelDataType = PixelDataType.UNSIGNED_BYTE
  get dataType() { return this._dataType }

  private _wrapS: TextureWrap = TextureWrap.clampToEdge
  get wrapS() { return this._wrapS }

  private _wrapT: TextureWrap = TextureWrap.clampToEdge
  get wrapT() { return this._wrapT }


  private _magFilter: TextureFilter = TextureFilter.nearest
  get magFilter() { return this._magFilter }

  private _minFilter: TextureFilter = TextureFilter.nearest
  get minFilter() { return this._minFilter }

  private _width: number = 0;
  get width() {
    if (this.isDataTexture) {
      return this._width;
    } else {
      return (this.dataSource as TexImageSource).width;
    }
  }
  setDataWidth(width: number) {
    this._width = width;
  }

  private _height: number = 0;
  get height() {
    if (this.isDataTexture) {
      return this._height;
    } else {
      return (this.dataSource as TexImageSource).height;
    }
  }
  setDataHeight(height: number) {
    this._height = height;
  }


  setNeedUpdate() {
    this.needUpdate = true;
  }

  getGLTexture(engine: RenderEngine): WebGLTexture {
    const glTexture = engine.renderer.textureManger.getGLTexture(this)
    if (glTexture === undefined) {
      this.needUpdate = false;
      return engine.renderer.textureManger.createWebGLTexture(this)
    }
    if (this.needUpdate) {
      this.releaseGraphics(engine);
      this.needUpdate = false;
      return engine.renderer.textureManger.createWebGLTexture(this)
    }
  }

  releaseGraphics(engine: RenderEngine) {
    engine.renderer.textureManger.deleteGLTexture(this);
  }

  generateWebGLMipMap() {
    // TODO
    return this;
  }

}
