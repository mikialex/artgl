import testScene from './scene'
import testDrawPrimitive from './draw-primitives'
import { HeadlessTestBridge } from './test-bridge'

type ConstructorTypeOf<T> = new (...args: any[]) => T;

// This should impl by node puppeteer, and exposed on headless window
// declare function screenShotCompareElement(element: HTMLElement, goldenPath: string);
declare global {
  interface Window {
    artglExamples: Example[],
    HeadlessTestBridge: ConstructorTypeOf<HeadlessTestBridge>;
    screenShotCompareElement(element: HTMLElement, goldenPath: string);
  }
}

interface Example{
  name: string, 
  build: Function
}

export const examples: Example[] = [
  {
    name: "basic scene",
    build: testScene
  },
  {
    name: "primitive",
    build: testDrawPrimitive
  },
];


window.artglExamples = examples;
window.HeadlessTestBridge = HeadlessTestBridge

