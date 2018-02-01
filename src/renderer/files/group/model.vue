<template>
  <div class="page-space">
   <div class="action">
     <button type="button" style="position: relative;" class="el-button el-button--primary el-button--small">
       <i class="glyphicon glyphicon-upload"></i>
       <span>分片上传</span>
       <input type="file" name="fileNav" multiple
              style="opacity: 0;filter: Alpha(opacity=0);width: 100px;height: 40px;position: absolute;top: 0;left: 0;"
              @change='multipartUpload' id="multipartFile" value=""/>
     </button>
     <el-button size="small" @click="download">下载</el-button>
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
  import { getList, multipartUpload, download } from './request'

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
      multipartUpload() {
        try {

        } catch (e) { console.log(e) }
        let multipartFile = document.getElementById('multipartFile').files[0]
        multipartUpload(multipartFile, this)
      },
      select_file(f) {
        this.file_selected = f
      },
      download() {
        download(this.file_selected)
      },
      getList() {
        let params = {
          groupId: 'g_805',
          index: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          path: '/',
          type: 0
        }
        getList(params).then(data => {
          try{
            this.files = data.result.subinfos
            this.pagination.total = parseInt(data.result.total, 10)
          }catch(e) { console.log(e) }
        })
      }
    },
    created() {
      this.getList()
    },
  }
</script>

<style>

</style>