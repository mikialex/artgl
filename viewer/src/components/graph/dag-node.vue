<template>
  <div
    class="dag-node"
    :style="{
    left: viewPositionX,
    top: viewPositionY,
    width: viewWidth,
   }"
  >
    <div
      class="node-title"
      @mousedown="startDrag"
      :style="{cursor: this.isDragging? 'grabbing': ''}"
    >
      <span>{{node.constructor.name}}: {{node.uuid.slice(0,4)}}</span>
    </div>

    <!-- <div class="input-info">
      <div v-for="fromNode in inputs" :key="fromNode.uuid">{{node.uuid}}</div>
    </div>-->

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, InjectReactive } from "vue-property-decorator";
import { ShaderGraph, ShaderNode, DAGNode } from "../../../../src/artgl";
import {
  NodeLayout,
  GraphBoardInfo,
  ViewNode,
  ConnectionLine,
  getRightEnd
} from "../../model/graph-view";
import { findFirst } from "../../../../src/util/array";

@Component({
  components: {}
})
export default class DAGNodeView extends Vue {
  @InjectReactive() nodes: ViewNode[];
  @InjectReactive() lines: ConnectionLine[];

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

  @Prop({
    required: false,
    default: true
  })
  editable: boolean;

  getNodesLayout(node: DAGNode) {
    return findFirst(this.nodes, vn => {
      return vn.node === node;
    }).layout;
  }

  getLines(): ConnectionLine[] {
    return this.inputs.map(inputNode => {
      const rightCenter = getRightEnd(this.getNodesLayout(inputNode));
      const line = new ConnectionLine();
      line.startX = rightCenter.x;
      line.startY = rightCenter.y;
      line.endX = this.layout.absX;
      line.endY = this.layout.absY;
      return line;
    });
  }

  selfLines: ConnectionLine[] = [];
  updateLine() {
    this.selfLines.forEach(line => {
      const position = this.lines.indexOf(line);
      if (position !== -1) {
        this.lines.splice(position, 1);
      }
    });
    this.selfLines = this.getLines();
    this.selfLines.forEach(line => {
      this.lines.push(line);
    });
  }

  mounted() {
    this.updateLine();
  }

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
    this.layout.absX = this.originX + e.screenX - this.screenOriginX;
    this.layout.absY = this.originY + e.screenY - this.screenOriginY;
    this.$emit("updateViewport", { node: this.node, layout: this.layout });
    this.$emit("updateLine", this.node)
  }
}
</script>

<style lang="scss" scoped>
.dag-node {
  border: 1px solid #aaa;
  position: absolute;
  font-size: 12px;
  user-select: none;
  pointer-events: auto;
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

