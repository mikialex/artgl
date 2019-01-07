<template>
  <div class="top-nav">
    <router-link to="/">Viewer</router-link> |
    <router-link to="/about">About</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TopNav extends Vue {
}
</script>

<style lang="scss" scoped>
.top-nav{
  width: 100vw;
  height: 40px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  
}

a{
  text-decoration: none;
  padding: 5px;
}
</style>
