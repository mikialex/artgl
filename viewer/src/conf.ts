import { RenderConfig } from './components/conf/interface'
import { RenderEngine } from '../../src/artgl';
import { RenderPipeline } from './RenderPipeline';

export function createConf(engine: RenderEngine, pipeline: RenderPipeline): RenderConfig {
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
                value: engine.renderer.width,
                onChange: (value: number) => {
                  pipeline.resetSample();
                  engine.setActualSize(value, engine.renderer.height);
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
                value: engine.renderer.height,
                onChange: (value: number) => {
                  pipeline.resetSample();
                  engine.setActualSize(engine.renderer.width, value);
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
            value: engine.preferVAO,
            onChange: (value: boolean) => {
              engine.preferVAO = value
            },
          },
          {
            name: 'enableUniformDiffUpload',
            value: engine.renderer.enableUniformDiff,
            onChange: (value: boolean) => {
              engine.renderer.enableUniformDiff = value
            },
            description: 'this is a demo description'
          },
          {
            name: 'TAA',
            value: [
              {
                name: 'enable',
                value: pipeline.enableTAA,
                onChange: (value: boolean) => {
                  pipeline.enableTAA = value;
                  if (!value) {
                    pipeline.resetSample();
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
                value: pipeline.enableTSSAO,
                onChange: (value: boolean) => {
                  pipeline.enableTSSAO = value;
                  if (value) {
                    pipeline.composeShading.tssaoComposeRate = 1;
                  } else {
                    pipeline.composeShading.tssaoComposeRate = 0;
                  }
                },
              },
              {
                name: 'composeRate',
                value: pipeline.composeShading.tssaoComposeRate,
                onChange: (value: number) => {
                  pipeline.composeShading.tssaoComposeRate = value;
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
                value: pipeline.composeShading.tssaoComposeThreshold,
                onChange: (value: number) => {
                  pipeline.composeShading.tssaoComposeThreshold = value;
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
                value: pipeline.tssaoShading.aoRadius,
                onChange: (value: number) => {
                  pipeline.tssaoShading.aoRadius = value;
                  pipeline.resetSample();
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
                value: pipeline.composeShading.tssaoShowThreshold,
                onChange: (value: number) => {
                  pipeline.composeShading.tssaoShowThreshold = value;
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
