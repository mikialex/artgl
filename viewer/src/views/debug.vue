<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from '../../../src/artgl';
import { TestS } from '../../../src/shading/basic-lib/progressive-dof';
import { createUniformProviderCache } from '../../../src/core/shading-util';
@Component({
})
export default class Debug extends Vue {
  mounted(){

    console.log("debug")

    const test = new TestS();
    console.log(createUniformProviderCache(test));
  }
}
</script>