<template id="">
  <div>
    <div v-if="post">
      <PostView :post="post" :seeMore="false" />
    </div>
  </div>
</template>
<script charset="utf-8">
import Posts from '../api/Posts.js'
import PostView from '../components/Post.vue'
export default {
  props: {
    id: { type: [String, Number], required: true },
  },
  components: {
    PostView,
  },
  data() {
    return {
      post: null,
    }
  },
  async created() {
    this.post = await Posts.find(this.id)
  },
}
</script>
