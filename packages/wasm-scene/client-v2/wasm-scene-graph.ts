import { SceneGraph } from "../pkg/wasm_scene";

export class WasmSceneGraph{
    constructor() {
        this.wasmScene = SceneGraph.new();
        this.root = new WasmSceneNode(this, 0);
    }
    free() {
        this.wasmScene.free();
    }

    private wasmScene: SceneGraph;
    getWasm() { return this.wasmScene;}

    createNewNode(): WasmSceneNode {
        const index = this.wasmScene.create_new_node();
        const node = new WasmSceneNode(this, index);
        return node;
    }

    batchDrawcall() {
        this.wasmScene.batch_drawcalls();
    }

    readonly root: WasmSceneNode
}

export class WasmSceneNode{
    constructor(scene: WasmSceneGraph, index: number) {
        this.scene = scene;
        this.index = index;
    }
    
    readonly index: number;
    readonly scene: WasmSceneGraph
    private parent: WasmSceneNode | null = null;
    private children: WasmSceneNode[] = [];

    add(node: WasmSceneNode) {
        if (node.parent !== null) {
            throw 'before add to another, remove first'
        }
        if (node.scene !== this.scene) {
            throw 'only node in same scene can add together'
        }

        this.children.push(node);
        node.parent = this;
        this.scene.getWasm().add(this.index, node.index);
    }

    remove(node: WasmSceneNode) {
        const index = this.children.indexOf(node);
        if ( index === -1) {
            throw 'remove a not exist node'
        }
        node.parent = null;
        this.children.splice(index, 1);
        this.scene.getWasm().remove(node.index);
    }
}