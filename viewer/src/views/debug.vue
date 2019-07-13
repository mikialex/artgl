<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TSSAOBlendTechnique } from '../../../src/technique/technique-lib/blend-technique';
import { SSAOTechnique } from '../../../src/technique/technique-lib/ssao-technique';
import { TAATechnique } from '../../../src/technique/technique-lib/taa-technique';
@Component({
})
export default class Debug extends Vue {
  mounted(){
    console.log("debug")
    const test = new TAATechnique();
    console.log(test._programConfigCache)
    console.log(test._programConfigCache.vertexShaderString)
    console.log(test._programConfigCache.fragmentShaderString)
  }
}
</script>