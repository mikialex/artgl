<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas"
    @click ="pick"
    ></canvas>
    <div v-if="!isRunning" class="stop-notation"> STOPPED </div>

    <GraphView v-if="graphView" :board="board">
      <DAGNodeView
        v-for="nodeView in nodes"
        :key="nodeView.node.uuid"
        :node="nodeView.node"
        :layout="nodeView.layout"
        :boardInfo="board"
        @updateViewport="updateViewport(nodeView)"
      >
        
      </DAGNodeView>
    </GraphView>

    <div class="command-bar">
      <button @click="run" v-if="!isRunning">run</button>
      <button @click="stop" v-if="isRunning">stop</button>
      <button @click="step" v-if="!isRunning">step next frame</button>
      <button @click="screenshot" v-if="!isRunning" disabled>download screenshot</button>
      <button @click="inspectGraph" v-if="!graphView">inspectGraph</button>
      <button @click="closeGraphInspector" v-if="graphView">closeGraphViewer</button>
      <button @click="showScenePanel">show scene panel</button>
      <button @click="showConfigPanel">show config panel</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {GLApp} from '../application';
import GraphView from '../components/graph/graph-viewer.vue';
import { GraphBoardInfo, ViewNode } from '../model/graph-view';

@Component({
  components:{
    GraphView
  }
})
export default class ViewerCanvas extends Vue {
  isRunning:boolean = GLApp.framer.active;
  $store: any;

  async showScenePanel(){
    this.$store.state.showScenePanel = true;
    await this.$nextTick()
    GLApp.notifyResize();
  }

  async showConfigPanel(){
    this.$store.state.showConfigPanel = true;
    await this.$nextTick()
    GLApp.notifyResize();
  }


  pick(e:MouseEvent) {
    // console.log(e.offsetX)
    const canvas = this.$el.querySelector("canvas")
    GLApp.pickColor(e.offsetX, canvas.clientHeight - e.offsetY)
  }


  board: GraphBoardInfo = {
    width: 0,
    height: 0,
    transformX: 0,
    transformY: 0
  };

  get nodes(){
    return GLApp.pipeline.graph.nodes
  }

//  actualSize(node: GraphNodeView){
//     const targetNode = GLApp.pipeline.graph.getNodeByID(node.uuid);
//     node.width = targetNode.width / window.devicePixelRatio / 2;
//     node.height =  targetNode.height / window.devicePixelRatio / 2;
//     this.updateViewport(node);
//   }

//   defaultSize(node: GraphNodeView){
//     node.width = GraphView.targetNodeDefaultSize;
//     node.height = GraphView.targetNodeDefaultSize;
//     this.updateViewport(node);
//   }

//   updateViewport(node: GraphNodeView){
//     const viewport = new Vector4();
//     viewport.set(
//       node.positionX + this.board.transformX,
//       this.board.height - node.positionY - node.height - this.board.transformY,
//       node.width,
//       node.height
//     );
//     viewport.multiplyScalar(window.devicePixelRatio);
//     if(GLApp.pipeline.graph){ // TODO
//       const engine = GLApp.engine;
//       GLApp.pipeline.graph.updateRenderTargetDebugView(engine, node.uuid, viewport);
//     }
//   }

//   updateAllViewports(){
//     this.graphview.nodes.forEach(node =>{
//       this.updateViewport(node)
//     })
//   }

//   layout(){
//     this.graphview.layout()
//     this.updateAllViewports();
//   }

  inspectGraph(){
    // this.graphView = GraphView.create(GLApp.pipeline.graph);
    GLApp.pipeline.graph.enableDebuggingView = true;
  }

  closeGraphInspector(){
    // this.graphView = null;
    GLApp.pipeline.graph.enableDebuggingView = false;
  }

  run(){
    GLApp.run();
    this.isRunning = true;
  }

  stop(){
    GLApp.stop();
    this.isRunning = false;
  }

  step(){
    GLApp.step();
  }

  screenshot(){
    GLApp.engine.downloadCurrentRender();
  }

}
</script>


<style lang="scss" scoped>
.canvas-wrap{
  // width: calc(100vw - 600px);
  flex-grow: 1;
  border: 1px solid #ddd;
  position: relative;
}

#viewer-canvas{
  width: 100%;
  height: calc(100% - 40px); 
}

.command-bar{
  border-top:1px solid #eee;
  height: 40px;
}

.stop-notation{
  position: absolute;
  width:100%;
  height: calc(100% - 40px);
  top:0px;
  font-size: 20px;
  border: 3px solid rgb(237, 185, 185);
  color:  rgb(235, 90, 90);
  box-sizing: border-box;
}

</style>
