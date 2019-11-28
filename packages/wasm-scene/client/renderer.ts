import { WebGLRenderer } from "../pkg/wasm_scene";

export class Renderer{
    constructor(canvas: HTMLCanvasElement) {
        this.wasmRenderer = WebGLRenderer.new(canvas);
    }

    private wasmRenderer: WebGLRenderer
}