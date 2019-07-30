<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas" @click="pick"></canvas>
    <div v-if="!isRunning" class="stop-notation">STOPPED</div>

    <div class="graph-viewer-wrap" v-if="showGraphViewer">
      <div style="position: absolute; bottom: 0px">
        <button @click="layout">layout</button>
      </div>
      <GraphView :board="board" @updateAllViewport="updateAllViewport">
        <DAGNodeView
          v-for="nodeView in nodes"
          :key="nodeView.node.uuid"
          :node="nodeView.node"
          :layout="nodeView.layout"
          :boardInfo="board"
          @updateViewport="updateViewport"
        >
          <RenderTargetNodeView
            v-if="isRenderTargetNode(nodeView.node)"
            :node="nodeView.node"
            :layout="nodeView.layout"
            @updateSize="updateViewport"
          />
        </DAGNodeView>
      </GraphView>
      <LineHUDCanvas :lines="lines" />
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
import LineHUDCanvas from "./line-hud-canvas.vue";
import RenderTargetNodeView from "../components/graph/nodes/render-target-node.vue";
import {
  GraphBoardInfo,
  ViewNode,
  layoutGraph,
  NodeLayout,
  ConnectionLine
} from "../model/graph-view";
import { RenderTargetNode } from "../../../src/render-graph/node/render-target-node";
import { Vector4 } from "../../../src/artgl";

@Component({
  components: {
    GraphView,
    DAGNodeView,
    RenderTargetNodeView,
    LineHUDCanvas
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
  lines: ConnectionLine[] = [];

  updateViewport({ node, layout }) {
    if (node instanceof RenderTargetNode) {
      const viewport = new Vector4();
      const l = layout as NodeLayout;
      const n = node as RenderTargetNode;
      viewport.set(
        l.absX + this.board.transformX,
        this.board.height - l.absY - l.height - this.board.transformY,
        l.width,
        l.height
      );
      viewport.multiplyScalar(window.devicePixelRatio);
      n.debugViewPort.copy(viewport);
    }
  }

  updateAllViewport() {
    this.nodes.forEach(node => {
      this.updateViewport(node);
    });
  }

  layout() {
    const map = {};
    this.nodes.forEach(node => {
      map[node.node.uuid] = node.layout;
    });
    layoutGraph(GLApp.pipeline.graph.screenNode, map);
    this.updateAllViewport();
  }

  isRenderTargetNode(node) {
    return node instanceof RenderTargetNode;
  }

  inspectGraph() {
    GLApp.pipeline.graph.enableDebuggingView = true;
    const nodes = GLApp.pipeline.graph.nodes;
    this.nodes = nodes.map(node => {
      return {
        node,
        layout: {
          absX: 0,
          absY: 0,
          width: 200,
          height: 200
        }
      };
    });
    this.showGraphViewer = true;
    this.layout();
  }

  closeGraphInspector() {
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
  flex-grow: 1;
  border: 1px solid #ddd;
  position: relative;
}

.lines-hud {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
}

.graph-viewer-wrap {
  pointer-events: none;
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
