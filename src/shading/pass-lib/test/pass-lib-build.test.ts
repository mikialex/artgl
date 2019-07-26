import { CopyShading } from "../copy";
import { TSSAOShading } from "../tssao";
import { TSSAOBlendShading } from "../tssao-blend";
import { TAAShading } from "../taa";
import { Shading } from "../../../core/shading";

test('copy shader build no error', () => {
  const copyShading = new Shading().decorate(new CopyShading());
  copyShading.getProgramConfig();
});

test('taa shader build no error', () => {
  const taaShading = new TAAShading()
  const taaShader = new Shading().decorate(taaShading);
  taaShader.getProgramConfig();
});

test('tssao-blend shader build no error', () => {
  const composeShading = new TSSAOBlendShading()
  const composeShader = new Shading().decorate(composeShading);
  composeShader.getProgramConfig();
});

test('tssao shader build no error', () => {
  const tssaoShading = new TSSAOShading();
  const tssaoShader = new Shading().decorate(tssaoShading);
  tssaoShader.getProgramConfig();
});

