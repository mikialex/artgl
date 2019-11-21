<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from 'artgl';
import { makeTerminal, makeNonTerminal, EOF } from '../../../parser/src/parser/parse-symbol';
import { ParseConfiguration } from '../../../parser/src/parser/parse-configuration'

@Component({
})
export default class Debug extends Vue {
  mounted(){

    console.log("debug")

    const a = makeTerminal('a')
    const b = makeTerminal('b')
    const X = makeNonTerminal('X')
    const S = makeNonTerminal('S')
    const SPlus = makeNonTerminal('SPlus')

    X.addRule([a, X])
      .addRule([b])

    S.addRule([X, X])

    SPlus.addRule([S])

    
    const start = new ParseConfiguration(SPlus.rules[0], 0, new Set([EOF]));
    const result = start.genClosureParseConfigurations();
    result.forEach(r=>{
    console.log(r.toString())
    })
  }
}
</script>