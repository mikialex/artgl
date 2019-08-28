<template>
  <div id="app">
    <TopNav v-if="showTopNav"/>
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
  $route: any;

get showTopNav(){
  return this.$route.name !=='home'
}
}
</script>


<style lang="scss">
#app {
  font-family: 'Lexend Deca', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: hidden;
}

button, a {
  font-family: 'Lexend Deca', 'Avenir', Helvetica, Arial, sans-serif;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #fff; 
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(136, 136, 136, 0.1); 
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgba(136, 136, 136, 0.2); 
}

body{
  margin: 0px;
  overflow: hidden;
}

</style>
