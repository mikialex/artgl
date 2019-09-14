import { MathUtil } from "../math";

type ImageLike = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

export function resizeImageFORWebGL(
  image: ImageLike,
  needsPowerOfTwo: boolean,
  utilCanvas: HTMLCanvasElement,
  maxSize: number) {

  let scale = 1;

  // handle case if texture exceeds max size
  if (image.width > maxSize || image.height > maxSize) {
    scale = maxSize / Math.max(image.width, image.height);
  }

  // only perform resize if necessary
  if (scale < 1 || needsPowerOfTwo) {

    const width = MathUtil.floorPowerOfTwo(scale * image.width);
    const height = MathUtil.floorPowerOfTwo(scale * image.height);

    utilCanvas.width = width;
    utilCanvas.height = height;

    var context = utilCanvas.getContext('2d')!;
    context.drawImage(image, 0, 0, width, height);

    console.warn(`Texture has been resized from (${image.width}, ${image.height}) to (${width}, ${height}).`);

    return context.getImageData(10, 10, 50, 50);;

  }


}
