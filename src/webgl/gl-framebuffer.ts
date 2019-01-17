


export class GLFramebuffer{
  constructor(name: string, width: number, height: number) {
    this.name = name;
    this.width = width;
    this.height = height;
  }
  name: string;

  width: number;
  height: number;
  bindingWebGLTexture: WebGLTexture;
  wegbglFrameBuffer: WebGLFramebuffer;

  attachTexture() {
    
  }

  // read pixel info from this framebuffer
  readPixels(x:number, y:number, width: number, height: number) {
    
  }

  dispose() {
    
  }
}