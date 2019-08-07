<template>
  <div class="select-editor">
    <select v-model="_value">
      <option 
      v-for="item in list"
      :key="item"
      >{{item}}</option>
    </select>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class SelectEditor extends Vue {
  @Prop({ required: true }) value: number;
  @Prop({ required: true }) list: string[];

  get _value() {
    return this.value;
  }

  set _value(value) {
    this.$emit("input", value);
  }
}
</script>

<style lang="scss" scoped>
.select-editor {
  width: 130px;
  > select {
    width: 130px;
  }
}
</style>
