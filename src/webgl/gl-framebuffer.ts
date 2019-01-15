export class GLFramebuffer{
  constructor(width:number, height:number) {
    this.width = width;
    this.height = height;
  }

  width: number;
  height: number;
  bindingWebGLTexture: WebGLTexture;
  wegbglFrameBuffer: WebGLFramebuffer;

  // read pixel info from this framebuffer
  readPixels(x:number, y:number, width: number, height: number) {
    
  }

  dispose() {
    
  }
}