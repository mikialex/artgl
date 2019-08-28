<template>
  <div class="edit-scene-node">
    <div>position: </div>
    <Vector3View v-model="node.transform.position" />

    <div>rotation: </div>
    <EulerView v-model="node.transform.rotation" />

    <div>scale: </div>
    <Vector3View v-model="node.transform.scale" />

    <div>visible</div>
    <BooleanView v-model="visible"/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Vector3 } from "../../../../src/math";
import { SceneNode } from "../../../../src/artgl";
import Vector3View from "../../components/conf/vector3.vue";
import EulerView from "../../components/conf/euler.vue";
import BooleanView from "../../components/conf/boolean.vue";
@Component({
  components:{
    Vector3View,
    EulerView,
    BooleanView
  }
})
export default class SceneNodeEditor extends Vue {
  @Prop({
    required: true
  })
  node!: SceneNode;

  get visible(){
    return this.node.visible;
  }

  set visible(value: boolean){
    this.node.visible =value;
  }

}
</script>

<style lang="scss" scoped>
  .edit-scene-node{
    background: #eee;
  }
</style>
