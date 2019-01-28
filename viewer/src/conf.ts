import { RenderGraph } from '../../src/artgl';
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
                value: true,
              },
              {
                name: 'maxStableSampleCount',
                value: 100,
                editors: [
                  {
                    type: 'slider',
                    min: 0,
                    max: 50,
                    step: 1
                  },
                ]
              },
            ]
          }
        ]
      }
    ]

  }
}
