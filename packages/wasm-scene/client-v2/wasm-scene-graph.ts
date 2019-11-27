import { SceneGraph } from "../pkg/wasm_scene";

export class WasmSceneGraph{
    constructor() {
        this.wasmScene = SceneGraph.new();
    }
    free() {
        this.wasmScene.free();
    }

    private wasmScene: SceneGraph;

    createNewNode(): number {
        return this.wasmScene.create_new_node();
    }
}

export class WasmSceneNode{
    constructor(scene: WasmSceneGraph) {
        this.scene = scene;
        this.index = this.scene.createNewNode()
    }
    
    readonly index: number;
    readonly scene: WasmSceneGraph
    private parent: WasmSceneNode | null = null;
    private children: WasmSceneNode[] = [];

    add(node: WasmSceneNode) {
        if (node.scene !== this.scene) {
            throw 'only node in same scene can add together'
        }
    }

    remove(node: WasmSceneNode) {
        if (this.children.indexOf(node) === -1) {
            throw 'remove a not exist node'
        }
    }
}