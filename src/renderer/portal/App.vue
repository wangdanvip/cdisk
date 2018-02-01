<template>
  <div>
    <nav-bar></nav-bar>
    <transition>
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import NavBar from '@/components/NavBar'

  export default {
    components: {
      NavBar,
    },
  }
</script>

<style>
  .page-space > * {
    margin: 0 10px 10px 0;
  }
</style>