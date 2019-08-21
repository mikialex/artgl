<template>
  <div class="top-nav">
    <img src="../../assets/art.svg" @click="gotoHome" alt />
    <div class="current-project">
      <router-link active-class="current" to="/viewer">Viewer</router-link>
      <router-link active-class="current" to="/shader">Composer</router-link>
      <router-link active-class="current" to="/examples">Examples</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TopNav extends Vue {
  $router: any;
  gotoHome() {
    this.$router.push({
      name: "home"
    });
  }
}
</script>

<style lang="scss" scoped>
.top-nav {
  width: 100vw;
  height: 40px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.4);
  background: #44444a;
  > img {
    height: 25px;
    padding: 10px;
    opacity: 0.5;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
    &:active {
      opacity: 1;
    }
  }
}

.current-project {
  display: flex;
  align-items: center;
  width: calc(100vw - 200px);
}

h3 {
  padding: 5px;
}

a {
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 14px;
  text-decoration: none;
  padding-left: 10px;
  padding-right: 10px;

  color: rgb(235, 235, 235);
  margin: 3px;
  &:hover {
    background: #333;
  }
  &:active {
    background: #222;
  }
}

.current {
  color: #fff;
  background: #333;
  font-weight: bold;
}
</style>
