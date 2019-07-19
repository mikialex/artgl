import * as ARTGL from '../../src/artgl'



//==>

let canvas = document.querySelector('canvas');
const engine = new ARTGL.RenderEngine(canvas);
const scene = new ARTGL.Scene();

const geometry = new ARTGL.CubeGeometry();
const shading = new ARTGL.NormalShading();

const mesh = new ARTGL.Mesh();
const line = new ARTGL.Line();
const points = new ARTGL.Points();

mesh.technique = new ARTGL.Technique(shading);
line.technique = new ARTGL.Technique(shading);
points.technique = new ARTGL.Technique(shading);

mesh.geometry = geometry;
line.geometry = geometry;
points.geometry =geometry;

line.transform.position.x = -10;
points.transform.position.x = 10;

engine.render(scene);

//==<
