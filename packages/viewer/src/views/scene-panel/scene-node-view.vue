<template>
  <div class="node-view">
    <div class="node-title">
      <div :class="{'expandable': hasChildren}" @click="isExpand = !isExpand">
        <span v-if="hasChildren && !isExpand">+</span>
        <span v-if="hasChildren && isExpand">=</span>
        {{node.constructor.name}} - {{clampId}}
      </div>
      <!-- I dont know why need this TODO -->
      <span class="icon">
        <span class="icon-item">
          <font-awesome-icon icon="cog" @click="showEdit = !showEdit" />
        </span>
        <span class="icon-item">
          <font-awesome-icon icon="caret-square-down" @click="showMenu = true" />
        </span>
      </span>
    </div>

    <div class="menu" v-if="showMenu">
      <div @click="deleteNode" v-if="!isRoot">delete</div>
      <div @click="loadObj">load obj</div>
    </div>
    <div class="mask" v-if="showMenu" @click="showMenu = false"></div>

    <SceneNodeEditor v-if="showEdit" :node="node" />

    <div class="children" v-if="isExpand">
      <scene-node-view v-for="child in node.children" :key="child.uuid" :node="child" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { loadStringFromFile } from "artgl";
import SceneNodeEditor from "./scene-node-editor.vue";
import {
  OBJLoader,
  Mesh,
  Shading,
  SceneNode,
  NormalShading
} from "artgl";
@Component({
  name: "scene-node-view",
  components: {
    SceneNodeEditor
  }
})
export default class BooleanEditor extends Vue {
  @Prop({
    required: true
  })
  node?: SceneNode;

  showMenu = false;
  showEdit = false;

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
    this.node!.addChild(new SceneNode().with(mesh));
    this.showMenu = false;
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
  width: 300px;
}

.node-title {
  display: flex;
  align-items: center;
  height: 30px;

  &:hover {
    > .icon {
      color: #888;
      opacity: 1;
    }
    background: #eee;
  }

  > .icon {
    opacity: 0;
    margin: 8px;
    font-size: 16px;
  }
}

.icon-item {
  cursor: pointer;
  &:hover {
    color: rgb(53, 149, 238);
  }
  &:active {
    color: rgb(13, 87, 156);
  }
}

.menu {
  position: absolute;
  right: 20px;
  width: 150px;
  background: #fff;
  z-index: 2;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.301);
  > div {
    height: 25px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    padding-left: 10px;
    user-select: none;

    cursor: pointer;
    &:hover {
      background: rgb(80, 162, 218);
      color: #fff;
    }
    &:active {
      background: rgb(52, 105, 139);
      color: #fff;
    }
  }
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
