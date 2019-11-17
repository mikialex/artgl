import {
  PointLight, DirectionalLight, AmbientLight, ExposureController,
  BarycentricWireFrame, PhongShading, Shading, Vector3, ToneMapType
} from 'artgl';

// import { DirectionalShadowMap } from 'artgl/src/shadow-map/directional-shadowmap';
import { Application } from '@/application';

export default function (app: Application) {
  const pointLight = new PointLight();
  pointLight.position = new Vector3(-1, 3, 3);
  pointLight.color = new Vector3(0.9, 0.8, 0.5);
  pointLight.radius = 10;

  const dirLight = new DirectionalLight();
  dirLight.color = new Vector3(0.3, 0.6, 0.8);
  dirLight.direction = new Vector3(1, 1, -1).normalize();
  // const dirShadow = new DirectionalShadowMap(dirLight);
  // dirShadow.updateShadowMatrix();
  // app.pipeline.directionalShadowMap = dirShadow;

  const ambient = new AmbientLight();
  ambient.color = new Vector3(0.3, 0.3, 0.4);

  const exposureController = new ExposureController();

  const wireframe = new BarycentricWireFrame();

  const phong = new PhongShading<DirectionalLight | PointLight>([dirLight, pointLight]);

  let shading = new Shading()
    .decoCamera()
    .decorate(app.pipeline.dof)
    .decorate(phong)
    .decorate(ambient)
    .decorate(exposureController)
    .decorate(wireframe)
    // .decorate(dirShadow, 'dirShadow') 
  
  shading.afterShaderCompiled.add((conf) => {
    console.log(conf)
  })


  const exposureConfig = {
    name: 'exposureControl',
    value: [
      {
        name: 'exposureMax',
        value: 1 / exposureController.toneMappingExposure,
        onChange: (value: number) => {
          exposureController.toneMappingExposure = 1 / value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 5,
            step: 0.1
          },
        ]
      },
      {
        name: 'exposureWhitePoint',
        value: exposureController.toneMappingWhitePoint,
        onChange: (value: number) => {
          exposureController.toneMappingWhitePoint = value;
          app.pipeline.resetSample();
        },
        show: () => {
          return exposureController.toneMapType === ToneMapType.Uncharted2ToneMapping
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 5,
            step: 0.1
          },
        ]
      },
      {
        name: 'exposureToneMapType',
        value: exposureController.toneMapType,
        valueConfig: {
          type: "select",
          selectItem: Object.keys(ToneMapType)
        },
        onChange: (value: ToneMapType) => {
          exposureController.toneMapType = value;
          app.pipeline.resetSample();
        },
      }
    ]
  }

  const phongConfig = {
    name: "phong",
    value: [
      {
        name: 'shininess',
        value: phong.shininess,
        onChange: (value: number) => {
          phong.shininess = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 100,
            step: 1
          },
        ]
      }
    ]
  }

  const dofConfig = {
    name: "progressive dof",
    value: [
      {
        name: 'focusLength',
        value: app.pipeline.dof.focusLength,
        onChange: (value: number) => {
          app.pipeline.dof.focusLength = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 50,
            step: 0.1
          },
        ]
      },
      {
        name: 'coc radius',
        value: app.pipeline.dof.blurRadius,
        onChange: (value: number) => {
          app.pipeline.dof.blurRadius = value;
          app.pipeline.resetSample();
        },
        editors: [
          {
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.001
          },
        ]
      }
    ]
  }

  const config = {
    name: 'scene shading',
    value: [
      exposureConfig,
      phongConfig,
      dofConfig
    ]
  }

  return { shading, config };
}