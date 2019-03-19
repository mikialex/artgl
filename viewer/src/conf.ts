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
                  app.graph.engine.setActualSize(value, app.graph.engine.renderer.height);
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
                  app.graph.engine.setActualSize(app.graph.engine.renderer.width, value);
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
            name: 'enableUniformDiffUpload',
            value: app.graph.engine.renderer.enableUniformDiff,
            onChange: (value: boolean) => {
              app.graph.engine.renderer.enableUniformDiff = value
            },
            description: 'this is a demo description'
          },
          {
            name: 'TAA',
            value: [
              {
                name: 'enable',
                value: app.enableTAA,
                onChange: (value: boolean) => {
                  app.enableTAA = value;
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
                value: app.enableTSSAO,
                onChange: (value: boolean) => {
                  app.enableTSSAO = value;
                  if (!value) {
                    app.composeTech.uniforms.get('u_tssaoComposeRate').setValue(0);
                  } else {
                    app.composeTech.uniforms.get('u_tssaoComposeRate').setValue(1.0);
                  }
                },
              },
              {
                name: 'composeRate',
                value: app.composeTech.uniforms.get('u_tssaoComposeRate').value,
                onChange: (value: number) => {
                  app.composeTech.uniforms.get('u_tssaoComposeRate').setValue(value);
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
                value: app.composeTech.uniforms.get('u_tssaoComposeThreshold').value,
                onChange: (value: number) => {
                  app.composeTech.uniforms.get('u_tssaoComposeThreshold').setValue(value);
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
                value: app.tssaoTech.uniforms.get('u_aoRadius').value,
                onChange: (value: number) => {
                  app.tssaoTech.uniforms.get('u_aoRadius').setValue(value);
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
                value: app.composeTech.uniforms.get('u_tssaoShowThreshold').value,
                onChange: (value: number) => {
                  app.composeTech.uniforms.get('u_tssaoShowThreshold').setValue(value);
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

      {
        name: 'renderGraph',
        value: [
          {
            name: 'enableDebugView',
            value: app.graph.enableDebuggingView,
            onChange: (value: boolean) => {
              app.graph.enableDebuggingView = value;
            },
          },
        ]
      },
    ]

  }
}
