
use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub struct Scene{
    id: i32,

    nodes: Vec<i32>,
    node_index_max: i32,
}

#[wasm_bindgen]
impl Scene{

    #[wasm_bindgen]
    pub fn new(id: i32) -> Scene{
        return Scene{
            id,
            nodes: Vec::new(),
            node_index_max: 0,
        }
    }

    #[wasm_bindgen]
    pub fn make_node(&mut self) -> SceneNode{
        self.node_index_max+=1;
        let node = SceneNode{
            scene_id: self.id,
            self_id: self.id,
        };
        node
    }
}

#[wasm_bindgen]
pub struct SceneNode{
    scene_id: i32,

    self_id: i32
    // parent: Option<i32>
}

#[wasm_bindgen]
impl SceneNode{

    // #[wasm_bindgen]
    // pub fn new(scene: &Scene) -> SceneNode{
    //     let node = SceneNode{
    //         scene_id: scene.id
    //     };
    //     node
    // }
}