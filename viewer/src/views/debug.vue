<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from '../../../src/artgl';
@Component({
})
export default class Debug extends Vue {
  mounted(){
    console.log("debug")
    const tssaoShading = new TSSAOShading();
    const tssaoShader = new Shading().decorate(tssaoShading);
    console.log(tssaoShader)
    console.log(tssaoShader.getProgramConfig());
  }
}
</script>