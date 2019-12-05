import renderRange from '../contents/render-range'
import testDrawPrimitive from '../contents/draw-primitives'
import barycentric from '../contents/barycentric-wireframe'
import texture from '../contents/texture'
import skybox from '../contents/sky-box'
import uvView from '../contents/uv-view'
import perf from '../contents/performance'

export interface Example{
  name: string,  // show in url
  title: string, // show in title
  description?: string, // des text
  build: Function
}

export const examples: Example[] = [
  {
    name: "primitive",
    title: "Primitive type",
    description: "Different draw mode, mesh / line / points",
    build: testDrawPrimitive
  },
  {
    name: "render-range",
    title: "Use RenderRange",
    build: renderRange
  },
  {
    name:  "barycentric-wireframe",
    title: "Barycentric wireframe shading",
    build: barycentric
  },
  {
    name: "texture",
    title: "Use texture",
    build: texture
  },
  {
    name:  "Skybox",
    title: "CubeMap skybox",
    build: skybox
  },
  {
    name:  "uv-view",
    title: "UV viewer",
    build: uvView
  },
  {
    name:  "performance",
    title: "test",
    build: perf
  },
];



