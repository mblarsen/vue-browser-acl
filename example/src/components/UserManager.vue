<template id="">
  <div :class="$style.container">
    <div v-if="authenticated">
      Hi, {{ user.name }} ({{ user.type }})
      <button @click.prevent="logMeOut">Log out</button>
    </div>
    <div v-else-if="authenticating">
      Wait...
    </div>
    <div v-else>
      <input
        type="text"
        name="username"
        v-model="username"
        placeholder="Username"
        required
      />
      <select v-model="userType">
        <option value="group1">Group 1</option>
        <option value="group2">Group 2</option>
        <option value="admin">Admin</option>
      </select>
      <button @click.prevent="authenticate">Log in</button>
    </div>
    <div v-if="error" :class="$style.error">{{ error }}</div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import debug from 'debug'

const log = debug('demo')

export default {
  data() {
    return {
      username: '',
      userType: 'group1',
    }
  },
  computed: {
    ...mapGetters('user', [
      'user',
      'error',
      'authenticating',
      'authenticated',
      'loggingOut',
    ]),
    formUser() {
      return {
        name: this.username,
        type: this.userType,
      }
    },
  },
  methods: {
    ...mapActions('user', ['logout']),
    logMeOut() {
      return this.logout().then(() => {
        this.username = null
      })
    },
    authenticate() {
      if (this.username.trim()) {
        this.$store
          .dispatch('user/authenticate', { ...this.formUser })
          .then(() => {
            const intendedRoute = window.localStorage.getItem('intendedRoute')
            if (intendedRoute) {
              log(`redirecting to intended route: ${intendedRoute}`)
              this.$router.replace({ name: intendedRoute })
              window.localStorage.removeItem('intendedRoute')
            }
          })
      }
    },
  },
}
</script>
<style module lang="css">
.container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  padding: 1rem;
  border: 2px solid grey;
  border-radius: 4px;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
  background-color: white;
  z-index: 50;
}
.error {
  color: red;
}
</style>
