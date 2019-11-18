import { Framer, Observable, Nullable, Size } from "artgl";
import { RenderConfig } from '../../viewer/src/components/conf/interface';

export class TestBridge implements TestBridge {
  async screenShotCompare(goldenPath: string) {
    if (window.screenShotCompareElement) {
      await window.screenShotCompareElement(goldenPath, this.refreshGolden);
    }
  }

  private canvas: Nullable<HTMLCanvasElement> = null;
  refreshGolden = false;
  requestCanvas() {
    if (this.canvas === null) {
      throw `test is not prepared`
    }
    return this.canvas
  }

  // /img/demo.jpg
  getResourceURL(url: string) {
    return this.resourceBaseURL + url;
  }

  resourceBaseURL: string = "http://localhost:3001/"
  framer: Framer = new Framer();
  testConfig?: RenderConfig | RenderConfig[];

  resizeObserver: Observable<Size> = new Observable()

  constructor() {
    window.addEventListener("resize", this.onResize)
  }

  reset(canvas: HTMLCanvasElement) {
    this.framer = new Framer();
    this.testConfig = undefined;
    this.resizeObserver.clear();
    this.canvas = canvas;
  }

  makeTestCtx() {
    const preTestCanvas = document.querySelector('#testCanvas')
    if (preTestCanvas !== null) {
      document.removeChild(preTestCanvas);
    }
    const canvas = new HTMLCanvasElement();
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.id = 'testCanvas'
    document.appendChild(canvas);
    this.reset(canvas);
  }

  private onResize = () => {
    if (this.canvas === null) {
      return
    }
    this.resizeObserver.notifyObservers({
      width: this.canvas.offsetWidth,
      height: this.canvas.offsetHeight,
    })
  }

  dispose() {
    window.removeEventListener("resize", this.onResize)
  }
}

