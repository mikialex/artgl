
use crate::scene_graph::*;
use std::rc::Rc;
use crate::webgl::*;
use web_sys::*;

impl WebGLRenderer {
    pub fn make_index_buffer(&mut self, data: Rc<BufferData<u16>>) -> Result<&WebGlBuffer, String>{
        let buffer = self.gl.create_buffer().ok_or("failed to create buffer")?;
        self.gl.bind_buffer(WebGlRenderingContext::ELEMENT_ARRAY_BUFFER, Some(&buffer));
        unsafe {
            let vert_array = js_sys::Uint16Array::view(&data.data);
    
            self.gl.buffer_data_with_array_buffer_view(
                WebGlRenderingContext::ELEMENT_ARRAY_BUFFER,
                &vert_array,
                WebGlRenderingContext::STATIC_DRAW,
            );
        }
        Ok(self.index_buffers.entry(data).or_insert(buffer))
    }

    pub fn make_buffer(&mut self, data: Rc<BufferData<f32>>) -> Result<&WebGlBuffer, String>{

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
        Ok(self.buffers.entry(data).or_insert(buffer))
    }
}