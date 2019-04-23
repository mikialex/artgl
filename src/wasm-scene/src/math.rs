use crate::array_scene::TRANSFORM_ARRAY_STRIDE;
use na::Matrix4;

pub fn update_worldmatrix_by_parent(
  index: i16,
  nodes_indexs: &Vec<i16>,
  local_transform: &Vec<f32>,
  world_transform: &mut Vec<f32>,
) {
  let parent = nodes_indexs[(index as usize)];
  if parent == -1 {}
  let local = Matrix4::new(
    // local_transform[(index as usize) * TRANSFORM_ARRAY_STRIDE]
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
  );
}

// pub fn update_localmatrix(
//   index: i16,
//   scene: &mut ArrayScene
//  ){

// }
