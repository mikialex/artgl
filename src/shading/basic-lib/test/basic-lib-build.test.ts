import { PureShading } from "../pure";
import { NormalShading } from "../normal";
import { DepthShading } from "../depth";
import { Shading } from "../../../core/shading";

test('basic shader build no error', () => {
  const shading = new Shading().decorate(new PureShading());
  shading.getProgramConfig();
});

test('normal shader build no error', () => {
  const shading = new Shading().decorate(new NormalShading());
  shading.getProgramConfig();
});

test('depth shader build no error', () => {
  const shading = new Shading().decorate(new DepthShading());
  shading.getProgramConfig();
});
