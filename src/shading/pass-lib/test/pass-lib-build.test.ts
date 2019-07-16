import { CopyShading } from "../copy";
import { TSSAOShading } from "../tssao";
import { TSSAOBlendShading } from "../tssao-blend";
import { TAAShading } from "../taa";
import { DepthShading } from "../depth";

test('copy shader build no error', () => {
  const shading = new CopyShading();
  shading.getProgramConfig();
});

test('depth shader build no error', () => {
  const shading = new DepthShading();
  shading.getProgramConfig();
});

test('taa shader build no error', () => {
  const shading = new TAAShading();
  shading.getProgramConfig();
});

test('tssao-blend shader build no error', () => {
  const shading = new TSSAOBlendShading();
  shading.getProgramConfig();
});

test('tssao shader build no error', () => {
  const shading = new TSSAOShading();
  shading.getProgramConfig();
});

