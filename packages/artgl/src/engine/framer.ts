import { Nullable } from "../type";
import { Accumulator } from "../util/accumulator";
import { Observable } from "../core/observable";


/**
 * Framer is for render schedules
 *
 * @export
 * @class Framer
 */
export class Framer{

  avgRenderFrameTimeLast120Frame: Accumulator = new Accumulator(120)

  onFrameStart: Observable<void> = new Observable()
  onFrameEnd: Observable<number> = new Observable()

  private userRenderFrame: Nullable<FrameRequestCallback> = null;
  setFrame(frame: FrameRequestCallback) {
    this.userRenderFrame = frame;
  }

  private renderFrame: FrameRequestCallback = (time) => {
    this.frameStartTiming(time);
    this.onFrameStart.notifyObservers();
    if (this.userRenderFrame !== null) {
      this.userRenderFrame(time);
    }
    const lastFrameTime = this.frameEndTiming(performance.now());
    this.onFrameEnd.notifyObservers(lastFrameTime);
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
  private frameStartTiming(frameStartTime: number) {
    this.frameStartTime = frameStartTime;
  }

  private frameEndTiming(frameEndTime: number): number {
    const time = frameEndTime - this.frameStartTime;
    this.avgRenderFrameTimeLast120Frame.push(time)
    return time;
  }
  
}