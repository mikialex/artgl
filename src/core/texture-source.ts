import { Nullable } from "../type";
import { MathUtil } from "../math";
import { resizeImageFORWebGL } from "../util/texture-util";

/**
 * Container for texture data storage, not only data self,
 * but also some meta info like width height, because data texture need this
 */
export class TextureSource {

  // use getter is avoid break ci test
  static _utilCanvas: HTMLCanvasElement
  static get utilCanvas() {
    if (TextureSource._utilCanvas === undefined) {
      TextureSource._utilCanvas = document.createElement('canvas');
    }
    return TextureSource._utilCanvas
  }
  
  static WEBGL_LARGEST_TEXTURE_SIZE = 4096

  static fromImageElement(image: HTMLImageElement) {
    const data = new TextureSource();
    data.source = image;
    data.width = image.width;
    data.height = image.height;
    data.updateIsPOT();
    return data;
  }

  static async fromUrl(url: string) {
    const img = await new Promise<HTMLImageElement>((re, rj) => {
      const image = document.createElement('img');
      image.crossOrigin = "*"
      image.src = url;
      image.onload = () => {
        re(image)
      }
      image.onerror = (err) => {
        rj(err)
      }
    })
    return TextureSource.fromImageElement(img);
  }

  static fromPixelDataUint8(buffer: Uint8ClampedArray, width: number, height: number) {
    const data = new TextureSource();
    data.source = buffer;
    data.width = width;
    data.height = height;
    data.updateIsPOT();
    return data;
  }

  static forRenderTarget(width: number, height: number) {
    const data = new TextureSource();
    data.source = null;
    data.width = width;
    data.height = height;
    data.updateIsPOT();
    return data;
  }

  // null source is use to create fbo attached texture
  source: Nullable<TexImageSource | ArrayBufferView> = null
  width: number = 1;
  height: number = 1;
  isPOT: boolean = false;
  updateIsPOT() {
    this.isPOT = MathUtil.isPowerOfTwo(this.width) && MathUtil.isPowerOfTwo(this.height);
  }

  get sizeDimensionValid() {
    return this.width < TextureSource.WEBGL_LARGEST_TEXTURE_SIZE &&
    this.height < TextureSource.WEBGL_LARGEST_TEXTURE_SIZE
  }

  // two consideration: POT, size too large
  // todo maybe need cache
  isValid(needPOT: boolean): boolean {
    if (needPOT) {
      return this.sizeDimensionValid && this.isPOT
    } else {
      return this.sizeDimensionValid
    }
  }

  createPOTTextureSource(needPOT: boolean) {
    return resizeImageFORWebGL(this, needPOT, TextureSource.utilCanvas, 4096)
  }

}
