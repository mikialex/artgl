<template>
  <div>
    <button @click="actualSize">actual size</button>
    <button @click="defaultSize">default size</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DAGNode } from "../../../../../src/artgl";
import { NodeLayout, GraphBoardInfo } from "../../../model/graph-view";

@Component({
  components: {}
})
export default class RenderTargetNodeView extends Vue {
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

  actualSize() {
    // this.$emit("actualSize", this.view);
  }

  defaultSize() {
    // this.$emit("defaultSize", this.view);
  }
}
</script>

<style scoped lang="scss">
</style>
