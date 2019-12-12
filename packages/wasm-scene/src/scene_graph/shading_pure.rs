// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat3 normalMatrix;
// uniform vec3 cameraPosition;

// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

use crate::scene_graph::*;
use crate::math::mat4::Mat4;

pub struct PureColorShading {
    index: usize
    vertex: String,
    frag: String,
  
    // uniforms
    projection_matrix: Mat4<f32>,
    world_matrix: Mat4<f32>,
    transform_matrix: Mat4<f32>,
  }
  
  impl Shading for PureColorShading {
    fn get_index(&self)-> usize{
      self.index
    }
    fn get_vertex_str(&self) -> &str{
      self.vertex
    }
    fn get_fragment_str(&self) -> &str{
      self.frag
    }
    fn make_program(&self, gl: Rc<WebGlRenderingContext>) -> Rc<dyn ProgramWrap>{

    }
  }
  
  // pub struct ShadingProgram {
  //   vertex: String,
  //   frag: String,
    
  //   projection_matrix_location: WebGlUniformLocation,
  //   world_matrix: WebGlUniformLocation,
  // }
  
  // impl ShadingProgram{
  //   pub fn new(){
  
  //   }
  
  //   pub fn upload_uniforms(&self){
      
  //   }
  // }