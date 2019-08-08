<template>
  <div>
    {{node.factory.name}}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DAGNode, RenderTargetNode, ShaderFunctionNode } from "../../../../../src/artgl";
import { NodeLayout, GraphBoardInfo } from "../../../model/graph-view";

@Component({
  components: {}
})
export default class ShaderFunctionNodeView extends Vue {
  @Prop({
    required: true
  })
  node: ShaderFunctionNode;

  @Prop({
    required: true
  })
  layout: NodeLayout;
  
}
</script>

<style scoped lang="scss">
</style>
