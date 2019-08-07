<template>
  <div class="folder">
    <div class="title" @click="toggle">
      <span v-if="!expand">></span>
      <span v-else>=</span>
      {{config.name}}
      <span class="empty-hint"
      v-if="isEmptyList"> empty </span>
    </div>
    <div  v-if="expand" class="subitem">
      <div 
      v-for="subConfig in config.value" 
      :key="subConfig.name">

        <config-folder
          v-if="Array.isArray(subConfig.value)" 
          :config="subConfig"/>
        <ConfigItem
          v-else
          v-model="subConfig.value"
          :config="subConfig"/>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ConfigItem from './item.vue';
@Component({
  name: 'config-folder',
  components:{
    ConfigItem
  }
})
export default class Folder extends Vue {
  expand:boolean = true;
  @Prop({ required: true }) config: any;

  get isEmptyList(){
    return this.config.value.length === 0
  }

  toggle(){
    if(!this.isEmptyList){
      this.expand = !this.expand;
    }
  }
}


</script>

<style lang="scss" scoped>
.folder{
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.title{
  text-align: left;
  padding: 3px;
  font-weight: bold;
  cursor: pointer;
  background: #fff;
  &:hover{
    background: #eee;
  }
}

.subitem{
  border-left: 4px solid #888;
  margin: 0px;
  background: #f5f5f5;
}

.empty-hint{
  color: #ddd;
}
</style>
