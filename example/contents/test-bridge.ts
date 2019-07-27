import { Framer } from "../../src/artgl";

export interface TestBridge{
  screenShotCompareElement(element: HTMLElement, goldenPath: string);

  framer: Framer
}


export class ViewerTestBridge implements TestBridge {
  async screenShotCompareElement(element: HTMLElement, goldenPath: string) { }

  framer: Framer = new Framer(); 

}

export class HeadlessTestBridge implements TestBridge {

  async screenShotCompareElement(element: HTMLElement, goldenPath: string) {
    await window.screenShotCompareElement(element, goldenPath);
   }

  framer: Framer = new Framer(); 

}

window.HeadlessTestBridge = HeadlessTestBridge
