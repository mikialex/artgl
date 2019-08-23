<template>
  <div class="edit-scene-node">
    <Vector3View v-model="node.transform.position" />
    <Vector3View v-model="node.transform.scale" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Vector3 } from "../../../../src/math";
import { SceneNode } from "../../../../src/artgl";
import Vector3View from "../../components/conf/vector3.vue";
@Component({
  components:{
    Vector3View
  }
})
export default class SceneNodeEditor extends Vue {
  @Prop({
    required: true
  })
  node?: SceneNode;

}
</script>
