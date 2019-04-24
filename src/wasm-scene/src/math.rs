use crate::array_scene::*;
use na::{Matrix4, Vector3};

pub fn update_worldmatrix_by_parent(
  index: i16,
  nodes_indexs: &Vec<i16>,
  local_transform: &Vec<f32>,
  world_transform: &mut Vec<f32>,
) {
  let parent = nodes_indexs[(index as usize)];
  let mut parent_world: Matrix4<f32>;
  if parent == -1 {
    parent_world = Matrix4::new(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0,
    );
  } else {
    let q = TRANSFORM_ARRAY_STRIDE * (parent as usize);
    parent_world = read_matrix(world_transform, q);
  }
  let p = TRANSFORM_ARRAY_STRIDE * (index as usize);
  let local =  read_matrix(local_transform, p);
  let result = local * parent_world;
  write_matrix(&result, world_transform, p);
}

pub fn update_localmatrix(
  index: i16,
  local_position: &Vec<f32>,
  local_rotation: &Vec<f32>,
  local_scale: &Vec<f32>,
  local_transform: &mut Vec<f32>,
 ){
   let rotationIndex: usize = (index as usize) * ROTATION_ARRAY_STRIDE;
   let scaleIndex: usize = (index as usize) * SCALE_ARRAY_STRIDE;
   let positionIndex: usize = (index as usize) * POSITION_ARRAY_STRIDE;
   let mut mat = Matrix4::from_euler_angles(
     local_rotation[rotationIndex],
     local_rotation[rotationIndex + 1],
     local_rotation[rotationIndex + 2],
   );
   mat.append_nonuniform_scaling_mut(
      &Vector3::new(
        local_scale[scaleIndex],
        local_scale[scaleIndex + 1],
        local_scale[scaleIndex + 2],
      )
   );
   mat.append_translation_mut(
      &Vector3::new(
        local_position[positionIndex],
        local_position[positionIndex + 1],
        local_position[positionIndex + 2],
      )
   );
   let p: usize = (index as usize) * TRANSFORM_ARRAY_STRIDE;
   write_matrix(&mat, local_transform, p);
}

fn read_matrix(array: &Vec<f32>, index: usize) -> Matrix4<f32> {
  Matrix4::new(
    array[index],  array[index + 1],  array[index + 2],  array[index + 3],
    array[index + 4],  array[index + 5],  array[index + 6],  array[index + 7],
    array[index + 8],  array[index + 9],  array[index + 10],  array[index + 11],
    array[index + 12],  array[index + 13],  array[index + 14],  array[index + 15],
  )
}

fn write_matrix(mat: &Matrix4<f32>, array: &mut Vec<f32>, index: usize) {
   array[index] = mat[0];
   array[index + 1] = mat[1];
   array[index + 2] = mat[2];
   array[index + 3] = mat[3];
   array[index + 4] = mat[4];
   array[index + 5] = mat[5];
   array[index + 6] = mat[6];
   array[index + 7] = mat[7];
   array[index + 8] = mat[8];
   array[index + 9] = mat[9];
   array[index + 10] = mat[10];
   array[index + 11] = mat[11];
   array[index + 12] = mat[12];
   array[index + 13] = mat[13];
   array[index + 14] = mat[14];
   array[index + 15] = mat[15];
}