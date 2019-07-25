<template>
  <div class="config-panel">
    <div class="panel-title">
      Render configuration
      <button @click="hide">hide</button>
    </div>
    <div class="config-wrap">
      <Config :config="appConfig"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Config from '../components/conf/config.vue';
import { GLApp } from '../application';
@Component({
  components:{
    Config
  }
})
export default class ConfigPanel extends Vue {
  @Prop() appConfig;
  $store: any;

  async hide(){
    this.$store.state.showConfigPanel = false;
    await this.$nextTick()
    GLApp.notifyResize();
  }
}
</script>

<style scoped lang="scss">
.panel-title{
  font-weight: bold;
  padding: 5px;
  font-size: 14px;
}

.config-panel{
  border: 1px solid #ddd;
}

.config-wrap{
  overflow-y: scroll;
  height: 100%;
}

</style>
