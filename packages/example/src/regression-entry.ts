import { examples } from "./exports";
import { TestBridge } from "./test-bridge";

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