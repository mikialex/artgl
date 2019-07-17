import * as ARTGL from '../../src/artgl'



//==>

let canvas = document.querySelector('canvas');
const engine = new ARTGL.ARTEngine(canvas);
const scene = new ARTGL.Scene();

const geometry = new ARTGL.CubeGeometry();

const mesh = new ARTGL.Mesh();
const line = new ARTGL.Line();
const points = new ARTGL.Points();


engine.render(scene);

//==<
