import * as ARTGL from '../../src/artgl'

//==
// # 基本使用
//
//==

//==>
let canv = document.querySelector('canvas');

const engine = new ARTGL.ARTEngine();

const scene = new ARTGL.Scene();

const camera = new ARTGL.PerspectiveCamera();

let testMesh = new ARTGL.Mesh();

scene.root.addChild(testMesh);

engine.render(scene);

//==<