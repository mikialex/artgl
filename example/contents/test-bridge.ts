import { Framer } from "../../src/artgl";

export interface TestBridge{
  screenShot();
  testOver();

  framer: Framer
}


export class ViewerTestBridge implements TestBridge {
  async screenShot() { }
  
  async testOver() { }

  framer: Framer = new Framer(); 

}