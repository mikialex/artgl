<template>
  <div id="app">
    <TopNav/>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TopNav from './components/nav/top-nav.vue';

@Component({
  components: {
    TopNav,
  },
})
export default class ViewerApp extends Vue {

}
</script>


<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: hidden;
}

body{
  margin: 0px;
  overflow: hidden;
}

</style>
