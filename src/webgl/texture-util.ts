import { MathUtil } from "../math";

type ImageLike = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

export function resizeImage(image: ImageLike, needsPowerOfTwo, canvas: HTMLCanvasElement, maxSize): ImageData {

  let scale = 1;

  // handle case if texture exceeds max size
  if (image.width > maxSize || image.height > maxSize) {
    scale = maxSize / Math.max(image.width, image.height);
  }

  // only perform resize if necessary
  if (scale < 1 || needsPowerOfTwo === true) {

    const width = MathUtil.floorPowerOfTwo(scale * image.width);
    const height = MathUtil.floorPowerOfTwo(scale * image.height);

    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    console.warn('Texture has been resized from (' + image.width + 'x' + image.height + ') to (' + width + 'x' + height + ').');

    return context.getImageData(10, 10, 50, 50);;

  }


}
