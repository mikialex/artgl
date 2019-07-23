import { CopyShading } from "../copy";
import { TSSAOShading } from "../tssao";
import { TSSAOBlendShading } from "../tssao-blend";
import { TAAShading } from "../taa";

test('copy shader build no error', () => {
  const shading = new CopyShading();
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

