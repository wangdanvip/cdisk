<template>
  <div v-show="view == 'list'" class="left-menu">
    <ul>
      <li v-for="(m1, i1) in menu" :key="i1" :index="i1.toString()"  :class="{'menu_active':active(m1.state)}">
        <router-link :to="m1.state">{{m1.title}}</router-link>
        <ul class="sub-menu">
          <li v-for="m2 in m1.child" :class="{'menu_active':active(m2.state)}">
            <router-link :to="m2.state">{{m2.title}}</router-link>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
  import routerConfig from '@/portal/routerConfig'
  import {mapGetters} from 'vuex'

  export default {
    data (){
      return ({
        menu: routerConfig.getMenu('main')
      })
    },
    computed: {
      ...mapGetters([
        'view'
      ]),
    },
    methods: {
      active (m) {
        if (this.$route.name == m.name) {
          return true
        }
        return false
      }
    },
  }
</script>

<style scoped>
  .left-menu {
    width: 240px;
    /*position: absolute;
    top: 60px;
    bottom: 0;*/
    /*background-color: #f3f3f3;*/
    float: left;
    box-sizing: border-box;
    border-right: 1px solid #e9e9e9;
  }
  li {
    cursor: pointer;
  }
  li a {
    display: block;
    height: 25px;
    line-height: 25px;
    text-indent: 32px;
  }
  li.menu_active > a {
    background-color: #ebf7ff;
    color: #3aa2eb;
  }
  .sub-menu li > a {
    text-indent: 64px;
  }
</style>