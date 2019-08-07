<template>
  <div>
    <input 
    type="range" 
    :max="config.max"
    :min="config.min"
    :step="config.step"
    v-model="_value">
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component
export default class NumberSliderEditor extends Vue {

  @Prop({ required: true }) value: number;
  @Prop({ required: true }) config: number;

  get _value(){
    return this.value;
  }

  set _value(value){
    this.$emit('input', value - 0);
  }


  
}


</script>
