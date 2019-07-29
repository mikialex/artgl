<template>
  <div class="shader-node">
    <div
      class="node-title"
      @mousedown="startDrag"
      :style="{cursor: this.isDragging? 'grabbing': ''}"
      :class="{'canteval-node':!node.cashadowl}"
    >
      <span>{{node.uuid}}</span>
    </div>

    <div class="input-info">
      <div v-for="fromNode in results" :key="fromNode.uuid">{{node.uuid}}</div>
    </div>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ShaderGraph, ShaderNode, DAGNode } from "../../../../src/artgl";
import { NodeLayout } from "../../model/graph-view";

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

  get inputs(): DAGNode[] {
    const results = [];
    this.node.fromNodes.forEach(value => {
      results.push(value);
    });
    return results;
  }

  isDragging: boolean = false;
  startDrag() {}
}
</script>

<style lang="scss" scoped>
.shader-node {
  width: 100px;
  height: 50px;
  border: 1px solid #aaa;
}
</style>

