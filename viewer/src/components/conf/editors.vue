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

    <NumberSliderEditor
    v-else-if="editor.type === 'slider'" 
    v-model="_value" 
    :config="editor"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import NumberSliderEditor from './number-slider.vue';
@Component({
  components:{
    NumberSliderEditor
  }
})
export default class Editors extends Vue {
  currentEditor = 0;

  get isMultiEditor(){
    return this.editorConfig.length !== 1;
  }

  @Prop({ required: true }) editorConfig: any;
  @Prop({ required: true }) value: any;

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
  border-radius: 3px;
  cursor: pointer;
  &:hover{
    background: #eee;
  }
}

.active-editor-nav{
  background: #eee;
  
}
</style>
