<template>
  <div class="item">
    <div class="item-head">
      <div class="item-name">
      {{config.name}} 
      </div>
      <div class="inline-editor">
        <NumberEditor
          v-if="typeof config.value === 'number' && config.valueConfig === undefined"
          v-model="configValue"/>
        <BooleanEditor
          v-if="typeof config.value === 'boolean' && config.valueConfig === undefined"
          v-model="configValue"/>

        <SelectEditor
          v-if="config.valueConfig && config.valueConfig.type === 'select'"
          :list ="config.valueConfig.selectItem"
          v-model="configValue"/>

        <button class="expand-editor"
          @click="expandEditor = !expandEditor"
          v-if="shouldHaveCustomEditor">&</button>
      </div>
    </div>

    <Editors v-if="shouldHaveCustomEditor && expandEditor"
    :editorConfig="config.editors" 
    v-model="configValue"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Editors from './editors.vue';
import NumberEditor from './number.vue';
import BooleanEditor from './boolean.vue';
import SelectEditor from './select.vue';

@Component({
  components:{
    Editors, NumberEditor, BooleanEditor, SelectEditor
  }
})
export default class ConfigItem extends Vue {
  expandEditor:boolean = false;

  @Prop({ required: true }) config: any;

  get configValue(){
    return this.config.value;
  }

  set configValue(newValue){
    if(this.config.onChange !== undefined){
      this.config.onChange(newValue);
    }
    this.config.value = newValue;
  }

  get shouldHaveCustomEditor(){
    return this.config.editors !== undefined
  }
}

</script>

<style lang="scss" scoped>
.item{
  border-top: 1px solid #ddd;
}

.item-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
}

.inline-editor{
  display: flex;
  align-items: center;
}

.item-name{
  color:#444;
}

</style>


