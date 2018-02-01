import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Disk = resolve =>  require(['@/files/index'], resolve)
const Person = resolve =>  require(['@/files/person/model'], resolve)
const Group = resolve =>  require(['@/files/group/model'], resolve)
const Share = resolve =>  require(['@/files/share/model'], resolve)

export default new Router({
  routes: [
    {
      path: '/disk',
      component: Disk,
      name: 'disk',
      children: [
        {path: 'home', component: Person, name: 'home', children: [
          {path: '*', component: Person, name: 'homeChild'},
        ]},
        {path: 'video', component: Person, name: 'video'},
        {path: 'music', component: Person, name: 'music'},
        {path: 'doc', component: Person, name: 'doc'},
        {path: 'pic', component: Person, name: 'pic'},
        {path: 'group', component: Group, name: 'group'},
        {path: 'share', name: 'share', component: Share, children: [
          {path: 'send', component: Share, name: 'send'},
          {path: 'reception', component: Share, name: 'reception'},
        ]},
      ]
    },
    {
      path: '/',
      redirect: { name: 'home' }
    },
    {
      path: '/disk/share',
      redirect: { path: '/disk/share/send' }
    }
  ]
})
