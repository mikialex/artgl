<template>
  <div class="home-page">
    <div>
      <img src="../assets/artgl.svg" alt="">
    </div>
    <ul>
      <router-link active-class="current" to="/viewer">Scene Viewer</router-link>
      <router-link active-class="current" to="/shader">Shader Composer</router-link>
      <router-link active-class="current" to="/examples">Simple Examples</router-link>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

img{
  width: 600px;
  opacity: 0.3;
}

ul{
  margin-top:20px;
  >a{
    font-size: 25px;
    text-decoration: none;
    padding: 20px;
    color: rgb(61, 61, 61);
    font-weight: bold;
    transition: 200ms;

    &:hover{
      color: rgb(0, 0, 0);
      background: rgb(243, 243, 243)
    }
  }
}

</style>
