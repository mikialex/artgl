use na::{Matrix4};

pub fn update_worldmatrix_by_parent(
  index: i16, 
  nodes_indexs: &mut Vec<i16>
  ){
  let parent = nodes_indexs[(index as usize)];
  if parent == -1 {

  }
  let local = Matrix4::new(
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