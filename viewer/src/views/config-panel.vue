<template>
  <div class="config-panel">
    <div class="panel-title">
      Render configuration
    </div>
    <Config :config="demoConfig"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Config from '../components/conf/config.vue';
import demoConfig from '../conf';
@Component({
  components:{
    Config
  }
})
export default class ConfigPanel extends Vue {
  demoConfig = demoConfig
}
</script>

<style scoped lang="scss">
.panel-title{
  font-weight: bold;
  padding: 5px;
  font-size: 16px;
}

.config-panel{
  border: 1px solid #ddd;
}

</style>
