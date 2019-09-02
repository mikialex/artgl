<template>
  <div class="home-page">
    <div class="first-screen">
      <!-- <div class="nav">
        <a href="">source</a>
      </div> -->
      <h1>ARTGL</h1>
      <h2>A state of art Web 3D framework</h2>
    </div>
    <div class="part-entry">
      <div class="part" @click="goto('viewer')">
        <a class="part-title" >Scene Viewer</a>
      </div>
      <div class="part" @click="goto('shader-editor')">
        <a class="part-title" >Shader Composer</a>`
      </div>
      <div class="part" @click="goto('examples')">
        <a class="part-title" >Simple Examples</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ConfigPanel extends Vue {
  $store: any;
  $router: any;

  goto(name: string) {
    this.$router.push({
      name: name,
      params: {
        name
      }
    });
  }

}
</script>

<style lang="scss" scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.first-screen {
  min-width: 100vw;
  min-height: 100vh;
  background: #eee;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 120px;
  margin-bottom: 10px;
  position: relative;
  top: -50px;
}

h2 {
  font-size: 30px;
  position: relative;
  top: -50px;
}

img {
  width: 400px;
  // opacity: 0.3;
}

.part-entry {
  display: flex;
  justify-content: space-around;
  width: 900px;
  position: relative;
  top: -100px;
  .part {
    width: 250px;
    height: 400px;
    background: #fff;
    position: relative;
    transition: 200ms;
    cursor: pointer;
    &:hover{
      transform: translateY(-30px);
    }

    &:active{
      transform: scale(1.1);
    }
  }
}

.part-title {
  position: relative;
  top: -30px;

  font-size: 20px;
  text-decoration: none;
  padding: 5px;
  color: rgb(61, 61, 61);
  font-weight: bold;
  transition: 200ms;
}

</style>
