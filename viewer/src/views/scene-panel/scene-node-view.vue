<template>
  <div class="node-view">
    <div class="title">
      <div @click="isExpand = !isExpand" :class="{'expandable': hasChildren}">
        <span v-if="hasChildren && !isExpand"> + </span>
        {{view.type}} - {{clampId}}
      </div>
      <button @click="showMenu = true">*</button>
    </div>
    <div class="menu" v-if="showMenu">
      <!-- <button>edit</button> -->
      <button @click="emitdelete(view.uuid)">delete</button>
      <!-- <button>load obj here</button> -->
    </div>
    <div class="mask" v-if="showMenu" @click="showMenu = false"></div>
    <div class="children" v-if="isExpand">
      <scene-node-view  
        v-for="child in view.children" 
        :key="child.uuid"
        @deleteNode="emitdelete"
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

  showMenu = false;

  get clampId(){
    return this.view.uuid.slice(0, 6);
  }
  isExpand:boolean = true;

  get hasChildren(){
    return this.view.children.length;
  }

  emitdelete(id){
    this.$emit('deleteNode', id);
    this.showMenu = false;
  }
}

</script>

<style lang="scss" scoped>
.node-view{
  font-size: 13px;
  position: relative;
}

.title{
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.menu{
  position: absolute;
  right:0px;
  width: 150px;
  height: 50px;
  background: #fff;
  z-index: 2;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.096);
}

.mask{
  position:fixed;
  top:0px;
  left:0px;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.expandable{

  &:hover{
    background: #f1f1f1;
  }
}

.children{
  padding-left: 15px;
}
</style>
