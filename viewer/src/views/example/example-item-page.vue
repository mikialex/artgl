<template>
  <div>
    <h1>{{example.name}}</h1>
    <div>
      <!-- <pre>{{example.build.toString()}}</pre> -->
    </div>
    <div>
      <canvas></canvas>
    </div>
    <div v-if="exampleHasBuild">
      <button @click ="start" v-if="!isRunning">start</button>
      <button @click ="step" v-if="!isRunning">step</button>
      <button @click ="stop" v-if="isRunning">stop</button>
    </div>
    <div v-else>
      example is in building
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ViewerTestBridge } from "../../../../example/contents/test-bridge";

const bridge = new ViewerTestBridge();

@Component({
  components: {}
})
export default class ConfigPanel extends Vue {
  $store: any;
  $router: any;
  $route: any;

  get example() {
    this.$store.state.viewExample = this.$route.params.name;
    for (let i = 0; i < this.$store.state.examples.length; i++) {
      const example = this.$store.state.examples[i];
      if (example.name === this.$store.state.viewExample) {
        return example;
      }
    }
    throw "cant find example";
  }

  exampleHasBuild: boolean = false;
  isRunning: boolean = false;

  start(){
    bridge.framer.run();
    this.isRunning = true;
  }

  stop(){
    bridge.framer.stop();
    this.isRunning = false;
  }

  step(){
    bridge.framer.step();
  }

  async mounted() {
    console.log(this.example);
    await this.example.build(bridge);
    this.exampleHasBuild = true;
  }
}
</script>


<style lang="scss" scoped>
canvas {
  width: 800px;
  height: 600px;
  border: 1px solid #aaa;
}
</style>
