use crate::math::*;
use crate::scene_graph::*;
use crate::webgl::programs::*;
use crate::webgl::buffer_attribute::*;
use std::collections::HashMap;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::*;
use std::hash::BuildHasherDefault;
use fnv::FnvHasher;

use crate::{log, log_usize,log_f32};

#[wasm_bindgen(raw_module = "../src/webgl/array_pool")]
extern "C" {
    pub fn makeBuffer(size: usize) -> JsValue;
    pub fn copyBuffer(buffer: &JsValue, start: *const f32, offset: usize);
    pub fn uploadMatrix4f(gl: &WebGlRenderingContext, location: &WebGlUniformLocation, buffer: &JsValue);
}


#[wasm_bindgen]
pub struct WebGLRenderer {
  pub(crate) gl: Rc<WebGlRenderingContext>,

  pub(crate) model_transform: JsValue,
  pub(crate) camera_projection: JsValue,
  pub(crate) camera_inverse: JsValue,


  pub(crate) active_program: Option<Rc<dyn ProgramWrap>>,

  pub(crate) programs: HashMap<Rc<dyn Shading>, Rc<dyn ProgramWrap>, BuildHasherDefault<FnvHasher>>,
  pub(crate) buffer_manager: BufferManager,
}

#[wasm_bindgen]
impl WebGLRenderer {
  pub fn new(canvas: HtmlCanvasElement) -> Result<WebGLRenderer, JsValue> {
    let context = canvas
      .get_context("webgl")?
      .unwrap()
      .dyn_into::<WebGlRenderingContext>()?;

      
    context.enable(WebGlRenderingContext::DEPTH_TEST);
    context.clear_color(0.0, 0.0, 0.0, 1.0);
    context.get_extension("OES_element_index_uint")?;

    let gl = Rc::new(context);
    let glc= gl.clone();
    Ok(WebGLRenderer {
      gl,
      model_transform: makeBuffer(16),
      camera_projection: makeBuffer(16),
      camera_inverse: makeBuffer(16),
      active_program: None,
      programs: HashMap::with_hasher(BuildHasherDefault::<FnvHasher>::default()),
      buffer_manager: BufferManager::new(glc),
    })
  }

  pub fn render(&mut self, scene: &SceneGraph) {
    self.gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);
    self.gl.clear(WebGlRenderingContext::DEPTH_BUFFER_BIT);

    let list = scene.batch_drawcalls().borrow();

    copyBuffer(&self.camera_projection, scene.camera.projection_matrix.as_ptr(), 16);
    copyBuffer(&self.camera_inverse, scene.camera.inverse_world_matrix.as_ptr(), 16);
    
    list.foreach(|render_item| {
      
      let object = scene.render_objects.get(render_item.render_object_index);
      let scene_node = scene.nodes.get(render_item.scene_node_index).borrow();

      copyBuffer(&self.model_transform, scene_node.matrix_world.as_ptr(), 16);

      self.use_shading(object.shading.clone());
      self.use_geometry(object.geometry.clone());
      self.draw(object.geometry.clone());
    })
  }
}

impl WebGLRenderer {
  pub fn draw(&mut self, geometry: Rc<Geometry>) {
    if let Some(index) = &geometry.index {
      let length = index.data.len();
      self.gl.draw_elements_with_i32(WebGlRenderingContext::TRIANGLES, 0, WebGlRenderingContext::UNSIGNED_INT,length as i32);
    }else{
      let length = geometry.attributes.get("position").unwrap().data.len() / 3;
      self.gl.draw_arrays(WebGlRenderingContext::TRIANGLES, 0, length as i32);
    }
  }

  pub fn use_shading(&mut self, shading: Rc<dyn Shading>){
    let program = self.get_program(shading).unwrap();
    if let Some(current_program) = &self.active_program {
      if current_program.get_program() != program.get_program() {
        let p = program.clone();
        self.active_program = Some(program.clone());
        self.gl.use_program(Some(p.get_program()));
      }
    } else {
      let p = program.clone();
        self.active_program = Some(program.clone());
        self.gl.use_program(Some(p.get_program()));
    }

    program.upload_uniforms(&self);


    // for (name, location) in program.uniforms.iter() {
    //   // if name == "model_matrix" {

    //   // } else if name == "projection_matrix" {
        
    //   // }
    // }
  }

  pub fn use_geometry(&mut self, geometry: Rc<Geometry>) {
    if let Some(program) = &self.active_program {

      if let Some(index) = &geometry.index {
        let buffer = self.buffer_manager.get_index_buffer(index.clone()).unwrap();
        self.gl.bind_buffer(WebGlRenderingContext::ELEMENT_ARRAY_BUFFER, Some(buffer));
      }else{
        self.gl.bind_buffer(WebGlRenderingContext::ELEMENT_ARRAY_BUFFER, None);
      }

      for (name, location) in  program.get_attributes().iter() {
        let buffer_data = geometry.attributes.get(name).unwrap();
        let buffer = self.buffer_manager.get_buffer(buffer_data.clone()).unwrap();
        self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
        self.gl.vertex_attrib_pointer_with_i32(*location as u32, buffer_data.stride as i32, WebGlRenderingContext::FLOAT, false, 0, 0);
        self.gl.enable_vertex_attrib_array(*location as u32);
      }
    }
  }
}
