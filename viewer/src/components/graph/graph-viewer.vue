<template>
  <div class="graph-viewer" 
  tabindex="-1">
    <div class="graph-wrap"
      :style="{
          transform
        }"
    >

    <slot> </slot>

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
import { Vector4 } from "../../../../src/math";
import { GraphBoardInfo } from "../../model/graph-view";

@Component({
  components: {
  }
})
export default class GraphViewer extends Vue {
  @Prop({required: true}) board: GraphBoardInfo;

  offsetX:number =  0
  offsetY:number =  0

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
    this.$emit("updateAllViewport")
  }

  // actualSize(node: GraphNodeView){
  //   const targetNode = GLApp.pipeline.graph.getNodeByID(node.uuid);
  //   node.width = targetNode.width / window.devicePixelRatio / 2;
  //   node.height =  targetNode.height / window.devicePixelRatio / 2;
  //   this.updateViewport(node);
  // }

  // defaultSize(node: GraphNodeView){
  //   node.width = GraphView.targetNodeDefaultSize;
  //   node.height = GraphView.targetNodeDefaultSize;
  //   this.updateViewport(node);
  // }

  // updateViewport(node: GraphNodeView){
  //   const viewport = new Vector4();
  //   viewport.set(
  //     node.positionX + this.board.transformX,
  //     this.board.height - node.positionY - node.height - this.board.transformY,
  //     node.width,
  //     node.height
  //   );
  //   viewport.multiplyScalar(window.devicePixelRatio);
  //   if(GLApp.pipeline.graph){ // TODO
  //     const engine = GLApp.engine;
  //     GLApp.pipeline.graph.updateRenderTargetDebugView(engine, node.uuid, viewport);
  //   }
  // }

  // updateAllViewports(){
  //   this.graphview.nodes.forEach(node =>{
  //     this.updateViewport(node)
  //   })
  // }

  // layout(){
  //   this.graphview.layout()
  //   this.updateAllViewports();
  // }

  // mounted() {
  //   this.updateBoard();
  //   window.addEventListener("resize", this.updateBoard)
  // }

  // beforeDestroy(){
  //   window.removeEventListener("resize", this.updateBoard)
  // }

  // updateBoard(){
  //   this.board.offsetX = this.$el.getBoundingClientRect().left;
  //   this.board.offsetY = this.$el.getBoundingClientRect().top;
  //   this.board.width = this.$el.clientWidth;
  //   this.board.height = this.$el.clientHeight;
  //   this.updateAllViewports();
  // }

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
