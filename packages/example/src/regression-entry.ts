import { examples } from "./exports";
import { TestBridge } from "./test-bridge";

// This should impl by node puppeteer, and exposed on headless window
// declare function screenShotCompareElement(element: HTMLElement, goldenPath: string);
declare global {
  interface Window {
    startRegression(): Promise<void>
    screenShotCompareElement(goldenPath: string, refreshGolden: boolean): Promise<void>;
  }
}

const bridge = new TestBridge();

async function preformTest(bailMode: boolean = false) {
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    bridge.makeTestCtx();
    try {
      await example.build(bridge);
    } catch (error) {
      if (bailMode === true) {
        throw error;
      }
    }
  }
}


async function startRegression(refreshGolden: boolean = false, bailMode: boolean = false) {
  bridge.refreshGolden = refreshGolden;
  await preformTest();
}

window.startRegression = startRegression