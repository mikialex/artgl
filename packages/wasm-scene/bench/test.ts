import { Scene, SceneNode} from "../pkg/wasm_scene";
import { memory } from '../pkg/wasm_scene_bg'

const scene = Scene.new(1);

const node = scene.make_node();

console.log(memory)
console.log(scene)
console.log(node)
