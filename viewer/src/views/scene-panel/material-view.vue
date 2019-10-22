<template>
  <div class="material-view">
    <div v-if="appMaterials.length===0" class="no-item-hint">no material found</div>
    <MaterialPanel
      v-for="material in appMaterials"
      :key="material.uuid"
      :material="material"
      @deleteSelf="deleteMaterial(material)"
    />
    <button @click="newMaterial" class="create-new">create a new material</button>
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
    this.appMaterials.splice(this.appMaterials.indexOf(material), 1);
  }
}
</script>

<style scoped lang="scss">
.material-view{
  padding: 5px;
  background: #eee;
  height: 100%;
}

.no-item-hint{
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #aaa;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  margin-bottom: 5px;
}

.create-new{
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border: 1px solid #eee;
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  background: #fefefe;

}
</style>
