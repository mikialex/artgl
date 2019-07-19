import { Nullable } from "../type";
import { Accumulator } from "../util/accumulator";


/**
 * Framer is for render schedules
 *
 * @export
 * @class Framer
 */
export class Framer{

  avgRenderFrameTimeLast120Frame: Accumulator = new Accumulator(120)

  private userRenderFrame: Nullable<FrameRequestCallback> = null;
  setFrame(frame: FrameRequestCallback) {
    this.userRenderFrame = frame;
  }

  private renderFrame: FrameRequestCallback = (time) => {
    this.frameStart(time);
    if (this.userRenderFrame !== null) {
      this.userRenderFrame(time);
    }
    this.frameEnd(performance.now());
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
    if (!this.active) {
      this.renderFrame(performance.now());
    }
  }

  stop() {
    this.active = false;
    if (this.tickId !== undefined) {
      window.cancelAnimationFrame(this.tickId);
    }
  }

  frameStartTime = 0;
  private frameStart(frameStartTime: number) {
    this.frameStartTime = frameStartTime;
  }

  private frameEnd(frameEndTime: number) {
    this.avgRenderFrameTimeLast120Frame.push(frameEndTime - this.frameStartTime)
  }
  
}