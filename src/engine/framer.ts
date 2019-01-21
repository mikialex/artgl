import { Nullable } from "../type";

export class Framer{
  constructor() {
    
  }

  //// frame controls
  private userRenderFrame: Nullable<FrameRequestCallback> = null;
  private renderFrame: FrameRequestCallback = (time) => {
    this.frameStart();
    this.userRenderFrame(time);
    this.frameEnd();
    if (this.isAutoRenderActive) {
      window.requestAnimationFrame(this.renderFrame);
    }
  }
  isAutoRenderActive = false;
  setFrame(frame: FrameRequestCallback) {
    this.renderFrame = frame;
  }

  run() {
    if (!this.userRenderFrame) {
      throw 'frame function is not set';
    }
    this.isAutoRenderActive = true;
    window.requestAnimationFrame(this.renderFrame);
  }

  stop() {
    this.isAutoRenderActive = false;
  }

  private frameStart() {
  }

  private frameEnd() {
    
  }
}