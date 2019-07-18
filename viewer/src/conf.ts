import { Application } from './application';
import { RenderConfig } from './components/conf/interface'

export function createConf(app: Application): RenderConfig {
  return {
    name: 'root',
    type: 'folder',
    value: [
      {
        name: 'canvas',
        value: [
          {
            name: 'renderSize',
            value: [
              {
                name: 'width',
                value: app.engine.renderer.width,
                onChange: (value: number) => {
                  app.sampleCount = 0;
                  app.engine.setActualSize(value, app.engine.renderer.height);
                },
                editors: [
                  {
                    type: 'slider',
                    min: 10,
                    max: 500,
                    step: 1
                  },
                ]
              },
              {
                name: 'height',
                value: app.engine.renderer.height,
                onChange: (value: number) => {
                  app.sampleCount = 0;
                  app.engine.setActualSize(app.engine.renderer.width, value);
                },
                editors: [
                  {
                    type: 'slider',
                    min: 10,
                    max: 500,
                    step: 1
                  },
                ]
              },
            ]
          },
        ]
      },
      {
        name: 'engine',
        value: [
          {
            name: 'preferUseVAO',
            value: app.engine.preferVAO,
            onChange: (value: boolean) => {
              app.engine.preferVAO = value
            },
          },
          {
            name: 'enableUniformDiffUpload',
            value: app.engine.renderer.enableUniformDiff,
            onChange: (value: boolean) => {
              app.engine.renderer.enableUniformDiff = value
            },
            description: 'this is a demo description'
          },
          {
            name: 'TAA',
            value: [
              {
                name: 'enable',
                value: app.pipeline.enableTAA,
                onChange: (value: boolean) => {
                  app.pipeline.enableTAA = value;
                  if (!value) {
                    app.sampleCount = 0;
                  }
                },
              },
            ]
          },
          {
            name: 'TSSAO',
            value: [
              {
                name: 'enable',
                value: app.pipeline.enableTSSAO,
                onChange: (value: boolean) => {
                  app.pipeline.enableTSSAO = value;
                  if (!value) {
                    app.pipeline.composeTech.uniforms.get('u_tssaoComposeRate').setValue(0);
                  } else {
                    app.pipeline.composeTech.uniforms.get('u_tssaoComposeRate').setValue(1.0);
                  }
                },
              },
              {
                name: 'composeRate',
                value: app.pipeline.composeTech.uniforms.get('u_tssaoComposeRate').value,
                onChange: (value: number) => {
                  app.pipeline.composeTech.uniforms.get('u_tssaoComposeRate').setValue(value);
                },
                editors: [
                  {
                    type: 'slider',
                    min: 0,
                    max: 4,
                    step: 0.1
                  },
                ]
              },
              {
                name: 'composeThreshold',
                value: app.pipeline.composeTech.uniforms.get('u_tssaoComposeThreshold').value,
                onChange: (value: number) => {
                  app.pipeline.composeTech.uniforms.get('u_tssaoComposeThreshold').setValue(value);
                },
                editors: [
                  {
                    type: 'slider',
                    min: 0,
                    max: 4,
                    step: 0.1
                  },
                ]
              },
              {
                name: 'radius',
                value: app.pipeline.tssaoTech.uniforms.get('u_aoRadius').value,
                onChange: (value: number) => {
                  app.pipeline.tssaoTech.uniforms.get('u_aoRadius').setValue(value);
                  app.sampleCount = 0;
                },
                editors: [
                  {
                    type: 'slider',
                    min: 0.1,
                    max: 10,
                    step: 0.1
                  },
                ]
              },
              {
                name: 'sample_count_to_show',
                value: app.pipeline.composeTech.uniforms.get('u_tssaoShowThreshold').value,
                onChange: (value: number) => {
                  app.pipeline.composeTech.uniforms.get('u_tssaoShowThreshold').setValue(value);
                },
                editors: [
                  {
                    type: 'slider',
                    min: 1,
                    max: 1000,
                    step: 20
                  },
                ]
              },
            ]
          }
        ]
      },
    ]

  }
}
