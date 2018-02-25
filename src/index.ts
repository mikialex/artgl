import { WebGLRenderer } from "./core/webgl-renderer";


window.onload = function () {
  let canv = document.querySelector('canvas');
  let renderer = new WebGLRenderer(canv);
}
