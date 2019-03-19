<template>
  <div class="item">
    <div class="item-head">
      <div class="item-name">
      {{config.name}} 
      </div>
      <div class="inline-editor">
        <NumberEditor
          v-if="typeof config.value === 'number'"
          v-model="configValue"/>
        <BooleanEditor
          v-if="typeof config.value === 'boolean'"
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
@Component({
  components:{
    Editors, NumberEditor, BooleanEditor
  }
})
export default class ConfigItem extends Vue {
  expandEditor:boolean = false;

  @Prop() config: any;

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


