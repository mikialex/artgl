<template>
  <div class="item">
    <div class="item-name">
    {{config.name}} 
    </div>
    <Editors :editorConfig="config.editors" v-model="config.value"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Editors from './editors.vue';
@Component({
  components:{
    Editors
  }
})
export default class ConfigItem extends Vue {
  name = 'config-item'

  @Prop() config: any;
}

</script>

<style lang="scss" scoped>
.item{
  border-top: 1px solid #ddd;
}
.item-name{
  padding: 5px;
  color:#444;
}
</style>


