<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading } from '../../../src/artgl';
import { DepthShading } from '../../../src/shading/pass-lib/depth';
@Component({
})
export default class Debug extends Vue {
  mounted(){
    console.log("debug")
    const test = new DepthShading();
    console.log(test.getProgramConfig());
  }
}
</script>