<template>
  <div class="material-view">
    <div v-if="materiallist.length===0">no material found</div>
    <MaterialPanel v-for="material in materiallist" :key="material.uuid" />
    <button>add new material</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Scene } from "../../../../src/artgl";
import MaterialPanel from "./material.vue";

@Component({
  components: {
    MaterialPanel
  }
})
export default class MaterialViewPanel extends Vue {
  @Prop() scene!: Scene;

  expandDetail = true;

  get materiallist() {
    const list: any = [];
    this.scene._materials.forEach(mat => {
      list.push(mat);
    });
    return list;
  }
}
</script>

<style scoped lang="scss">
</style>
