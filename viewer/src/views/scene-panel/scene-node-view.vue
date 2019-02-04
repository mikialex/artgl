<template>
  <div class="node-view">
    <div class="title" >
      <div 
      :class="{'expandable': hasChildren}"
      @click="isExpand = !isExpand">
        <span v-if="hasChildren && !isExpand"> + </span>
        <span v-if="hasChildren && isExpand"> = </span>

        {{view.type}} - {{clampId}}
      </div>
      <button @click="showMenu = true">*</button>
    </div>
    <div class="menu" v-if="showMenu">
      <!-- <button>edit</button> -->
      <button @click="emitDelete">delete</button>
      <button @click="emitLoadObj">loadobj</button>
    </div>
    <div class="mask" v-if="showMenu" @click="showMenu = false"></div>
    <div class="children" v-if="isExpand">
      <scene-node-view  
        v-for="child in view.children" 
        :key="child.uuid"
        @nodeChange="emitChange"
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

  emitLoadObj(){
    this.emitChange({
      type: 'load',
      id: this.view.uuid
    })
  }

  emitDelete(){
    this.emitChange({
      type: 'delete',
      id: this.view.uuid
    })
  }

  emitChange(info){
    this.$emit('nodeChange', info);
    this.showMenu = false;
  }
}

</script>

<style lang="scss" scoped>
.node-view{
  font-size: 13px;
  position: relative;
  border-top:1px solid rgb(234, 234, 234);
}

.title{
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
  cursor: pointer;
  &:hover{
    color: #36a0e3;
  }
}

.children{
  padding-left: 15px;
}
</style>
