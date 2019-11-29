import { WebGLRenderer, SceneGraph } from "../pkg/wasm_scene";

export class Renderer{
    constructor(canvas: HTMLCanvasElement) {
        this.wasmRenderer = WebGLRenderer.new(canvas);
        this.wasmRenderer.make_demo_program();
    }

    private wasmRenderer: WebGLRenderer

    render(scene: SceneGraph) {
        
    }
}