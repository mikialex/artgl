<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from 'artgl';
@Component({
})
export default class Debug extends Vue {
  mounted(){

    console.log("debug")

  }
}
</script>