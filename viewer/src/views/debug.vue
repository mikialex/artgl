<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TAAShading } from '../../../src/technique/technique-lib/taa-technique';
import { NormalShading } from '../../../src/artgl';
import { DepthShading } from '../../../src/technique/technique-lib/depth-technique';
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