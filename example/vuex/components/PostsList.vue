<template>
  <div class="posts-list">
    <div v-if="isFetching">Fetching posts...</div>
    <ul>
      <li v-for="post in posts">{{post.title}} - {{post.author}}</li>
    </ul>
  </div>
</template>
<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'posts-list',
  computed: {
    ...mapGetters(['isFetching', 'posts'])
  },
  created() {
    setTimeout(() => {
      this.fetchPosts()
    }, 2000)
  },
  methods: {
    ...mapActions(['fetchPosts'])
  }
}
</script>
