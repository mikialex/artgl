<template>
  <div>
    {{node.name}}
    <button @click="actualSize">actual size</button>
    <button @click="defaultSize">default size</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DAGNode, RenderTargetNode } from "../../../../../src/artgl";
import { NodeLayout, GraphBoardInfo } from "../../../model/graph-view";

@Component({
  components: {}
})
export default class RenderTargetNodeView extends Vue {
  @Prop({
    required: true
  })
  node: RenderTargetNode;

  @Prop({
    required: true
  })
  layout: NodeLayout;
  
  actualSize() {
    this.layout.width = this.node.widthAbs / 2 / window.devicePixelRatio;
    this.layout.height = this.node.heightAbs / 2 / window.devicePixelRatio;
    this.$emit("updateSize", {
      node: this.node,
      layout: this.layout,
    });
  }

  defaultSize() {
    this.layout.width = 200;
    this.layout.height = 200;
    this.$emit("updateSize", {
      node: this.node,
      layout: this.layout,
    });
  }
}
</script>

<style scoped lang="scss">
</style>
