import { RenderEngine } from "../render-engine";
import { GraphicResourceReleasable } from "../type";
import { Nullable } from "../../.."
import { TextureSource } from "@artgl/shared/src/texture-source";
import { PixelFormat, TextureWrap, TextureFilter, PixelDataType } from "@artgl/webgl";

export async function textureFromUrl(url: string) {
  return new Texture(await TextureSource.fromUrl(url));
}

/**
 * Texture container, for mipmap operate, sample behavior
 * 
 */
export class Texture implements GraphicResourceReleasable {
  constructor(dataSource: TextureSource) {
    this._dataSource = dataSource;
  }

  private version = 0;
  setNeedUpdate() {
    this.version++;
  }
  getVersion() {
    return this.version;
  }

  isDataTexture: boolean = false;

  private _dataSource: TextureSource;
  private _convertedResizedSource: Nullable<TextureSource> = null;
  get rawDataSource() { return this._dataSource }
  get convertedDataSource() { return this._convertedResizedSource }
  getRenderUsedDataSource(isWebGL2: boolean): TextureSource {
    if (this._dataSource.isValid(this.getNeedUsePOT(isWebGL2))) {
      return this._dataSource
    } else {
      if (this._convertedResizedSource === null) {
        this._convertedResizedSource = this._dataSource.createPOTTextureSource(true)
      }
      return this._convertedResizedSource!
    }
  }

  _webGLMipMapInUsed: boolean = false;
  _mipmapArray: TextureSource[] = [];

  private _format: PixelFormat = PixelFormat.RGBA
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

  getNeedUsePOT(isWebGL2: boolean) {
    if (isWebGL2) {
      return false;
    }
    return this._wrapS !== TextureWrap.clampToEdge ||
      this._wrapT !== TextureWrap.clampToEdge ||
      this._magFilter !== TextureFilter.nearest ||
      this._minFilter !== TextureFilter.nearest
  }

  private _dataType: PixelDataType = PixelDataType.UNSIGNED_BYTE
  get dataType() { return this._dataType }

  private _wrapS: TextureWrap = TextureWrap.clampToEdge
  get wrapS() { return this._wrapS }

  private _wrapT: TextureWrap = TextureWrap.repeat
  get wrapT() { return this._wrapT }


  private _magFilter: TextureFilter = TextureFilter.nearest
  get magFilter() { return this._magFilter }

  private _minFilter: TextureFilter = TextureFilter.nearest
  get minFilter() { return this._minFilter }

  get originalWidth() {
    return this._dataSource.width
  }

  get originalHeight() {
    return this._dataSource.height
  }

  getGLTexture(engine: RenderEngine): WebGLTexture {
    const glTexture = engine.renderer.textureManger.getGLTexture(this)
    if (glTexture === undefined) {
      this.setNeedUpdate();
      return engine.renderer.textureManger.createWebGLTexture(this)
    }
    if (engine.renderer.textureManger.texturesVersion.get(this) !== this.version) {
      this.releaseGraphics(engine);
      this.setNeedUpdate();
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

  useCustomMipMap(engine: RenderEngine, sources: TextureSource[]) {
    if (this.hasMipMapExist) {
      throw "this texture has mipmap upload, clear before use"
    }
    // TODO
    // engine.renderer.textureManger.uploadWebGLMipMap();
    sources.forEach(source => this._mipmapArray.push(source));
    return this;
  }

}
