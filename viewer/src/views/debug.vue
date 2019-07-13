<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TSSAOBlendTechnique } from '../../../src/technique/technique-lib/blend-technique';
import { SSAOTechnique } from '../../../src/technique/technique-lib/ssao-technique';
@Component({
})
export default class Debug extends Vue {
  mounted(){
    console.log("debug")
    const TSSAOTech = new SSAOTechnique();
    console.log(TSSAOTech._programConfigCache.vertexShaderString)
    console.log(TSSAOTech._programConfigCache.fragmentShaderString)
  }
}
</script>