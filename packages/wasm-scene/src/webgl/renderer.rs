use crate::math::*;
use crate::scene_graph::*;
use crate::webgl::programs::*;
use crate::webgl::buffer_attribute::*;
use std::collections::HashMap;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::*;

use crate::{log, log_usize};

#[wasm_bindgen]
pub struct WebGLRenderer {
  pub(crate) gl: Rc<WebGlRenderingContext>,

  model_transform: [f32; 16],
  camera_projection: [f32; 16],


  pub(crate) active_program: Option<Rc<Program>>,

  pub(crate) programs: HashMap<Rc<Shading>, Rc<Program>>,
  pub(crate) buffer_manager: BufferManager,
}

#[wasm_bindgen]
impl WebGLRenderer {
  pub fn new(canvas: HtmlCanvasElement) -> Result<WebGLRenderer, JsValue> {
    let context = canvas
      .get_context("webgl")?
      .unwrap()
      .dyn_into::<WebGlRenderingContext>()?;

    let gl = Rc::new(context);
    let glc= gl.clone();
    Ok(WebGLRenderer {
      gl,
      model_transform: [0.0; 16],
      camera_projection: [0.0; 16],
      active_program: None,
      programs: HashMap::new(),
      buffer_manager: BufferManager::new(glc),
    })
  }

  pub fn render(&mut self, scene: &SceneGraph) {
    self.gl.clear_color(0.0, 0.0, 0.0, 1.0);
    self.gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);

    let list = scene.batch_drawcalls().borrow();
    log_usize(list.get_len());

    self.model_transform = scene.camera.projection_matrix.to_array();
    
    list.foreach(|(object_id, scene_id)| {
      let object = scene.render_objects.get(*object_id);
      let scene_node = scene.nodes.get(*scene_id).borrow();

      self.model_transform = scene_node.matrix_world.to_array();
      self.use_shading(object.shading.clone());
      self.use_geometry(object.geometry.clone());
      self.draw(object.geometry.clone());
    })
  }
}

impl WebGLRenderer {
  pub fn draw(&mut self, geometry: Rc<Geometry>) {
    let length = geometry.attributes.get("position").unwrap().data.len() / 3;
    self.gl.draw_arrays(WebGlRenderingContext::TRIANGLES, 0, length as i32);
  }

  pub fn use_shading(&mut self, shading: Rc<Shading>){
    let program = self.get_program(shading).unwrap();
    if let Some(current_program) = &self.active_program {
      if current_program as *const Rc<Program> != &program as *const Rc<Program>  { // maybe is ok?
        let p = program.clone();
        self.active_program = Some(program.clone());
        self.gl.use_program(Some(p.get_program()));

      log_usize(self.programs.len());
      }
    } else {
      let p = program.clone();
        self.active_program = Some(program.clone());
        self.gl.use_program(Some(p.get_program()));
        log_usize(0);
    }

    let model_matrix_location = program.uniforms.get("model_matrix").unwrap();
    self.gl.uniform_matrix4fv_with_f32_array(Some(model_matrix_location), false, &self.model_transform);

    let projection_matrix_location = program.uniforms.get("projection_matrix").unwrap();
    self.gl.uniform_matrix4fv_with_f32_array(Some(projection_matrix_location), false, &self.camera_projection);
    // for (name, location) in program.uniforms.iter() {
    //   // if name == "model_matrix" {

    //   // } else if name == "projection_matrix" {
        
    //   // }
    // }
  }

  pub fn use_geometry(&mut self, geometry: Rc<Geometry>) {
    if let Some(program) = &self.active_program {
      for (name, location) in  program.attributes.iter() {
        let buffer_data = geometry.attributes.get(name).unwrap();
        let buffer = self.buffer_manager.get_buffer(buffer_data.clone()).unwrap();
        self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
        self.gl.vertex_attrib_pointer_with_i32(*location as u32, buffer_data.stride as i32, WebGlRenderingContext::FLOAT, false, 0, 0);
        self.gl.enable_vertex_attrib_array(*location as u32);
      }
    }
  }
}
