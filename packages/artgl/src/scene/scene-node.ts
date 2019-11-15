import { Matrix4, generateUUID } from "@artgl/math";
import { Nullable } from "@artgl/shared";
import { Transformation } from "./transformation";
import { Scene, RenderObject } from "../artgl";


type Constructor<T = {}> = new (...args: any[]) => T;

export function ExtendWithSceneNode<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    uuid = generateUUID();
    scene: Nullable<Scene> = null;
    sceneNodeListIndex: number = -1;

    parent: Nullable<SceneNode> = null;
    children: SceneNode[] = [];

    readonly transform: Transformation = new Transformation();

    worldMatrix = new Matrix4();

    visible: boolean = true;

    addChild(node: SceneNode): SceneNode {
      if (node === this) {
        throw 'Cant add a scene node to it self';
      }

      node.traverse(n => {
        if (n.scene !== null) {
          throw 'this node belongs to another scene, remove first'
        }
        n.scene = this.scene;
        if (this.scene !== null) {
          if (n instanceof RenderObject) {
            this.scene.addRenderable(n as RenderObject);
          }
        }
      })

      if (node.parent !== null) {
        node.parent.removeChild(node);
      }
      node.parent = this;
      this.children.push(node);
      return this;
    }

    removeChild(node: SceneNode): SceneNode {

      node.traverse(n => {
        if (this.scene !== null) {
          if (n instanceof RenderObject) {
            this.scene.removeRenderable(n as RenderObject); 
          }
        }
        n.scene = null;
      })

      let index = this.children.indexOf(node);
      if (index !== - 1) {
        node.parent = null;
        this.children.splice(index, 1);
      }
      return this;
    }

    traverse(fn: (sceneNode: SceneNode) => boolean | void): SceneNode {
      function visit(node: SceneNode) {
        if (fn(node) !== false) {
          for (let i = 0; i < node.children.length; i++) {
            visit(node.children[i]);
          }
        }
      }
      visit(this);
      return this;
    }

    traversePair(fn: (sceneNodeParent: Nullable<SceneNode>, sceneNode: SceneNode) => any): any {
      function visit(nodeParent: Nullable<SceneNode>, node: SceneNode) {
        const result = fn(nodeParent, node);
        for (let i = 0; i < node.children.length; i++) {
          visit(node, node.children[i]);
        }
        return result;
      }
      return visit(this.parent, this);
    }

    map(fn: (sceneNode: SceneNode) => SceneNode) {
      const nodes: Map<SceneNode, SceneNode> = new Map();
      const rootNode = this.traversePair((nodeParent: Nullable<SceneNode>, node: SceneNode) => {
        const mapNode = fn(node);
        nodes.set(node, mapNode);
        if (nodeParent !== null && nodes.has(nodeParent)) {
          const mapParentNode = nodes.get(nodeParent);
          if (mapParentNode === undefined) {
            throw 'tree map error: cant find mapped parent'
          }
          mapParentNode.children.push(mapNode);
        }
        return mapNode;
      })
      return rootNode;
    }

    findSubNode(id: string): Nullable<SceneNode> {
      let result: Nullable<SceneNode> = null;
      this.traverse(node => {
        if (node.uuid === id) {
          result = node;
          return false;
        }
      })
      return result;
    }

    localTransformSyncWorldUpdateId = -1;
    updateWorldMatrix(force?: boolean): SceneNode {
      if (this.transform.transformChangedId !== this.localTransformSyncWorldUpdateId || force) {

        if (this.parent === null) {
          this.worldMatrix.copy(this.transform.matrix);
        } else {
          this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.transform.matrix);
        }
        this.localTransformSyncWorldUpdateId = this.transform.transformChangedId;
        force = true;
      }
      var children = this.children;
      for (var i = 0, l = children.length; i < l; i++) {
        children[i].updateWorldMatrix(force);
      }
      return this;
    }
  };
}



export interface SceneNode {
  uuid: string;
  scene: Nullable<Scene>
  parent: Nullable<SceneNode>
  children: SceneNode[]
  visible: boolean
  addChild(node: SceneNode): SceneNode
  removeChild(node: SceneNode): SceneNode
  traverse(fn: (sceneNode: SceneNode) => boolean | void): SceneNode 
  traversePair(fn: (sceneNodeParent: Nullable<SceneNode>, sceneNode: SceneNode) => any): any 
  map(fn: (sceneNode: SceneNode) => SceneNode): void;
  worldMatrix: Matrix4;
  readonly transform: Transformation;
  updateWorldMatrix(force?: boolean): SceneNode
}

export class SceneNodeSelf implements SceneNode { }
export interface SceneNodeSelf extends SceneNode { }
export const SceneNode = ExtendWithSceneNode(SceneNodeSelf)
