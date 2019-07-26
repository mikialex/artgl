<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading } from '../../../src/artgl';
@Component({
})
export default class Debug extends Vue {
  mounted(){
    console.log("debug")
    const test = new DepthShading();
    // console.log(test.getProgramConfig());
  }
}
</script>