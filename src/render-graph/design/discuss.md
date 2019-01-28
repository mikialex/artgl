``` ts
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage } from "../webgl/attribute";
import { Matrix4 } from "../math/matrix4";

const textures = [
  {
    "name": "DepthBuffer",
    from: ()=>{
      return ""
    }
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
        { // general scene origin
          name: "SceneOrigin",
          output: "sceneResult",
          source: ['AllScreen'],
        },
        { // depth
          name: "Depth",
          technique: 'depthTech',
          output: "depthResult",
          source: ['AllScreen'],
        },
        { // mix newrender and old samples
          name: "TAA",
          inputs: [ 
            { name: "sceneResult", mapTo: "sceneResult"},
            { name: "depthResult", mapTo: "depthResult"},
            { name: "TAAHistoryA", mapTo: "TAAHistoryOld"}
          ],
          technique: 'TAATech',
          source: ['artgl.screenQuad'],
          output: 'TAAHistoryB',
          enableColorClear: false,
          beforePassExecute: () => {
            this.engine.unjit();
            const VPInv: Matrix4 = TAATech.uniforms.get('VPMatrixInverse').value;
            const VP: Matrix4 = this.engine.globalUniforms.get(InnerSupportUniform.VPMatrix).value
            VPInv.getInverse(VP, true);
            TAATech.uniforms.get('VPMatrixInverse').setValueNeedUpdate();
            TAATech.uniforms.get('u_sampleCount').setValue(this.sampleCount);
          },
          afterPassExecute: () => {
            this.sampleCount++;
          }
        },
        { // copy to screen
          name: "CopyToScreen",
          inputs: [
            { name: "TAAHistoryB", mapTo: "copySource" },
          ],
          output: "screen",
          technique: 'copyTech',
          source: ['artgl.screenQuad'],
          afterPassExecute: () => {
            this.graph.swapRenderTexture('TAAHistoryA', 'TAAHistoryB');
          }
        },
      ]
```