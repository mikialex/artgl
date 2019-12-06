use crate::math::*;

pub struct Camera {
    projection_matrix: Mat4<f32>, 
}

impl Camera {
    pub fn new()-> Self{
        Camera{
            projection_matrix: Mat4::one()
        }
    }
}