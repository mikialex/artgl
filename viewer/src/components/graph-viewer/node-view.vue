<template>
  <div class="shadow-node-wrap"
  :style="{
    left: viewPositionX,
    top: viewPositionY,
  }">

    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class NodeUIWrap extends Vue {


}
</script>

<style scoped lang="scss">

</style>
