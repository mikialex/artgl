<template>
  <div>
    <input type="checkbox" v-model="_value" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class BooleanEditor extends Vue {
  @Prop({ required: true }) value: number;

  get _value() {
    return this.value;
  }

  set _value(value) {
    this.$emit("input", value);
  }
}
</script>
