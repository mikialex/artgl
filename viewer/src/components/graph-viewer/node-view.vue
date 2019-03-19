<template>
  <div
    class="node-wrap"
    :style="{
    left: viewPositionX,
    top: viewPositionY,
    width: viewWidth,
    height: viewHeight,
  }"
  >
    <div
      class="node-title"
      @mousedown="startdrag"
      :style="{cursor: this.isDraging? 'grabbing': ''}"
      :class="{'canteval-node':!node.cashadowl}"
    >
      <span>{{node.name}}</span>
    </div>

    <!-- <div class="node-opration">
      <button @click="hasExpandMenu = true">m</button>
      <div 
      class="export-point"
      v-if="canConnect"
      @mousedown ="startConnection">
      </div>
    </div>

    <div class="connection-inputs" 
    v-if="!node.isInputNode"
    @mousemove="makeConnect">
      <div
      class="connection-input"
      v-for="input in node.inputParams"
      :key="input.name"
      :dataPara="input.name"
      >
        <div class="input-point"
        v-if="input.valueRef"
        @click="removeDependency(input)"></div>
        {{input.name}}
      </div>
    </div>-->
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { GraphNodeView, GraphView } from "../../model/graph-view";
import { Vector4 } from "../../../../src/math/vector4";
import { GLApp } from "../../application";

@Component({
  name: "NodeWrap"
})
export default class NodeUIWrap extends Vue {
  @Prop() node: GraphNodeView;
  @Prop() graph: GraphView;
  @Prop() boardInfo;

  get viewPositionX() {
    return this.node.positionX + "px";
  }

  get viewPositionY() {
    return this.node.positionY + "px";
  }

  get viewWidth() {
    return this.node.width + "px";
  }
  get viewHeight() {
    return this.node.height + "px";
  }

  isDraging = false;
  originX = 0;
  originY = 0;
  screenOriginX = 0;
  screenOriginY = 0;
  updateViewPortToGraph() {
    this.$emit("updateviewport", this.node)
  }

  mounted() {
    this.updateViewPortToGraph();
  }

  dragging(e: MouseEvent) {
    this.node.positionX = this.originX + e.screenX - this.screenOriginX - this.boardInfo.transformX;
    this.node.positionY = this.originY + e.screenY - this.screenOriginY - this.boardInfo.transformY;
    this.updateViewPortToGraph();
  }
  startdrag(e: MouseEvent) {
    this.isDraging = true;
    this.originX =
      this.$el.getBoundingClientRect().left - this.boardInfo.offsetX;
    this.originY =
      this.$el.getBoundingClientRect().top - this.boardInfo.offsetY;
    this.screenOriginX = e.screenX;
    this.screenOriginY = e.screenY;
    window.addEventListener("mousemove", this.dragging);
    window.addEventListener("mouseup", e => {
      this.isDraging = false;
      window.removeEventListener("mousemove", this.dragging);
    });
  }
}
</script>

<style scoped lang="scss">
.node-wrap {
  pointer-events: auto;
  width: 100px;
  min-height: 50px;
  border: 1px solid #999;
  border-radius: 3px;
  position: absolute;
  user-select: none;
  font-size: 12px;
  > .node-title {
    background: #fff;
    height: 20px;
    display: flex;
    cursor: grab;
    justify-content: center;
    border-bottom: 1px solid #ddd;
  }
}
</style>
