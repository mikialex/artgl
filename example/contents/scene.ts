import * as ARTGL from '../../src/artgl'

//==
// # 基本使用
// 
// 在一个场景中，渲染一个简单的box
//==

//==>
let canv = document.querySelector('canvas');

const engine = new ARTGL.ARTEngine(canv);

const scene = new ARTGL.Scene();

let testMesh = new ARTGL.Mesh();

scene.root.addChild(testMesh);

engine.render(scene);

//==<
