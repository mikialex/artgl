<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from 'artgl/src/artgl';
import { TestS } from 'artgl/src/shading/basic-lib/progressive-dof';
@Component({
})
export default class Debug extends Vue {
  mounted(){

    console.log("debug")

    const test = new TestS();
  }
}
</script>