use crate::scene_graph::*;
use crate::math::*;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGlProgram, WebGlBuffer, WebGlRenderingContext, WebGlShader, HtmlCanvasElement};
use std::collections::HashMap;

#[wasm_bindgen]
pub struct WebGLRenderer {
    gl: Rc<WebGlRenderingContext>,

    programs: HashMap<Rc<Shading>, Program>,
    buffers: HashMap<Rc<BufferData<f32>>, WebGlBuffer>,
}


#[wasm_bindgen]
impl WebGLRenderer {
    pub fn new(canvas: HtmlCanvasElement) -> Result<WebGLRenderer, JsValue>{
            
        let context = canvas
        .get_context("webgl")?
        .unwrap()
        .dyn_into::<WebGlRenderingContext>()?;

        Ok(WebGLRenderer{
            gl: Rc::new(context),
            programs: HashMap::new(),
            buffers: HashMap::new(),
        })
    }

    pub fn render(&mut self, scene: &SceneGraph){
        self.gl.clear_color(0.0, 0.0, 0.0, 1.0);
        self.gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);

        let list = scene.batch_drawcalls();

        list.foreach(|(object_id, scene_id)|{
            let object = scene.render_objects.get(*object_id);
            let scene_node = scene.nodes.get(*scene_id);

            self.use_shading(object.shading.clone());
            self.use_geometry(object.geometry.clone());
            self.draw(object.geometry.clone());
        })
        // let buffer = &self.buffers[0];
        // self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
        // self.gl.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
        // self.gl.enable_vertex_attrib_array(0);

        // self.gl.use_program(Some(&self.programs.get(0).program));
        // self.gl.draw_arrays(
        //     WebGlRenderingContext::TRIANGLES,
        //     0,
        //     (9 / 3) as i32,
        // );
    }

}

impl WebGLRenderer {
    pub fn draw(&mut self, geometry: Rc<Geometry>){

    }

    pub fn use_transform(&mut self, mat: Mat4<f32>){

    }


    pub fn use_shading(&mut self, shading: Rc<Shading>) {

    }

    // pub fn get_program(&mut self, shading: Rc<Shading>) -> &Program{

    // }

    pub fn use_geometry(&mut self, geometry: Rc<Geometry>) {

    }


    // pub fn make_index_buffer() -> Result<(), JsValue>{

    // }

    pub fn make_buffer(&mut self, data: Rc<BufferData<f32>>) -> Result<(), String>{

        let buffer = self.gl.create_buffer().ok_or("failed to create buffer")?;
        self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&buffer));
    
        // Note that `Float32Array::view` is somewhat dangerous (hence the
        // `unsafe`!). This is creating a raw view into our module's
        // `WebAssembly.Memory` buffer, but if we allocate more pages for ourself
        // (aka do a memory allocation in Rust) it'll cause the buffer to change,
        // causing the `Float32Array` to be invalid.
        //
        // As a result, after `Float32Array::view` we have to be very careful not to
        // do any memory allocations before it's dropped.
        unsafe {
            let vert_array = js_sys::Float32Array::view(&data.data);
    
            self.gl.buffer_data_with_array_buffer_view(
                WebGlRenderingContext::ARRAY_BUFFER,
                &vert_array,
                WebGlRenderingContext::STATIC_DRAW,
            );
        }
        self.buffers.insert(data, buffer);
        Ok(())
    }

    pub fn make_program(&mut self, shading: Rc<Shading>) -> Result<(), String>{
        let program = Program::new(self.gl.clone(), &shading.vertex_str, &shading.frag_str)?;
        self.programs.insert(shading, program);
        Ok(())
    }

}

struct Program{
    context: Rc<WebGlRenderingContext>,
    program: WebGlProgram,
}

impl Program {
    pub fn new(context: Rc<WebGlRenderingContext>, vertex_shader_str: &str, frag_shader_str: &str) -> Result<Program, String>{
        let vertex_shader = compile_shader(&context, WebGlRenderingContext::VERTEX_SHADER, vertex_shader_str)?;
        let frag_shader = compile_shader(&context, WebGlRenderingContext::FRAGMENT_SHADER, frag_shader_str)?;
        let program = link_program(&context, &vertex_shader, &frag_shader)?;

        Ok(Program{
            context,
            program
        })
    }
}

fn compile_shader(
    context: &WebGlRenderingContext,
    shader_type: u32,
    source: &str,
) -> Result<WebGlShader, String> {
    let shader = context
        .create_shader(shader_type)
        .ok_or_else(|| String::from("Unable to create shader object"))?;
    context.shader_source(&shader, source);
    context.compile_shader(&shader);

    if context
        .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(shader)
    } else {
        Err(context
            .get_shader_info_log(&shader)
            .unwrap_or_else(|| String::from("Unknown error creating shader")))
    }
}

fn link_program(
    context: &WebGlRenderingContext,
    vert_shader: &WebGlShader,
    frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
    let program = context
        .create_program()
        .ok_or_else(|| String::from("Unable to create shader object"))?;

    context.attach_shader(&program, vert_shader);
    context.attach_shader(&program, frag_shader);
    context.link_program(&program);

    if context
        .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(program)
    } else {
        Err(context
            .get_program_info_log(&program)
            .unwrap_or_else(|| String::from("Unknown error creating program object")))
    }
}
