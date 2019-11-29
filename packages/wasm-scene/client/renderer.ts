import { WebGLRenderer, SceneGraph } from "../pkg/wasm_scene";
import { WasmSceneGraph } from "./wasm-scene-graph";

export class Renderer{
    constructor(canvas: HTMLCanvasElement) {
        this.wasmRenderer = WebGLRenderer.new(canvas);
        this.wasmRenderer.make_demo_program();
        this.wasmRenderer.make_demo_buffer();
    }

    private wasmRenderer: WebGLRenderer

    render(scene: WasmSceneGraph) {
        this.wasmRenderer.render(scene.getWasm());
    }
}