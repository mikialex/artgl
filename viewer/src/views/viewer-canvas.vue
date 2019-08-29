<template>
  <div class="canvas-wrap">
    <canvas id="viewer-canvas" 
    @mousedown="canvasMouseDown"
    @mouseup="canvasMouseUp"
    ></canvas>
    <div v-if="!isRunning" class="stop-notation">STOPPED</div>

    <div class="graph-viewer-wrap" v-if="showGraphViewer">
      <div style="position: absolute; bottom: 0px; pointer-events: auto;">
        <button @click="layout">layout</button>
      </div>
      <GraphView :board="board" @updateAllViewport="updateAllViewport">
        <DAGNodeView
          v-for="nodeView in viewNodes"
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
      <LineHUDCanvas :nodes="nodes" :nodesLayoutMap="nodesLayoutMap" :boardInfo="board" />
    </div>

    <div class="command-bar">
      <button @click="run" v-if="!isRunning">
        <font-awesome-icon icon="play" />
      </button>
      <button @click="stop" v-if="isRunning">
        <font-awesome-icon icon="stop" />
      </button>
      <button @click="step" v-if="!isRunning">
        <font-awesome-icon icon="step-forward" />
      </button>

      <button @click="inspectGraph" v-if="!showGraphViewer">inspectGraph</button>
      <button @click="closeGraphInspector" v-if="showGraphViewer">closeGraphViewer</button>

      <button @click="toggleScenePanel">
        <font-awesome-icon icon="sitemap" />
      </button>
      <button @click="toggleConfigPanel">
        <font-awesome-icon icon="cog" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Application } from "../application";
import GraphView from "../components/graph/graph-viewer.vue";
import DAGNodeView from "../components/graph/dag-node.vue";
import LineHUDCanvas from "./line-hud-canvas.vue";
import RenderTargetNodeView from "../components/graph/nodes/render-target-node.vue";
import {
  GraphBoardInfo,
  ViewNode,
  layoutGraph,
  NodeLayout
} from "../model/graph-view";
import { RenderTargetNode } from "../../../src/render-graph/node/render-target-node";
import { Vector4, DAGNode } from "../../../src/artgl";

@Component({
  components: {
    GraphView,
    DAGNodeView,
    RenderTargetNodeView,
    LineHUDCanvas
  }
})
export default class ViewerCanvas extends Vue {
  $viewer!: Application;

  isRunning: boolean = false;
  $store: any;

  mounted() {
    const canvas = this.$el.querySelector(
      "#viewer-canvas"
    ) as HTMLCanvasElement;
    Vue.prototype.$viewer = new Application(canvas);
    this.isRunning = this.$viewer.framer.active;
    if (document.body.clientWidth > 600) {
      this.toggleConfigPanel(true);
    }
    if (document.body.clientWidth > 1000) {
      this.toggleScenePanel(true);
    }
    setTimeout(() => {
      this.step();
    }, 1);
  }

  beforeDestroy() {
    Vue.prototype.$viewer.unintialize();
    Vue.prototype.$viewer = undefined;
  }

  async toggleScenePanel(action?: boolean) {
    if (action !== undefined) {
      this.$store.state.showScenePanel = action;
    } else {
      this.$store.state.showScenePanel = !this.$store.state.showScenePanel;
    }
    await this.$nextTick();
    this.$viewer.notifyResize();
  }

  async toggleConfigPanel(action?: boolean) {
    if (action !== undefined) {
      this.$store.state.showConfigPanel = action;
    } else {
      this.$store.state.showConfigPanel = !this.$store.state.showConfigPanel;
    }
    await this.$nextTick();
    this.$viewer.notifyResize();
  }


  lastDownPositionX: number = 0;
  lastDownPositionY: number = 0;
  canvasMouseDown(e: MouseEvent){
    this.lastDownPositionX = e.screenX;
    this.lastDownPositionY = e.screenY;
  }

  canvasMouseUp(e: MouseEvent){
    if(e.screenX === this.lastDownPositionX && e.screenY === this.lastDownPositionY){
      this.pick(e);
    }
  }

  pick(e: MouseEvent) {
    const canvas = this.$el.querySelector("canvas")!;
    this.$viewer.pick(
      e.offsetX / canvas.clientWidth,
      (canvas.clientHeight - e.offsetY) / canvas.clientHeight
    );
  }

  showGraphViewer: boolean = false;
  board: GraphBoardInfo = {
    width: 0,
    height: 0,
    transformX: 0,
    transformY: 0,
    scale: 1
  };

  viewNodes: ViewNode[] = [];

  get nodes() {
    return this.viewNodes.map(vn => vn.node);
  }

  get nodesLayoutMap() {
    const map = new Map();
    this.viewNodes.forEach(vn => {
      map.set(vn.node, vn.layout);
    });
    return map;
  }

  updateViewport({ node, layout }: { node: DAGNode; layout: NodeLayout }) {
    if (node instanceof RenderTargetNode) {
      const viewport = new Vector4();
      const l = layout;
      const n = node;
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
    this.viewNodes.forEach(node => {
      this.updateViewport(node);
    });
  }

  layout() {
    const map: any = {};
    this.viewNodes.forEach(node => {
      map[node.node.uuid] = node.layout;
    });
    layoutGraph(this.$viewer.pipeline.graph.screenNode!, map);
    this.updateAllViewport();
  }

  isRenderTargetNode(node: DAGNode) {
    return node instanceof RenderTargetNode;
  }

  inspectGraph() {
    this.$viewer.pipeline.graph.enableDebuggingView = true;
    const nodes = this.$viewer.pipeline.graph.nodes;
    this.viewNodes = nodes.map(node => {
      return {
        node,
        layout: new NodeLayout()
      };
    });
    this.showGraphViewer = true;
    this.layout();
  }

  closeGraphInspector() {
    this.$viewer.pipeline.graph.enableDebuggingView = false;
    this.showGraphViewer = false;
  }

  run() {
    this.$viewer.run();
    this.isRunning = true;
  }

  stop() {
    this.$viewer.stop();
    this.isRunning = false;
  }

  step() {
    this.$viewer.step();
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
  border: 3px solid rgb(155, 195, 241);
  color: rgb(26, 118, 223);
  box-sizing: border-box;
}
</style>
