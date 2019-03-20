<template>
  <div class="graph-viewer" 
  tabindex="-1">
    <div class="graph-wrap"
      :style="{
          transform
        }"
    >
      <PassNode
        v-for="node in graphview.passNodes"
        :key="node.uuid"
        :view="node"
        :boardInfo="board"
         @updateviewport = "updateViewport"
      />

      <RenderTargetNode
        v-for="node in graphview.targetNodes"
        :key="node.uuid"
        :view="node"
        :boardInfo="board"
        @updateviewport = "updateViewport"
      />
    </div>

      <svg class="connection"
      :width="board.width + 'px'" 
      :height="board.height + 'px'">
        <path
          class="connect"
          v-for="line in lines"
          :key="line.id"
          :d="line.line"
          stroke="black"
          fill="transparent"
        ></path>
      </svg>

    <div class="mask"
      v-if="showMove"
      @mousedown ="startDrag"
    >
    </div>

    <div class="ops">
      <button v-if="!showMove" @click="showMove = true">move</button>
      <button  v-if="showMove" @click="showMove = false">unmove</button>
      <button  @click="layout">relayout</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GraphView, GraphNodeView } from "../../model/graph-view";
import PassNode from "./node/pass-node-view.vue";
import RenderTargetNode from "./node/render-target-node-view.vue";
import { Vector4 } from "../../../../src/math/vector4";
import NodeWrap from "./node-view.vue";
import { GLApp } from "../../application";

@Component({
  components: {
    PassNode,
    NodeWrap,
    RenderTargetNode
  }
})
export default class GraphViewer extends Vue {
  @Prop() graphview: GraphView;

  board = {
    offsetX: 0,
    offsetY: 0,
    width: 10,
    height: 10,
    transformX :100,
    transformY :100,
  };

  get transform(){
    return `translate(${this.board.transformX}px, ${this.board.transformY}px)`
  }

  showMove = false;

  isDraging = false;
  originTransformX: number;
  originTransformY: number;
  screenOriginX:number;
  screenOriginY:number;
  startDrag(e){
    this.isDraging = true;
    this.screenOriginX = e.screenX;
    this.screenOriginY = e.screenY;
    this.originTransformX = this.board.transformX;
    this.originTransformY = this.board.transformY;
    window.addEventListener("mousemove", this.dragging);
    window.addEventListener("mouseup", e => {
      this.isDraging = false;
      window.removeEventListener("mousemove", this.dragging);
    });
  }

  dragging(e){
    this.board.transformX = this.originTransformX + e.screenX - this.screenOriginX;
    this.board.transformY = this.originTransformY + e.screenY - this.screenOriginY;
    this.updateAllViewports();
  }

  updateViewport(node: GraphNodeView){
    const viewport = new Vector4();
    viewport.set(
      node.positionX + this.board.transformX,
      this.board.height - node.positionY - node.height - this.board.transformY,
      node.width,
      node.height
    );
    viewport.multiplyScalar(window.devicePixelRatio);
    GLApp.graph.updateRenderTargetDebugView(node.uuid, viewport);
  }

  updateAllViewports(){
    this.graphview.targetNodes.forEach(node =>{
      this.updateViewport(node)
    })
    this.graphview.passNodes.forEach(node =>{
      this.updateViewport(node)
    })
  }

  layout(){
    this.graphview.layout()
    this.updateAllViewports();
  }

  mounted() {
    this.updateBoard();
    window.addEventListener("resize", this.updateBoard)
  }

  beforeDestroy(){
    window.removeEventListener("resize", this.updateBoard)
  }

  updateBoard(){
    this.board.offsetX = this.$el.getBoundingClientRect().left;
    this.board.offsetY = this.$el.getBoundingClientRect().top;
    this.board.width = this.$el.clientWidth;
    this.board.height = this.$el.clientHeight;
    this.updateAllViewports();
  }

  get lines() {
    let lines = [];
    this.graphview.passNodes.forEach(node => {
      lines = lines.concat(node.getConnectionLines(this.graphview, this.board));
    });
    this.graphview.targetNodes.forEach(node => {
      lines = lines.concat(node.getConnectionLines(this.graphview, this.board));
    });
    return lines;
  }
}
</script>

<style lang="scss" scoped>
.graph-viewer {
  pointer-events: none;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100% - 40px);
  overflow: hidden;
}

.connector {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100% - 40px);
  z-index: -10;
}

.graph-wrap {
  // position: relative;
}

.mask {
  width: 100%;
  height: 100%;
  cursor: grab;
  top:0px;
  left:0px;
  position: absolute;
  pointer-events: auto;
}

.ops{
  top:0px;
  left:0px;
  position: absolute;
  pointer-events: auto;
}
</style>
