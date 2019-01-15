<template>
  <div>
    <input type="number" v-model="_value">
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component
export default class NumberEditor extends Vue {

  @Prop() value: number;

  get _value(){
    return this.value;
  }

  set _value(value){
    this.$emit('input', value - 0);
  }


  
}


</script>
