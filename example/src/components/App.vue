<template>
  <div :class="$style.app">
    <navigation />
    <main :class="$style.wrapper">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navigation from './Nav.vue'
export default {
  components: {
    Navigation,
  },
}
</script>

<style module lang="css">
.app {
	position: relative;
}

.wrapper {
	width: 75%;
	margin: 0 auto;
	position: relative;
	min-height: calc(55vh - 16px);
	z-index: 1;
}

@media screen and (max-width: 769px) {
	.wrapper {
		width: 90%;
	}
}
</style>
