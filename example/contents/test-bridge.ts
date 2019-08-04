import { Framer } from "../../src/artgl";
import { RenderConfig } from '../../viewer/src/components/conf/interface';

export interface TestBridge{
  screenShotCompareElement(element: HTMLElement, goldenPath: string);

  framer: Framer
  testConfig?: RenderConfig
}


export class ViewerTestBridge implements TestBridge {
  async screenShotCompareElement(element: HTMLElement, goldenPath: string) { }

  framer: Framer = new Framer(); 
  testConfig?: RenderConfig;

  reset() {
    this.framer = new Framer();
    this.testConfig = undefined;
  }
}

export class HeadlessTestBridge implements TestBridge {

  async screenShotCompareElement(element: HTMLElement, goldenPath: string) {
    await window.screenShotCompareElement(element, goldenPath);
   }

  framer: Framer = new Framer(); 

}

window.HeadlessTestBridge = HeadlessTestBridge
