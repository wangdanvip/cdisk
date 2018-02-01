<template>
  <el-tabs type="border-card">
    <el-tab-pane :label="i18n.uploading">
      <ul>
        <li v-for="(item, i) in uploadList">
          <span class="ico" :class="'ico-' + getType(item.file)"></span>
          <span>{{item.name}}</span>
          <span style="width: 25%">
        <el-progress :percentage="item.percent" :text-inside="true" :stroke-width="18"></el-progress>
      </span>
          <span>{{item.size}}</span>
          <span @click="uploadControl(item, 'progressing')" class="iconfont caretright"></span>
          <span @click="uploadControl(item, 'paused')" class="iconfont pause"></span>
          <span @click="uploadControl(item, 'cancelled ')" class="iconfont close"></span>
          <span @click="open_folder" class="iconfont folder"></span>
        </li>
      </ul>
    </el-tab-pane>
    <el-tab-pane :label="i18n.downloading">
      <ul>
        <li v-for="(f, i) in downloadList">
          <span>{{f.filename}}</span>
          <span style="width: 25%">
            <el-progress :percentage="f.percent" :text-inside="true" :stroke-width="18"></el-progress>
          </span>
          <span>{{f.filesize}}</span>
          <span @click="send(f, 'resume')" class="iconfont caretright"></span>
          <span @click="send(f, 'pause')" class="iconfont pause"></span>
          <span @click="send(f, 'cancel')" class="iconfont close"></span>
          <span @click="open_folder(f)" class="iconfont folder"></span>
        </li>
      </ul>
    </el-tab-pane>
    <el-tab-pane :label="i18n.transfer_completed">
      <ul>
        <li></li>
      </ul>
    </el-tab-pane>
    <el-tab-pane :label="i18n.push_task">
      <ul>
        <li></li>
      </ul>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import { getFileTypeByFileName } from '@/utils/file'
  const { ipcRenderer, shell } = require('electron')
  import { download } from '@/files/person/request'

  export default {
    data() {
      return ({
      })
    },
    computed: {
      downloadList: function () {
        return this.downloadingList.concat(this.waitingList)
      }
    },
    methods: {
      getType(filename) {
        return getFileTypeByFileName(filename)
      },
      trimPercent(arg) {
        for (let i = 0; i < this.downloadingList.length; i += 1) {
          let file = this.downloadingList[i]

          if (file.filename == arg[0]) {
            file.percent = Math.round(arg[1] * 100 / file.filesize)
            if (file.percent == 100) {
              this.downloadingList.splice(i, 1)
              if (this.waitingList.length > 0) {
                let item = this.waitingList.shift()
                this.downloadingList.push(item)
                download(item)
              }
            }
            console.log(file.percent)
            break
          }
        }
      },
      uploadControl(item, state) {
        item.state = state
      },
      send(f, msg) {
        ipcRenderer.send('item:file', {
          file: f,
          msg: msg
        })
        if (msg == 'cancel') {
          let index = this.downloadList.indexOf(f)
          this.downloadList.splice(index, 1)
        }
      },
      open_folder(f) {
        if (!shell.showItemInFolder('E:/tmp/' + f.filename)) {
          shell.showItemInFolder('E:/tmp/' + f.filename + '.downloading')
        }
      }
    },
    props: ['uploadList', 'downloadingList', 'waitingList'],
    created() {
      ipcRenderer.on('download-reply', (event, ...arg) => {
        this.trimPercent(arg)
      })
    },
  }
</script>

<style scoped="">
  li > span {
    display: inline-block;
  }
</style>
