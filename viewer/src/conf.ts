import { RenderGraph } from '../../src/artgl';

export function getBindedConf(graph: RenderGraph) {
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
                value: 100,
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
                value: 100,
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
            value: false,
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

const conf = {
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
              value: 100,
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
              value: 100,
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
          value: false,
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

export default conf;