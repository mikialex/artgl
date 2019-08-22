<template>
  <div class="config-panel">
    <div class="panel-title">
      Render configuration
      <button @click="hide">hide</button>
    </div>
    <div class="config-wrap">
      <Config :config="appConfig" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Config from "../components/conf/config.vue";
import { RenderConfig } from "../components/conf/interface";
import { Application } from "../application";
@Component({
  components: {
    Config
  }
})
export default class ConfigPanel extends Vue {
  @Prop() appConfig?: RenderConfig;
  $store: any;
  $viewer?: Application;

  async hide() {
    this.$store.state.showConfigPanel = false;
    await this.$nextTick();
    this.$viewer!.notifyResize();
  }
}
</script>

<style scoped lang="scss">
.panel-title {
  font-weight: bold;
  padding: 5px;
  font-size: 14px;
}

.config-panel {
  border: 1px solid #ddd;
}

.config-wrap {
  overflow-y: scroll;
  height: calc(100% - 40px);
}
</style>
