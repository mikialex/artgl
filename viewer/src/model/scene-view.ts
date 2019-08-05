import { Vector3 } from '../../../src/math';
import { SceneNode } from '../../../src/scene/scene-node';
import { Scene } from '../../../src/scene/scene';
import { Mesh, OBJLoader, NormalShading, Geometry, Material, Shading } from '../../../src/artgl';
import { loadStringFromFile } from '../../../src/util/file-io';

 
const objLoader = new OBJLoader();

interface BufferView{
  name: string
  type: string,
  dataByteSize: number;
}
export class GeometryView{
  uuid: string;
  name: string;
  buffers: BufferView[]
  static create(geometry: Geometry): GeometryView {
    const view = new GeometryView();
    view.uuid = geometry.uuid;
    view.name = geometry.name === undefined ? 'unnamed' : geometry.name;
    view.buffers = [];
    for (const key in geometry._bufferDatum) {
      if (geometry._bufferDatum.hasOwnProperty(key)) {
        const bufferdata = geometry._bufferDatum[key];
        view.buffers.push({
          name: key,
          type: 'bufferdata',
          dataByteSize: bufferdata.getDataSizeByte()
        })
      }
    }
    if (geometry.indexBuffer) {
      view.buffers.push({
        name: 'index',
        type: 'indexbuffer',
        dataByteSize: geometry.indexBuffer.getDataSizeByte()
      })
    }
    return view;
  }
}

export class MaterialView{
  uuid: string;
  name: string;
  static create(material: Material): MaterialView {
    const view = new MaterialView();
    view.uuid = material.uuid;
    // view.name = geometry.name === undefined ? 'unnamed' : geometry.name;
    // view.buffers = [];
    // for (const key in geometry.bufferDatum) {
    //   if (geometry.bufferDatum.hasOwnProperty(key)) {
    //     const bufferdata = geometry.bufferDatum[key];
    //     view.buffers.push({
    //       name: key,
    //       type: 'bufferdata',
    //       dataByteSize: bufferdata.getDataSizeByte()
    //     })
    //   }
    // }
    return view;
  }
}

export class SceneView{
  root: SceneNodeView
  geometries: Map<string, GeometryView> = new Map();
  materials: Map<string, MaterialView> = new Map();
  
  collectEntity(node: SceneNode) {
    if (node instanceof Mesh) {
      const geometry = node.geometry;
      const material = node.material;
      if (geometry !== undefined) {
        if (!this.geometries.has(geometry.uuid)) {
          this.geometries.set(geometry.uuid, GeometryView.create(geometry));
        }
      }
      if (material !== undefined) {
        if (!this.geometries.has(material.uuid)) {
          this.materials.set(material.uuid, MaterialView.create(material));
        }
      }
    }
  }

  static create(scene: Scene): SceneView {
    const view = new SceneView();
    view.root = scene.root.map((node: SceneNode) => {
      view.collectEntity(node);
      return SceneNodeView.create(node);
    })
    return view;
  }

  static deleteNode(id: string, scene: Scene) {
    const result = scene.root.findSubNode(id);
    if (result === undefined) {
      return;
    }
    if (result.parent) {
      result.parent.removeChild(result);
    } else { // scene root
      scene.setRootNode(new SceneNode())
    }
  }

  static async loadObj(id: string, scene: Scene) {
    const node = scene.root.findSubNode(id);
    if (node === undefined) {
      return;
    }
    const objstr = await loadStringFromFile();
    if(!objstr && objstr.length === 0){
      return ;
    }
    const geo = objLoader.parse(objstr);
    const mesh = new Mesh();
    mesh.geometry = geo;
    mesh.shading = new Shading().decorate(new NormalShading());
    node.addChild(mesh);
  }
}

export class SceneNodeView{
  position = new Vector3();
  uuid: string;
  type = 'node';
  
  children: SceneNodeView[] = [];
  static create(node: SceneNode): SceneNodeView{
    const nodeview = new SceneNodeView();
    nodeview.position.copy(node.transform.position);
    nodeview.uuid = node.uuid;
    if (node instanceof Mesh) {
      nodeview.type = 'mesh'
    }
    return nodeview;
  }

}