import { PureShading } from "../pure";
import { NormalShading } from "../normal";
import { DepthShading } from "../depth";

test('basic shader build no error', () => {
  const shading = new PureShading();
  shading.getProgramConfig();
});

test('normal shader build no error', () => {
  const shading = new NormalShading();
  shading.getProgramConfig();
});

test('depth shader build no error', () => {
  const shading = new DepthShading();
  shading.getProgramConfig();
});
