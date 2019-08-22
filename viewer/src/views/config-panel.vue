<template>
  <div class="config-panel">
    <div class="panel-title">
      Render configuration
      <span>
        <font-awesome-icon icon="minus-square"  @click="hide"/>
      </span>
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
  display: flex;
  font-weight: bold;
  padding: 5px;
  font-size: 14px;
  justify-content: space-between;
  align-content: center;
  >span{
    font-size: 16px;
    cursor: pointer;
    &:hover{
      color: rgb(53, 149, 238);
    }
    &:active{
      color: rgb(13, 87, 156);
    }
  }
}

.config-panel {
  border: 1px solid #ddd;
}

.config-wrap {
  overflow-y: scroll;
  height: calc(100% - 40px);
}
</style>
