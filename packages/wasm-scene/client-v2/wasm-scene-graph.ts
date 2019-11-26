import { SceneGraph } from "../pkg/wasm_scene";

export class WasmSceneGraph{
    constructor() {
        this.wasmScene = SceneGraph.new();
    }
    free() {
        this.wasmScene.free();
    }

    private wasmScene: SceneGraph;

    createNewNode() {
        // const index = this.wasmScene.
    }
}