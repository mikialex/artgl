<template>
  <div
    class="dag-node"
    :style="{
    left: viewPositionX,
    top: viewPositionY,
    width: viewWidth,
    height: viewHeight,
   }"
  >
    <div
      class="node-title"
      @mousedown="startDrag"
      :style="{cursor: this.isDragging? 'grabbing': ''}"
    >
      <span>{{node.uuid.slice(0,4)}}</span>
    </div>

    <div class="input-info">
      <div v-for="fromNode in inputs" :key="fromNode.uuid">{{node.uuid}}</div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ShaderGraph, ShaderNode, DAGNode } from "../../../../src/artgl";
import { NodeLayout, GraphBoardInfo } from "../../model/graph-view";

@Component({
  components: {}
})
export default class DAGNodeView extends Vue {
  @Prop({
    required: true
  })
  node: DAGNode;

  @Prop({
    required: true
  })
  layout: NodeLayout;

  @Prop({
    required: true
  })
  boardInfo: GraphBoardInfo;

  get inputs(): DAGNode[] {
    const results = [];
    this.node.fromNodes.forEach(value => {
      results.push(value);
    });
    return results;
  }

  get viewPositionX() {
    return this.layout.absX + "px";
  }

  get viewPositionY() {
    return this.layout.absY + "px";
  }

  get viewWidth() {
    return this.layout.width + "px";
  }
  get viewHeight() {
    return this.layout.height + "px";
  }

  isDragging: boolean = false;
  originX = 0;
  originY = 0;
  screenOriginX = 0;
  screenOriginY = 0;
  startDrag(e: MouseEvent) {
    this.isDragging = true;
    this.originX = this.layout.absX;
    this.originY = this.layout.absY;
    this.screenOriginX = e.screenX;
    this.screenOriginY = e.screenY;
    window.addEventListener("mousemove", this.dragging);
    window.addEventListener("mouseup", e => {
      this.isDragging = false;
      window.removeEventListener("mousemove", this.dragging);
    });
  }

  dragging(e: MouseEvent) {
    this.layout.absX =
      this.originX + e.screenX - this.screenOriginX - this.boardInfo.transformX;
    this.layout.absY =
      this.originY + e.screenY - this.screenOriginY - this.boardInfo.transformY;
    this.$emit("updateViewport");
  }
}
</script>

<style lang="scss" scoped>
.dag-node {
  width: 100px;
  height: 50px;
  border: 1px solid #aaa;
  position: absolute;
  font-size: 12px;
  user-select: none;
}

.node-title {
  background: #fff;
  height: 20px;
  display: flex;
  cursor: grab;
  justify-content: center;
  border-bottom: 1px solid #ddd;
}
</style>

