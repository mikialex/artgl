import { Controler } from "./controler";
import { Vector2 } from "../math/vector2";


const prev = new Vector2();
const mousePosition = new Vector2();
const v1 = new Vector2();

// interactor resposible for handle web event from an element
// and dispatch control event to controlers
export class Interactor{
  constructor(inputElement:HTMLElement) {
    this.inputElement = inputElement;
    this.bind();
  }

  mouseButton: number;
  inputElement: HTMLElement;

  controlers: Controler[] = [];

  public bind(): void {
    const el = this.inputElement;
    this.mouseButton = -1;
    el.addEventListener('mousemove', this.onMouseMove, false);
    el.addEventListener('mousedown', this.onMouseDown, false);
    el.addEventListener('mouseup', this.onMouseUp, false);
    el.addEventListener('mousewheel', this.onMouseWheel, false);
    // el.addEventListener('keydown', this.eventLoop, false);
    // el.addEventListener('keyup', this.cancelLoop, false);
  }
  public unbind(): void {
    const el = this.inputElement;
    this.mouseButton = -1;
    el.removeEventListener('mousemove', this.onMouseMove);
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('mousewheel', this.onMouseWheel);
    // el.removeEventListener('keydown', this.eventLoop);
    // el.removeEventListener('keyup', this.cancelLoop);
  }

  private onMouseMove = (event: MouseEvent) => {
    mousePosition.set(event.clientX, event.clientY);
    v1.copy(mousePosition).sub(prev);
    if (this.mouseButton === 0) { this.leftMouseMove(v1); }
    if (this.mouseButton === 2) { this.rightMouseMove(v1); }
    prev.copy(mousePosition);
  }

  private onMouseDown = (event: MouseEvent) => {
    prev.set(event.clientX, event.clientY);
    this.mouseButton = event.button;
  }

  private onMouseUp = (event: MouseEvent) => {
    this.mouseUp();
    this.mouseButton = -1;
  }

  private onMouseWheel = (event: MouseWheelEvent) => {
    let delta = 0;
    if (event.wheelDelta !== void 0) {
      // WebKit / Opera / Explorer 9
      delta = event.wheelDelta;
    } else if (event.deltaY !== void 0) {
      // Firefox
      delta = -event.deltaY;
    }
    delta = delta > 0 ? 1.1 : 0.9;
    this.mouseWheel(delta);
  }

  public leftMouseMove(offset: Vector2): void { }
  public rightMouseMove(offset: Vector2): void { }
  public mouseWheel(delta: number): void { }
  public mouseDown(): void { }
  public mouseUp(): void { }


  dispose() {
    
  }
}