<template id="">
  <div :class="[$style.post, ...(isYou ? [$style['post--yours']] : [])]">
    <h3 :class="$style.title">{{ post.title }} #{{ post.id }}</h3>
    <div>by {{ post.user }}{{ isYouStr }}</div>
    <p>{{ post.body }}</p>
    <p v-if="seeMore">
      <router-link :to="{ name: 'post', params: { id: post.id } }"
        >see more (route=edit)</router-link
      >
    </p>
    <div>
      <button v-can:edit="post" @click="$emit('edit', post)">
        edit (noop)
      </button>
      <button v-can:delete="post" @click="$emit('delete', post)">delete</button>
    </div>
    <code :class="$style.code">
      {{ JSON.stringify(post) }}
    </code>
  </div>
</template>
<script charset="utf-8">
export default {
  props: {
    post: { type: Object },
    seeMore: { type: Boolean, required: false, default: true },
  },
  computed: {
    isYou() {
      return this.$store.getters['user/user'].name === this.post.user
    },
    isYouStr() {
      return this.isYou ? ' (you)' : ''
    },
  },
}
</script>
<style module lang="css">
.post {
  padding: 1rem;
  border-bottom: 1px solid black;
}
.post--yours {
  background-color: lightpink;
}
.title {
  margin-bottom: 0.25rem;
}
.code {
  color: grey;
  font-size: 90%;
}
</style>
