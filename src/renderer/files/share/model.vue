<template>
  <div class="page-space">
   <div class="action">
   </div>

    <div class="crumb">
      {{i18n[$route.name]}}
    </div>

    <ul>
      <li v-for="f in files" @click="select_file(f)">
        {{f.filename}}
      </li>
    </ul>
  </div>
</template>

<script>
  import { sendList, receiveList } from './request'

  export default {
    data() {
      return ({
        files: [],
        file_selected: '',
        pagination: {
          currentPage: 1,
          pageSize: 20,
          total: 20
        },
      })
    },
    methods: {
      select_file(f) {
        this.file_selected = f
      },
      _list(params) {
        if (this.$route.name == 'send') {
          return sendList(params)
        } else {
          return receiveList(params)
        }
      },
      getList() {
        let params = {
          index: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
        }
        this._list(params).then(data => {
          try{
            this.files = data.result.subinfos
            this.pagination.total = parseInt(data.total, 10)
          }catch(e) { console.log(e) }
        })
      }
    },
    created() {
      console.log(this.$route.path)
      this.getList()
    },
    watch: {
      '$route' (to, from) {
        this.getList()
      }
    }
  }
</script>

<style>

</style>