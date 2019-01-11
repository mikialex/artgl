import ARTGL from '../../src/export';

let engine;

export function initARTGL(canvas: HTMLCanvasElement) {
  engine = new ARTGL.ARTEngine(canvas);
}