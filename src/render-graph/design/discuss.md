``` ts
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage } from "../webgl/attribute";
import { Matrix4 } from "../math/matrix4";

const textures = [
  {
    "name": "DepthBuffer",
    "format": {
      "pixelFormat": "Depth",
      "dimensionType": "ScreenRelative",
      "width": 1,
      "height": 1
    }
  },
  {
    "name": "LitScene",
    "format": {
      "pixelFormat": "RGBA8",
      "dimensionType": "ScreenRelative",
      "width": 1,
      "height": 1
    }
  }
]

const standardAttributeLayout = [
  { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
  { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
  { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
]
const programs = [
  {
    name: 'myshader',
    attributes: standardAttributeLayout,
    uniforms: [
      { name: 'MMatrix', type: GLDataType.Mat4 , default: new Matrix4()},
      { name: 'VPMatrix', type: GLDataType.Mat4, default: new Matrix4()},
    ],
    varyings: [
      {name:'color', type: GLDataType.floatVec3}
    ],
    vertexShaderString: 'vertexShaderSource',
    fragmentShaderString: 'fragmentShaderSource',
    autoInjectHeader: true,
  }
]

const entity = [
  {
    name: 'originSceneRenderderableitems',
    from: 'sceneAdaptor',
    filters: ['frustum', 'detail']
  },
  {
    name: 'forwardAllOpaque',
    from: 'originSceneRenderderableitems',
    sorter: 'mycompareFuncA',
  },
  {
    name: 'forwardAllOpaque',
    from: 'originSceneRenderderableitems',
    sorter: 'mycompareFuncB',
  }
]


const graph = [
  {
    "name": "DepthPrePass",
    "textureOutputs": ["DepthBuffer"],
    "states": [
      "DisableColorWrite",
      "DisableAlphaWrite"
    ],
    program: 'myshaderA',
    entity: ['forwardAllOpaque', 'forwardAllOpaque']
  },
  {
    "name": "Forward",
    "textureInputs": ["DepthBuffer"],
    "textureOutputs": ["LitScene"],
    entity: ['forwardAllOpaque', 'forwardAllOpaque']
  },
  {
    "name": "DOF",
    "textureInputs": ["DepthBuffer", "LitScene"],
    program: 'myshaderC',
    "outputs": 'screen',
  }
]
```