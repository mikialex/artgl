import * as ARTGL from '../../src/artgl'



//==>

let canv = document.querySelector('canvas');
const engine = new ARTGL.ARTEngine(canv);
const scene = new ARTGL.Scene();

let testMesh = new ARTGL.Mesh();
scene.root.addChild(testMesh);

engine.render(scene);

//==<
