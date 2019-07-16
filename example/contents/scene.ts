import * as ARTGL from '../../src/artgl'

export default async function () {


  //==
  // # 基本使用
  // 
  // 在一个3d场景中，绘制一个简单的立方体
  //==


  //==>

  let canv = document.querySelector('canvas');

  const engine = new ARTGL.ARTEngine(canv);

  const scene = new ARTGL.Scene();

  let testMesh = new ARTGL.Mesh();

  scene.root.addChild(testMesh);

  engine.render(scene);

  //==<


}