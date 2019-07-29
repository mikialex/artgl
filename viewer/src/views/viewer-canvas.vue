<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas" @click="pick"></canvas>
    <div v-if="!isRunning" class="stop-notation">STOPPED</div>

    <div class="graph-viewer-wrap" v-if="showGraphViewer">
      <div style="position: absolute; bottom: 0px">
        <button @click="layout">layout</button>
      </div>
      <GraphView :board="board">
        <DAGNodeView
          v-for="nodeView in nodes"
          :key="nodeView.node.uuid"
          :node="nodeView.node"
          :layout="nodeView.layout"
          :boardInfo="board"
          @updateViewport="updateViewport(nodeView)"
        ></DAGNodeView>
      </GraphView>
    </div>

    <div class="command-bar">
      <button @click="run" v-if="!isRunning">run</button>
      <button @click="stop" v-if="isRunning">stop</button>
      <button @click="step" v-if="!isRunning">step next frame</button>
      <button @click="screenshot" v-if="!isRunning" disabled>download screenshot</button>
      <button @click="inspectGraph" v-if="!showGraphViewer">inspectGraph</button>
      <button @click="closeGraphInspector" v-if="showGraphViewer">closeGraphViewer</button>
      <button @click="showScenePanel">show scene panel</button>
      <button @click="showConfigPanel">show config panel</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GLApp } from "../application";
import GraphView from "../components/graph/graph-viewer.vue";
import DAGNodeView from "../components/graph/dag-node.vue";
import { GraphBoardInfo, ViewNode, layoutGraph } from "../model/graph-view";

@Component({
  components: {
    GraphView,
    DAGNodeView
  }
})
export default class ViewerCanvas extends Vue {
  isRunning: boolean = GLApp.framer.active;
  $store: any;

  async showScenePanel() {
    this.$store.state.showScenePanel = true;
    await this.$nextTick();
    GLApp.notifyResize();
  }

  async showConfigPanel() {
    this.$store.state.showConfigPanel = true;
    await this.$nextTick();
    GLApp.notifyResize();
  }

  pick(e: MouseEvent) {
    // console.log(e.offsetX)
    const canvas = this.$el.querySelector("canvas");
    GLApp.pickColor(e.offsetX, canvas.clientHeight - e.offsetY);
  }

  showGraphViewer: boolean = false;
  board: GraphBoardInfo = {
    width: 0,
    height: 0,
    transformX: 0,
    transformY: 0
  };

  nodes: ViewNode[] = [];

  updateViewport() {}

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

  layout() {
    const map = {};
    this.nodes.forEach(node => {
      map[node.node.uuid] = node.layout;
    });
    layoutGraph(GLApp.pipeline.graph.screenNode, map);
  }

  inspectGraph() {
    // this.graphView = GraphView.create(GLApp.pipeline.graph);
    GLApp.pipeline.graph.enableDebuggingView = true;
    const nodes = GLApp.pipeline.graph.nodes;
    this.nodes = nodes.map(node => {
      return {
        node,
        layout: {
          absX: 0,
          absY: 0,
          width: 100,
          height: 100
        }
      };
    });
    this.showGraphViewer = true;
  }

  closeGraphInspector() {
    // this.graphView = null;
    GLApp.pipeline.graph.enableDebuggingView = false;
    this.showGraphViewer = false;
  }

  run() {
    GLApp.run();
    this.isRunning = true;
  }

  stop() {
    GLApp.stop();
    this.isRunning = false;
  }

  step() {
    GLApp.step();
  }

  screenshot() {
    GLApp.engine.downloadCurrentRender();
  }
}
</script>


<style lang="scss" scoped>
.canvas-wrap {
  // width: calc(100vw - 600px);
  flex-grow: 1;
  border: 1px solid #ddd;
  position: relative;
}

.graph-viewer-wrap {
  position: absolute;
  top: 0px;
  width: 100%;
  height: calc(100% - 40px);
}

#viewer-canvas {
  width: 100%;
  height: calc(100% - 40px);
}

.command-bar {
  border-top: 1px solid #eee;
  height: 40px;
}

.stop-notation {
  position: absolute;
  width: 100%;
  height: calc(100% - 40px);
  top: 0px;
  font-size: 20px;
  border: 3px solid rgb(237, 185, 185);
  color: rgb(235, 90, 90);
  box-sizing: border-box;
}
</style>
