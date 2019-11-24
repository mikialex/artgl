use crate::array_scene::*;
use na::{Matrix4, Vector3};

pub fn update_worldmatrix_by_parent(
  index: i32,
  nodes_indexs: &Vec<i32>,
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
  index: i32,
  local_position: &Vec<f32>,
  local_rotation: &Vec<f32>,
  local_scale: &Vec<f32>,
  local_transform: &mut Vec<f32>,
 ){ 
   let rotationIndex: usize = (index as usize) * ROTATION_ARRAY_STRIDE;
   let scaleIndex: usize = (index as usize) * SCALE_ARRAY_STRIDE;
   let positionIndex: usize = (index as usize) * POSITION_ARRAY_STRIDE;

   let scaleX = local_scale[scaleIndex];
   let scaleY = local_scale[scaleIndex + 1];
   let scaleZ = local_scale[scaleIndex + 2];

    // rotation
    let (sr, cr) = local_rotation[rotationIndex].sin_cos();
    let (sp, cp) = local_rotation[rotationIndex + 1].sin_cos();
    let (sy, cy) = local_rotation[rotationIndex + 2].sin_cos();

    let p: usize = (index as usize) * TRANSFORM_ARRAY_STRIDE;

    local_transform[p] = cy * cp * scaleX;
    local_transform[p + 1] = (cy * sp * sr - sy * cr) * scaleX;
    local_transform[p + 2] = (cy * sp * cr + sy * sr) * scaleX;
    local_transform[p + 3] = 0.0;

    local_transform[p + 4] = sy * cp * scaleY;
    local_transform[p + 5] = (sy * sp * sr + cy * cr) * scaleY;
    local_transform[p + 6] = (sy * sp * cr - cy * sr) * scaleY;
    local_transform[p + 7] = 0.0;

    local_transform[p + 8] = -sp * scaleZ;
    local_transform[p + 9] = cp * sr * scaleZ;
    local_transform[p + 10] = cp * cr * scaleZ;
    local_transform[p + 11] = 0.0;

    local_transform[p + 12] = local_position[positionIndex];
    local_transform[p + 13] = local_position[positionIndex + 1];
    local_transform[p + 14] = local_position[positionIndex + 2];
    local_transform[p + 15] = 1.0;
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