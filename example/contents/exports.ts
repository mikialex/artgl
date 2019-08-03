import renderRange from './render-range'
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
    name: "primitive",
    build: testDrawPrimitive
  },
  {
    name: "render range",
    build: renderRange
  },
];


window.artglExamples = examples;
window.HeadlessTestBridge = HeadlessTestBridge

