<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from 'artgl';
import { makeTerminal, makeNonTerminal, ParseConfiguration, EOF } from '../../../parser/src/parser/parse-symbol';

@Component({
})
export default class Debug extends Vue {
  mounted(){

    console.log("debug")

    const a = makeTerminal('a')
    const b = makeTerminal('b')
    const X = makeNonTerminal('X')
    const S = makeNonTerminal('S')

    X.addRule([a, X])
      .addRule([b])

    S.addRule([X, X])

    
    const start = new ParseConfiguration(S.rules[0], 0, new Set([EOF]));
    console.log(start.toString())
    console.log();
    const result = start.genClosureParseConfigurations();
    result.forEach(r=>{
    console.log(r.toString())
    })
  }
}
</script>