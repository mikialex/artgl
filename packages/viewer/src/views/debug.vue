<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { NormalShading, DepthShading, TSSAOShading, Shading } from 'artgl';
import { makeTerminal, makeNonTerminal, EOF } from '../../../parser/src/parser/parse-symbol';
import { ParseConfiguration } from '../../../parser/src/parser/parse-configuration'
import { constructParseGraph } from '../../../parser/src/parser/state-node';
import { LR1Parser } from '../../../parser/src/parser/lr';

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

    
    // const start = new ParseConfiguration(SPlus.rules[0], 0, new Set([EOF]));
    // const result = start.genClosureParseConfigurations();
    // result.forEach(r=>{
    // console.log(r.toString())
    // })

    // debugger;
    // (window as any).constructParseGraph = constructParseGraph;
    // (window as any).SPlus = SPlus;
    // const root = constructParseGraph(SPlus);
    // console.log(root)

    const parser = new LR1Parser(SPlus);
    const re = parser.parse([b,a,a,b, EOF]);
    console.log(re)
  }
}
</script>