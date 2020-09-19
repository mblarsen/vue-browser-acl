<template>
  <div>
    <h1>Admin page</h1>
    <p>
      Here would be some admin commands. Note: `vue-browser-acl` is only a
      plugin for helping you write ACL based logic in a more expressive way. It
      isn't a replacement for other security meassures.
    </p>
    <div>
      <button @click="dooo">do admin stuff</button>
      <button v-can:super.disable @click="superDooo">do advacned admin stuff</button>
    </div>
    <p>
      Advanced admin stuff can only be done if you are `super` {{ superText }}
    </p>
  </div>
</template>
<script>
export default {
  components: {},
  computed: {
    you() {
      return this.$store.getters['user/user']
    },
    superText() {
      return this.you.name === 'super'
        ? ' which you are, great!'
        : ` but you are currently ${this.you.name}.`
    },
  },
  methods: {
    dooo() {
      alert('Done')
    },
    superDooo() {
      alert('Super done')
    }
  }
}
</script>
