import Vue from 'vue'
import axios from 'axios'
import langJson from '@/i18n/lang.json'
import routerConfig from '@/portal/routerConfig'
import $ from 'jquery'
import { Message } from 'element-ui'

let lang = window.localStorage.getItem('lang') ? window.localStorage.getItem('lang') : 'zh-cn'
let i18n = Vue.prototype.i18n = routerConfig.i18n = langJson[lang]

axios.interceptors.request.use((config) => {
  if (config.data && !config.url.includes('file/down') && !config.url.includes('listdir')) {
    config.data.token = "5b7b593d-232d-40f0-b16d-7e78da62a0c8"
  }
  return config
}, (error) => Promise.reject(error))
axios.interceptors.response.use((res) => {
  let map = {
    605: i18n.existed,
    804: i18n.existed,
  }
  if(res.data.errorCode != "200"){
    Message(map[res.data.errorCode])
  }
  return res.data
}, (error) => Promise.reject(error))

Vue.directive('focus', function (el, bindings) {
  if (bindings.value) {
    $(el).find('input').focus()
  }
})
Vue.prototype.msg = function (type, msg) {
  let map = {
    'warning': i18n.warning,
    'success': i18n.success
  }
  this.$notify({
    title: map[type],
    message: msg,
    offset: 100,
    type: type
  })
}

Vue.prototype.confirm = function (type, msg, func) {
  let map = {
    'warning': i18n.warning,
  }
  this.$confirm(msg, map[type], {
    confirmButtonText: i18n.OK,
    cancelButtonText: i18n.cancel,
    type: type
  }).then(() => {
    func && func()
  }).catch(() => {
  })
}
