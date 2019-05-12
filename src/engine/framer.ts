import { Nullable } from "../type";


/**
 * Framer is for render schedules
 *
 * @export
 * @class Framer
 */
export class Framer{
  constructor() {
    
  }

  // frame controls
  private userRenderFrame: Nullable<FrameRequestCallback> = null;
  setFrame(frame: FrameRequestCallback) {
    this.renderFrame = frame;
  }

  private renderFrame: FrameRequestCallback = (time) => {
    this.frameStart();
    if (this.userRenderFrame !== null) {
      this.userRenderFrame(time);
    }
    this.frameEnd();
    if (this.isAutoRenderActive) {
      window.requestAnimationFrame(this.renderFrame);
    }
  }
  
  isAutoRenderActive = false;
  tickId?: number;

  run() {
    this.isAutoRenderActive = true;
    this.tickId = window.requestAnimationFrame(this.renderFrame);
  }

  stop() {
    this.isAutoRenderActive = false;
    if (this.tickId !== undefined) {
      window.cancelAnimationFrame(this.tickId);
    }
  }

  private frameStart() {
  }

  private frameEnd() {
    
  }
}