<template>
  <div id="app">
    <navi></navi>
    <router-view/>
  </div>
</template>

<script>
import navi from './components/navi/navi'

export default {
  name: 'app',
  components: {
    navi
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
