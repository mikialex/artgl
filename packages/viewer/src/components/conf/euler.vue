<template>
  <div class="euler-editor">
    <span>{{config.xName}}:</span>
    <input type="number" v-model="x" />
    <span>{{config.yName}}:</span>
    <input type="number" v-model="y" />
    <span>{{config.zName}}:</span>
    <input type="number" v-model="z" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Euler } from "artgl";
@Component
export default class EulerEditor extends Vue {
  @Prop({ required: true }) value!: Euler;
  @Prop({
    default: () => {
      return {
        xName: "x",
        yName: "y",
        zName: "z"
      };
    }
  })
  config!: any;

  get x() {
    return this.value.x;
  }

  set x(v: number) {
    this.value.x = v;
    // this.$emit("input", this.value);
    // not do this because transform only has getter
    // force change props is ok
  }

  get y() {
    return this.value.y;
  }

  set y(v: number) {
    this.value.y = v;
    // this.$emit("input", this.value);
  }

  get z() {
    return this.value.z;
  }

  set z(v: number) {
    this.value.z = v;
    // this.$emit("input", this.value);
  }
}
</script>

<style lang="scss" scoped>
.euler-editor {
  > input {
    width: 50px;
  }

  > span {
    margin: 3px;
    margin-left: 6px;
  }
}
</style>