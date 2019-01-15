<template>
  <div class="node-view">
    <div  @click="isExpand = !isExpand">
      {{view.type}} - {{clampId}}
    </div>
    <div class="children" v-if="isExpand">
      <scene-node-view  
        v-for="child in view.children" 
        :key="child.uuid"
       :view="child"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SceneNodeView } from '../../model/scene-view';
@Component({
  name:'scene-node-view'
})
export default class BooleanEditor extends Vue {
  @Prop() view: SceneNodeView;
  get clampId(){
    return this.view.uuid.slice(0, 6);
  }
  isExpand:boolean = true;
}

</script>

<style lang="scss" scoped>
.node-view{
  font-size: 13px;
}

.children{
  padding-left: 15px;
}
</style>
