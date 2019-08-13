import { BaseEffectShading } from "../../core/shading";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { Light, collectLight } from "../../core/light";

// export class PhongShading extends BaseEffectShading<PhongShading> {
//   decorate(graph: ShaderGraph): void {
//     graph
//       .setFragmentRoot(
//         collectLight.make()
//           .input("base", graph.getFragRoot())
//           .input("light", )
//       )
//   }

//   light: Light<any>

// }