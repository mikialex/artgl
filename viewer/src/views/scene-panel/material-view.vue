<template>
  <div class="material-view">
    <div v-if="appMaterials.length===0">no material found</div>
    <MaterialPanel 
    v-for="material in appMaterials" 
    :key="material.uuid" 
    :material="material" 
    @deleteSelf="deleteMaterial(material)"
    />
    <button @click="newMaterial">add new material</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Scene, Material } from "../../../../src/artgl";
import MaterialPanel from "./material.vue";
import { Application } from "../../application";

@Component({
  components: {
    MaterialPanel
  }
})
export default class MaterialViewPanel extends Vue {
  @Prop() scene!: Scene;

  $viewer!: Application;

  expandDetail = true;
  appMaterials: Material[] = [];

  mounted() {
    this.appMaterials = this.$viewer.materials;
  }

  get materialList() {
    // const materialSet = new Set();
    // this.scene._materials.forEach(mat => {
    //   materialSet.add(mat);
    // });
    // this.$viewer.materials.forEach(mat =>{
    //   materialSet
    // })
    // return Array.from(materialSet);
    return this.$viewer.materials;
  }

  newMaterial() {
    this.$viewer.materials.push(new Material());
    console.log(this.$viewer);
    console.log(this.$viewer.materials);
  }

  deleteMaterial(material: Material) {
    this.appMaterials = this.appMaterials.filter(mat => mat !== material);
  }
}
</script>

<style scoped lang="scss">
</style>
