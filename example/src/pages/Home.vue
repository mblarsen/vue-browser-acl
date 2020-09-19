<template>
  <div>
    <section v-role:admin>
      <h2>Admin commands</h2>
      <p>
        Here would be some admin commands. Note: `vue-browser-acl` is only a
        plugin for helping you write ACL based logic in a more expressive way.
        It isn't a replacement for other security meassures.
      </p>
    </section>
    <section>
      <h2>Blog</h2>
    </section>
    <div v-can:create="'Post'">
      <div>
        <input type="text" v-model="postTitle" placeholder="Title" />
      </div>
      <div>
        <textarea v-model="postBody"></textarea>
      </div>
      <div>
        <button @click.prevent="publish">Publish</button>
      </div>
    </div>
    <div>
      <PostView
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @delete="deletePost"
      />
      <div v-if="posts.length === 0">
        No posts
      </div>
      <div v-if="busy">Busy...</div>
      <div v-if="error">Error: {{ error }}</div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import PostView from '../components/Post.vue'

export default {
  components: {
    PostView,
  },
  data() {
    return {
      post: null,
      postTitle: '',
      postBody: '',
      postsPage: 1,
    }
  },
  computed: {
    ...mapGetters('post', ['posts', 'error', 'busy']),
    ...mapGetters('user', ['user']),
  },
  created() {
    this.fetchPosts()
  },
  methods: {
    ...mapActions('post', {
      fetchPosts: 'fetch',
      deletePost: 'delete',
    }),
    publish() {
      this.$store.dispatch('post/create', {
        title: this.postTitle,
        body: this.postBody,
        user: this.user.name,
      })
    },
  },
}
</script>
