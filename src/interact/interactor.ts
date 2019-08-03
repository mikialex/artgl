import { Controller } from "./controller";
import { Vector2 } from "../math/vector2";

interface ControllerCallback {
  controller: Controller,
  callback: Function
}

// const prev = new Vector2();
const mousePosition = new Vector2();
const v1 = new Vector2();

// interactor responsible for handle web event from an element
// and dispatch control event to controllers
export class Interactor{
  constructor(inputElement:HTMLElement) {
    this.inputElement = inputElement;
    this.bind();
  }

  enabled: boolean = true;
  mouseButton: number = -1; // -1 is default state for no button pressed 
  inputElement: HTMLElement;
  prev = new Vector2();

  private controllers: Controller[] = [];

  private bind(): void {
    const el = this.inputElement;
    this.mouseButton = -1;
    el.addEventListener('mousemove', this.onMouseMove, false);
    el.addEventListener('mousedown', this.onMouseDown, false);
    el.addEventListener('mouseup', this.onMouseUp, false);
    el.addEventListener('wheel', this.onMouseWheel, false);
    // el.addEventListener('keydown', this.eventLoop, false);
    // el.addEventListener('keyup', this.cancelLoop, false);
    el.addEventListener('contextmenu', this.preventContentMenu, false);
  }
  private unbind(): void {
    const el = this.inputElement;
    this.mouseButton = -1;
    el.removeEventListener('mousemove', this.onMouseMove);
    el.removeEventListener('mousedown', this.onMouseDown);
    el.removeEventListener('mouseup', this.onMouseUp);
    el.removeEventListener('wheel', this.onMouseWheel);
    // el.removeEventListener('keydown', this.eventLoop);
    // el.removeEventListener('keyup', this.cancelLoop);
    el.removeEventListener('contextmenu', this.preventContentMenu, false);
  }

  private preventContentMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.enabled) {
      return;
    }
    mousePosition.set(event.clientX, event.clientY);
    v1.copy(this.prev).sub(mousePosition);
    if (this.mouseButton === 0) {
      this.groupEmit(this.leftMouseMoveCallBacks, v1);
    }
    if (this.mouseButton === 2) {
      this.groupEmit(this.rightMouseMoveCallBacks, v1);
    }
    this.prev.copy(mousePosition);
  }

  private onMouseDown = (event: MouseEvent) => {
    if (!this.enabled) {
      return;
    }
    this.prev.set(event.clientX, event.clientY);
    this.mouseButton = event.button;
    event.preventDefault();
  }

  private onMouseUp = (event: MouseEvent) => {
    if (!this.enabled) {
      return;
    }
    this.groupEmit(this.mouseUpCallBacks);
    this.mouseButton = -1;
  }

  private onMouseWheel = (event: WheelEvent) => {
    if (!this.enabled) {
      return;
    }
    let delta = 0;
    if ((event as any).wheelDelta !== void 0) {
      // WebKit / Opera / Explorer 9
      delta = (event as any).wheelDelta;
    } else if (event.deltaY !== void 0) {
      // Firefox
      delta = -event.deltaY;
    }
    delta = delta > 0 ? 1.1 : 0.9;
    this.groupEmit(this.mouseWheelCallBacks, delta);
  }

  private leftMouseMoveCallBacks: ControllerCallback[] = [];
  private rightMouseMoveCallBacks: ControllerCallback[] = [];
  private mouseWheelCallBacks: ControllerCallback[] = [];
  private mouseDownCallBacks: ControllerCallback[] = [];
  private mouseUpCallBacks: ControllerCallback[] = [];

  private groupEmit(callBackList: ControllerCallback[], ...param: any) {
    callBackList.forEach(callback => {
      callback.callback(...param);
    });
  }
  private removeController(controller: Controller, callBackList: ControllerCallback[]) {
    callBackList = callBackList.filter(callback => { return callback.controller === controller });
  }

  public bindLeftMouseMove(controller: Controller, callback: (offset: Vector2) => any) {
    this.leftMouseMoveCallBacks.push({controller, callback});
  }

  public bindRightMouseMove(controller: Controller, callback: (offset: Vector2) => any) {
    this.rightMouseMoveCallBacks.push({controller, callback});
  }

  public bindMouseWheel(controller: Controller, callback: (delta: number) => any) {
    this.mouseWheelCallBacks.push({controller, callback});
  }

  public bindMouseDown(controller: Controller, callback: () => any) {
    this.mouseDownCallBacks.push({controller, callback});
  }

  public bindMouseUp(controller: Controller, callback: () => any) {
    this.mouseUpCallBacks.push({controller, callback});
  }

  public unbindControllerAllListener(controller: Controller) {
    this.removeController(controller, this.mouseUpCallBacks);
    this.removeController(controller, this.rightMouseMoveCallBacks);
    this.removeController(controller, this.mouseWheelCallBacks);
    this.removeController(controller, this.mouseDownCallBacks);
    this.removeController(controller, this.mouseUpCallBacks);
  }

  dispose() {
    this.unbind();
    this.leftMouseMoveCallBacks = [];
    this.rightMouseMoveCallBacks = [];
    this.mouseWheelCallBacks = [];
    this.mouseDownCallBacks = [];
    this.mouseUpCallBacks = [];
  }
}