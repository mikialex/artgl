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
      <button @click="start" v-if="!isRunning">start</button>
      <button @click="step" v-if="!isRunning">step</button>
      <button @click="stop" v-if="isRunning">stop</button>
    </div>
    <div v-else>example is in building</div>

    <div v-if="config">
      <Config :config="config" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ViewerTestBridge } from "../../../../example/contents/test-bridge";
import Config from "../../components/conf/config.vue";
import { RenderConfig } from "../../components/conf/interface";

const bridge = new ViewerTestBridge();

@Component({
  components: { Config }
})
export default class ConfigPanel extends Vue {
  $store: any;
  $router: any;
  $route: any;

  config: RenderConfig = {
    name: 'example config',
    type: 'folder',
    value: []
  };

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

  start() {
    bridge.framer.run();
    this.isRunning = true;
  }

  stop() {
    bridge.framer.stop();
    this.isRunning = false;
  }

  step() {
    bridge.framer.step();
  }

  async mounted() {
    bridge.reset();
    
    await this.example.build(bridge);

    if(bridge.testConfig !== undefined){
      this.config.value.push(bridge.testConfig)
    }

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
