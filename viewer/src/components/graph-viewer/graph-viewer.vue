<template>
  <div class="graph-viewer">

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component
export default class GraphViewer extends Vue {
@Prop() rootOffsetX:number = 0;
@Prop() rootOffsetY:number = 0;


}
</script>

<style lang="scss" scoped>
.graph-viewer{
  position: absolute;
}
</style>
