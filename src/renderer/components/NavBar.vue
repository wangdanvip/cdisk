<template>
  <div class="top-menu">
    <el-progress :percentage="percent || 0" :stroke-width="12" :show-text="false" style="width:138px;margin:10px auto;"></el-progress>
    <router-link :to="{name: 'home'}">{{'我的网盘' + $route.path}}</router-link>
    <span class="right-menu">
      <span @click="toggle_view">{{i18n.transmission}}</span>
      <a href="#" ng-click="" class="el-icon-question"></a>
      <a href="#" ng-click="" class="el-icon-message"></a>
      <a href="#" ng-click="" class="el-icon-document"></a>
      <a href="#" ng-click="" class="el-icon-bell"></a>
    </span>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  export default {
    computed: {
      ...mapGetters([
        'capacity'
      ]),
      percent() {
        let capacity = this.capacity
        return Math.round(capacity.useCapacity / capacity.totalCapacity * 100)
      }
    },
    methods: {
      ...mapActions([
        'toggle_view',
      ]),
    }
  }
</script>

<style>
  .top-menu {
    height: 60px;
    background-color: #2b3c5a;
    /*background-color: #0e8ee7;*/
    color: #fff;
    font-size: 14px;
    line-height: 60px;
  }
  .top-menu > div {
    display: inline-block;
  }
  .right-menu > * {
    float: right;
    padding: 0 10px;
    height: 60px;
    line-height: 60px;
    display: inline-block;
    color: #fff;
  }
  .right-menu a:hover {
    color: #4db3ff;
  }
</style>