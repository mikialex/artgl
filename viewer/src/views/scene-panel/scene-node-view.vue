<template>
  <div class="node-view">
    <div class="title">
      <div :class="{'expandable': hasChildren}" @click="isExpand = !isExpand">
        <span v-if="hasChildren && !isExpand">+</span>
        <span v-if="hasChildren && isExpand">=</span>
        {{node.constructor.name}} - {{clampId}}
      </div>
      <!-- <button @click="showMenu = true">*</button> -->

      <font-awesome-icon class="down" icon="caret-square-down" @click="showMenu = true" />
    </div>
    <div class="menu" v-if="showMenu">
      <!-- <button>edit</button> -->
      <button @click="deleteNode" v-if="isRoot">delete</button>
      <button @click="loadObj">load obj</button>
    </div>
    <div class="mask" v-if="showMenu" @click="showMenu = false"></div>
    <div class="children" v-if="isExpand">
      <scene-node-view v-for="child in node.children" :key="child.uuid" :node="child" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { loadStringFromFile } from "../../../../src/util/file-io";
import {
  OBJLoader,
  Mesh,
  Shading,
  SceneNode,
  NormalShading
} from "../../../../src/artgl";
@Component({
  name: "scene-node-view"
})
export default class BooleanEditor extends Vue {
  @Prop({
    required: true
  })
  node?: SceneNode;

  showMenu = false;

  get clampId() {
    return this.node!.uuid.slice(0, 6);
  }
  isExpand: boolean = true;

  get hasChildren() {
    return this.node!.children.length;
  }

  async loadObj() {
    const objLoader = new OBJLoader();
    const objStr = await loadStringFromFile();
    if (!objStr && objStr.length === 0) {
      return;
    }
    const geo = objLoader.parse(objStr);
    const mesh = new Mesh();
    mesh.geometry = geo;
    mesh.shading = new Shading().decorate(new NormalShading());
    this.node!.addChild(mesh);
  }

  get isRoot() {
    return this.node!.parent === null;
  }

  deleteNode() {
    this.node!.parent!.removeChild(this.node!);
  }
}
</script>

<style lang="scss" scoped>
.node-view {
  font-size: 13px;
  position: relative;
  border-top: 1px solid rgb(234, 234, 234);
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;

  &:hover {
    > .down {
      margin-right: 8px;
      font-size: 16px;
      opacity: 1;
    }
    background: #eee;
  }

  > .down {
    opacity: 0;
    margin-right: 8px;
    font-size: 16px;
    cursor: pointer;
    &:hover {
      color: rgb(53, 149, 238);
    }
    &:active {
      color: rgb(13, 87, 156);
    }
  }
}

.menu {
  position: absolute;
  right: 0px;
  width: 150px;
  height: 50px;
  background: #fff;
  z-index: 2;
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.096);
}

.mask {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.expandable {
  cursor: pointer;
  &:hover {
    color: #36a0e3;
  }
}

.children {
  padding-left: 15px;
}
</style>
