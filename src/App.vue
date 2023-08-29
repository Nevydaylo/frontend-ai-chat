<template>
  <div id="app">
    <ChatComponent />
  </div>
</template>

<script>
import ChatComponent from './components/ChatComponent.vue';


export default {
  name: 'App',
  components: {
        ChatComponent
  }
}
</script>

<style>
#app {
  font-family: "Open Sans", sans-serif;
  padding: 0;
  margin: 0;
}
</style>
