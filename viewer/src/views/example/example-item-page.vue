<template>
  <div class="example-detail">
    <div class="example-viewer">
      <div class="example-title">
        <h1>{{example.title}}</h1>

        <div>
          <button>view code</button>

          <button  @click="showConfig = !showConfig"
          >config panel
            <font-awesome-icon
            v-if="showConfig"
             icon="minus-square" />
          </button>

          <div class="config-panel"
          v-if="config && showConfig">
            <Config :config="config" />
          </div>
        </div>
      </div>

      <div class="canvas-wrap">
        <canvas></canvas>
        <div v-if="!exampleHasBuild">example is in building</div>
      </div>

      <div v-if="exampleHasBuild" class="control-panel">
        <font-awesome-icon icon="play" @click="start" v-if="!isRunning" />
        <font-awesome-icon icon="stop" @click="stop" v-if="isRunning" />
        <font-awesome-icon icon="step-forward" @click="step" v-if="!isRunning" />
      </div>
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

  showConfig: boolean = true;

  config: RenderConfig = {
    name: "example config",
    type: "folder",
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

    if (bridge.testConfig !== undefined) {
      this.config.value.push(bridge.testConfig);
    }

    this.exampleHasBuild = true;
  }
}
</script>


<style lang="scss" scoped>
.example-detail {
  border-top: 1px solid #eee;
  width: 100%;
  height: calc(100vh - 40px);

  display: flex;
}

.example-viewer {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.canvas-wrap {
  flex-grow: 1;
}

canvas {
  width: 100%;
  height: 100%;

  border: 1px solid #aaa;
}

.example-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  > h1 {
    margin: 5px;
  }
  border-bottom: #eee;

  button{
    height: 30px;
    margin:3px;
    background: #444;
    border:0px;
    border-radius: 3px;
    color: #fff;
  }
}

.config-panel{
  position: absolute;
  right:0px;
  bottom:-50%;
}

.control-panel {
  min-height: 25px;
}
</style>
