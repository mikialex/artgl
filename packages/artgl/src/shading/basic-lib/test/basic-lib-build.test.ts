
import {
  DirectionalLight, PhongShading, PointLight, Shading,
  PureShading, NormalShading, DepthShading, Vector3, BarycentricWireFrame
} from "../../../artgl";

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

test('phong shader build no error', () => {
  const pointLight = new PointLight();
  pointLight.position = new Vector3(-1, 3, 3);
  pointLight.color = new Vector3(0.9, 0.8, 0.5);
  pointLight.radius = 10;


  const dirLight = new DirectionalLight();
  dirLight.color = new Vector3(0.3, 0.6, 0.8);
  dirLight.direction = new Vector3(1, 1, -1).normalize();

  const phong = new PhongShading<DirectionalLight | PointLight>([dirLight, pointLight]);
  const shading = new Shading().decoCamera().decorate(phong);
  shading.getProgramConfig();
});

test('barycentric shader build no error', () => {
  const shading = new Shading().decorate(new BarycentricWireFrame());
  shading.getProgramConfig();
});
