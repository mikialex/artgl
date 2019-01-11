<template>
  <div class="editor">
    <div class="editor-list" v-if="isMultiEditor">
      <div class="editor-nav"
      v-for="(e, index) in editorConfig"
      :key="e.type"
      @click="useEditor(index)"
      :class="{'active-editor-nav': index === currentEditor}">
      {{e.type}}
      </div>
    </div>

    
    <NumberEditor
    v-if="editor.type === 'number'"
    v-model="_value" 
    :config="editor"/>

    <BooleanEditor
    v-else-if="editor.type === 'boolean'" 
    v-model="_value" 
    :config="editor"/>
          
    <NumberSliderEditor
    v-else-if="editor.type === 'slider'" 
    v-model="_value" 
    :config="editor"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import NumberEditor from './number.vue';
import BooleanEditor from './boolean.vue';
import NumberSliderEditor from './number-slider.vue';
@Component({
  components:{
    NumberEditor, BooleanEditor, NumberSliderEditor
  }
})
export default class Editors extends Vue {
  name = 'editor-list'
  currentEditor = 0;

  get isMultiEditor(){
    return this.editorConfig.length !== 1;
  }

  @Prop() editorConfig: any;
  @Prop() value: any;

  get editor(){
    return this.editorConfig[this.currentEditor];
  }

  get _value(){
    return this.value;
  }

  set _value(value){
    this.$emit('input', value);
  }

  useEditor(index){
    this.currentEditor = index;
  }


}


</script>

<style lang="scss" scoped>
.editor{
  padding: 2px;
  margin: 2px;
  border:1px solid #aaa;
  background: #ccc;
  border-radius: 3px;
}

.editor-list{
  display: flex;

}

.editor-nav{
  display: inline-block;
  padding: 3px;
  margin:2px;
  cursor: pointer;
  &:hover{
    background: #eee;
  }
}

.active-editor-nav{
  background: #eee;
  border-radius: 3px;
  
}
</style>
