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

    // createShading(): Shading{
    //     const index = this.wasmScene.create_shading();
    //     return new Shading()
    // }

    // createBuffer(): {

    // }

    // createGeometry(): Geometry{
    //     const index = this.wasmScene.create_shading();
    //     return new Shading()
    // }

    batchDrawcall() {
        this.wasmScene.batch_drawcalls();
    }

    readonly root: WasmSceneNode
}

export class WASMIndexedObject{
    constructor(scene: WasmSceneGraph, index: number) {
        this.index = index;
        this.scene = scene;
    }
    readonly index: number;
    readonly scene: WasmSceneGraph
}

export class Geometry extends WASMIndexedObject{
}

export class Shading  extends WASMIndexedObject{
}

export class RenderObject{
    shading: Shading
    geometry: Geometry
}

export class WasmSceneNode extends WASMIndexedObject{
    
    readonly index: number;
    readonly scene: WasmSceneGraph
    private parent: WasmSceneNode | null = null;
    private children: WasmSceneNode[] = [];

    private renderData: RenderObject = null;
    get renderObject() {
        return this.renderData;
    }

    set renderObject(obj: RenderObject) {
        this.renderData = obj;
        this.scene.getWasm().set_render_discriptor(
            this.index, obj.geometry.index, obj.shading.index
        )
    }

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