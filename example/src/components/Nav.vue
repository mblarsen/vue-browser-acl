<template>
  <nav :class="$style.nav">
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li>
        <router-link :to="{ name: 'admin' }"
          >Admin protected through route</router-link
        >
      </li>
      <li v-role:admin>
        <router-link :to="{ name: 'admin' }"
          >Admin (only shown to admins)</router-link
        >
      </li>
    </ul>
    <user-manager />
  </nav>
</template>

<script>
import UserManager from './UserManager.vue'
export default {
  components: {
    UserManager,
  },
}
</script>
<style module lang="css">
.nav {
  z-index: 50;
}
</style>
