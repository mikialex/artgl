import * as ARTGL from '../../src/artgl'



//==>

let canv = document.querySelector('canvas');
const engine = new ARTGL.ARTEngine(canv);
const scene = new ARTGL.Scene();

const geometry = new ARTGL.BoxGeometry();

const mesh = new ARTGL.Mesh();
const line = new ARTGL.Line();
const points = new ARTGL.Points();

engine.render(scene);

//==<
