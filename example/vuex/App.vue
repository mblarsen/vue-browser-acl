<template>
  <div class="app">
    <user-state/>
    <posts-list/>
  </div>
</template>
<script>
import UserState from './components/UserState'
import PostsList from './components/PostsList'

export default {
  name: 'acl-demo-app',
  components: {
    UserState,
    PostsList,
  },
}
</script>
<style lang="css">
html, body {
  height: 100vh;
  margin: 0;
}

.app {
  height: 100%;
  display: flex;
}
.user-state {
  flex: 1;
  background-color: skyblue;
  padding: 1rem;
}
.posts-list {
  flex: 3;
  background-color: steelblue;
  padding: 1rem;
}
</style>
