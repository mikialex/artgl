export default {
  name: 'root',
  type: 'folder',
  value: [
    {
      name: 'canvas',
      value: [
  
      ]
    },
    {
      name: 'engine',
      value: [
        {
          name: 'useThree',
          value: false,
          editors: [
            {
              type: 'boolean',
            }
          ],
          description: 'this is a demo description'
        },
        {
          name: 'detailCulling',
          value: [
            {
              name: 'size',
              value: 100,
              editors: [
                {
                  type: 'slider',
                  min: 0,
                  max: 50,
                  step: 1
                },
                {
                  type: 'number',
                }
              ]
            },
            {
              name: 'enable',
              value: true,
              editors: [
                {
                  type: 'boolean',
                }
              ]
            }
          ]
        }
      ]
    }
  ]
  
}