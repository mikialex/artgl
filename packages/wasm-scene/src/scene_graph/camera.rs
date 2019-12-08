use crate::math::*;
pub struct Camera {
    pub(crate) projection_matrix: Mat4<f32>, 
}

impl Camera {
    pub fn new()-> Self{
        Camera{
            projection_matrix: Mat4::one()
        }
    }

    pub fn update_projection(&mut self, mat: &[f32]){
        self.projection_matrix.a1 = mat[0];
        self.projection_matrix.a2 = mat[1];
        self.projection_matrix.a3 = mat[2];
        self.projection_matrix.a4 = mat[3];
        
        self.projection_matrix.b1 = mat[4];
        self.projection_matrix.b2 = mat[5];
        self.projection_matrix.b3 = mat[6];
        self.projection_matrix.b4 = mat[7];

        self.projection_matrix.c1 = mat[8];
        self.projection_matrix.c2 = mat[9];
        self.projection_matrix.c3 = mat[10];
        self.projection_matrix.c4 = mat[11];

        self.projection_matrix.d1 = mat[12];
        self.projection_matrix.d2 = mat[13];
        self.projection_matrix.d3 = mat[14];
        self.projection_matrix.d4 = mat[15];
    }
}