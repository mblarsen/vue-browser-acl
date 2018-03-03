<template>
  <div class="user-state">
    <!-- <h3>User: {{user.name}} ({{user.role}})</h3> -->
    <input v-model="name" placeholder="Author name"/>
    <select name="role" id="role">
      <option value="guest">guest</option>
      <option value="regular">regular</option>
      <option value="moderator">moderator</option>
    </select>
    <button @click="login({creds: {name, role}})">Log in</button>
    <!-- <button v-if="user.role !== 'guest'" @click="login({name, role})">Log logout</button> --->
  </div>
</template>
<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'user-state',
  data() {
    return {
      name: '',
      role: 'guest',
    }
  },
  computed: {
    ...mapGetters(['user', 'authenticating'])
  },
  methods: {
    ...mapActions(['login', 'logout'])
  },
}
</script>
