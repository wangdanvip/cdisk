<template>
  <div>
    <side-bar></side-bar>
    <div class="page-content">
      <transition>
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
  import SideBar from '@/components/SideBar'
  import {getCapacity} from './person/request'

  export default {
    components: {
      SideBar,
    },
    created() {
      /*getCapacity({}).then(data => {
        if (data.errorCode == 200) {
          this.$store.dispatch('render', data.result)
        }
      })*/
    },
  }
</script>

<style>
  .page-content {
    width: calc(100% - 240px);
    /*position: absolute;
    top: 60px;
    left: 240px;
    bottom: 0;*/
    float: left;
    overflow: auto;
    box-sizing: border-box;
    padding: 20px 0 0 20px;
  }
</style>