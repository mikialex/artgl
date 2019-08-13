import { RenderEngine } from "../engine/render-engine";
import { GraphicResourceReleasable, Nullable } from "../type";

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

export class TextureSource {
  static fromImageElement(image: HTMLImageElement) {
    const data = new TextureSource();
    data.source = image;
    data.width = image.width;
    data.height = image.height;
    return data;
  }

  static forRenderTarget(width: number, height: number) {
    const data = new TextureSource();
    data.source = null;
    data.width = width;
    data.height = height;
    return data;
  }
  source: TexImageSource | ArrayBufferView = null
  width: number;
  height: number;
}

/**
 * texture container for bitmap render data
 * 
 * @export
 * @class Texture
 */
export class Texture implements GraphicResourceReleasable {
  constructor(dataSource: TextureSource) {
    this._dataSource = dataSource;
  }

  private needUpdate: boolean = true;
  setNeedUpdate() {
    this.needUpdate = true;
  }

  isDataTexture: boolean = false;
  private _dataSource: TextureSource;
  private _POTResizedSource: Nullable<TextureSource> = null;
  get rawDataSource() { return this._dataSource }
  get potDataSource() { return this._POTResizedSource }
  get renderUsedDataSource() {
    if (this.potDataSource !== null) {
      return  this._POTResizedSource
    } else {
      return this.rawDataSource
    }
  }

  _webGLMipMapInUsed: boolean = false;
  _mipmapArray: TextureSource[] = [];

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

  get width() {
    return this.renderUsedDataSource.width
  }

  get height() {
    return this.renderUsedDataSource.height
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
    return glTexture;
  }

  releaseGraphics(engine: RenderEngine) {
    engine.renderer.textureManger.deleteGLTexture(this);
  }

  get hasMipMapExist() {
    return this._mipmapArray.length > 0 || this._webGLMipMapInUsed;
  }

  clearMipMap(engine: RenderEngine) {
    if (!this.hasMipMapExist) {
      return;
    }
    // clear mipmap means we need recreate a new webgl texture
    this.releaseGraphics(engine);
    return this;
  }

  useWebGLMipMap(engine: RenderEngine) {
    if (this._mipmapArray.length > 0) {
      throw "this texture has custom mipmap upload, clear before use"
    }
    if (this._webGLMipMapInUsed) {
      return this;
    }
    engine.renderer.textureManger.uploadWebGLMipMap(this.getGLTexture(engine));
    this._webGLMipMapInUsed = true;
    return this;
  }

  useCustomMipMap(engine, sources: TextureSource[]) {
    if (this.hasMipMapExist) {
      throw "this texture has mipmap upload, clear before use"
    }
    engine.renderer.textureManger.uploadWebGLMipMap();
    sources.forEach(source => this._mipmapArray.push(source));
    return this;
  }

}
