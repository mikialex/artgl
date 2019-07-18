import { Nullable } from "../type";


/**
 * Framer is for render schedules
 *
 * @export
 * @class Framer
 */
export class Framer{
  
  private userRenderFrame: Nullable<FrameRequestCallback> = null;
  setFrame(frame: FrameRequestCallback) {
    this.userRenderFrame = frame;
  }

  private renderFrame: FrameRequestCallback = (time) => {
    this.frameStart();
    if (this.userRenderFrame !== null) {
      this.userRenderFrame(time);
    }
    this.frameEnd();
    if (this.active) {
      this.tickId = window.requestAnimationFrame(this.renderFrame);
    }
  }
  
  active = false;
  private tickId?: number;

  run() {
    this.active = true;
    this.tickId = window.requestAnimationFrame(this.renderFrame);
  }

  step() {
    
  }

  stop() {
    this.active = false;
    if (this.tickId !== undefined) {
      window.cancelAnimationFrame(this.tickId);
    }
  }

  private frameStart() {
  }

  private frameEnd() {
    
  }
  
}