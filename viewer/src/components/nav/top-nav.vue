<template>
  <div class="top-nav">
    <h3>ART.GL</h3> 
    <div class="current-project">
      <div>
        demoscene.gltf 
      </div>
      <router-link active-class="current" to="/">Viewer</router-link>
      <router-link to="/about">RenderGraph</router-link>
    </div>
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
  display: flex;
  align-items: center;
}

.current-project{
  display: flex;
  align-items: center;
  border-top: 1px solid #eee;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  width: calc(100vw - 200px);
}

h3{
  padding: 5px;
}

a{
  text-decoration: none;
  padding: 5px;
  color:#444;
  &:hover{
    background: #eee;
  }
}

.current{
  background: #eee;
}
</style>
