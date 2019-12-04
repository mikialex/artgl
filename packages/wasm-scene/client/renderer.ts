import { WebGLRenderer, SceneGraph } from "../pkg/wasm_scene";
import { WasmSceneGraph } from "./wasm-scene-graph";

export class Renderer{
    constructor(canvas: HTMLCanvasElement) {
        this.wasmRenderer = WebGLRenderer.new(canvas);
        // this.wasmRenderer.make_demo_program();
        this.wasmRenderer.make_demo_buffer();
        this.wasmRenderer.make_program(
            `            
            attribute vec4 position;
            void main() {
                gl_Position = position;
            }
            `,
            `
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
            `
        );
    }

    private wasmRenderer: WebGLRenderer

    render(scene: WasmSceneGraph) {
        this.wasmRenderer.render(scene.getWasm());
    }
}