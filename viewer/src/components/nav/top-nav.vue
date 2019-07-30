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
  > img {
    height: 25px;
    padding: 10px;
    opacity: 0.4;
    &:hover {
      opacity: 0.6;
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
  font-size: 14px;
  text-decoration: none;
  padding: 5px;
  color: #444;
  border-radius: 2px;
  background: #eee;
  margin: 3px;
  &:hover {
    background: #ddd;
  }
}

.current {
  font-weight: bold;
}
</style>
