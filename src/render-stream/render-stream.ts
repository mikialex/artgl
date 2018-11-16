
export class RenderSource{
  constructor(scene) {
    
  }
  scene;

  getRenderable() {
    
  }
}

export class RenderReadableStream{
  constructor(source: RenderSource) {
    this.source = source;
  }
  source: RenderSource;

  readBuffer: any[];

  push(renderable) {
    this.readBuffer.push(renderable);
  }

  read() {
    if (this.readBuffer.length < 10) {
      const renderable = this.source.getRenderable();
      this.push(renderable);
      const data = this.readBuffer.shift();
      this.onDataCallBack.forEach(cb => {
        cb(data);
      })
    }
  }

  onDataCallBack: any[];
  onData(callback) {
    this.onDataCallBack.push(callback);
  }

  resume() {
    this.read();
  }
  
}

const scene = new Scene();
const myReadable = new RenderReadableStream(new RenderSource(scene));

// consumer
myReadable.onData((chunk) => {
  console.log(chunk);
  myReadable.resume();
});

// start
myReadable.read();