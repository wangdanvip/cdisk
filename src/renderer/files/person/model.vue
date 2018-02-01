<template>
  <div class="page-space">
    <div v-show="view == 'list'">
      <div class="action">
        <!--<button type="button" style="position: relative;" class="el-button el-button&#45;&#45;primary el-button&#45;&#45;small">
          <span>分片上传</span>
          <input type="file" name="fileNav" multiple
                 style="opacity: 0;filter: Alpha(opacity=0);width: 100px;height: 40px;position: absolute;top: 0;left: 0;"
                 @change='multipartUpload' id="multipartFile" value=""/>
        </button>-->
        <ul class="actionList">
          <li style="position: relative;">
            <span>{{i18n.upload}}</span>
            <input type="file" name="fileNav" multiple
                   style="opacity: 0;filter: Alpha(opacity=0);width: 100px;height: 40px;position: absolute;top: 0;left: 0;"
                   @change='multipartUpload' id="multipartFile" value=""/>
          </li>
          <li>
            <span @click="newFolder">{{i18n.new + i18n.folder}}</span>
          </li>
          <li>
            <span @click="download()">{{i18n.download}}</span>
          </li>
          <li>
            <span @click="del">{{i18n.del}}</span>
          </li>
          <li>
            <span @click="renameMode">{{i18n.rename}}</span>
          </li>
          <li>
            <span>{{i18n.copy}}</span>
          </li>
          <li>
            <span @click="showDialog">{{i18n.move}}</span>
          </li>
          <li>
            <span @click="shareDialog = true">{{i18n.share}}</span>
          </li>
        </ul>
      </div>

      <div class="toolBar">
        <div class="crumb">
          <el-breadcrumb separator-class="el-icon-caret-right">
            <el-breadcrumb-item :to="{ path: '/disk/home' }">所有文件</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(p, i) in crumbs" :to="{path: calPath(i)}" key="i">{{p}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-input @keyup.enter.native="search" :placeholder="i18n.search_msg" v-model="keyword" class="searchBox" size="small">
          <i @click="search" slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>

      <ul @contextmenu.stop="showContext()" style="min-height: 350px;">
        <li v-for="f in files" @click="select_file(f, $event)" @dblclick="preview(f)" @contextmenu.stop="showContext(f)" :class="{'active': active(f)}"
            class="file-item text-over">
          <div class="ico" :class="f.filetype=='2' ? 'ico-folder' :'ico-' + getType(f.filename)"></div>
          <router-link :to="f.filetype=='2' ? (f.fileid || '') : ''" v-show="!f.newFolder && !f.renaming" append>{{f.filename}}</router-link>
          <el-input @blur="handleBlur($event, f)" v-focus="f.newFolder" v-show="f.newFolder || f.renaming" :value="f.filename" size="mini"></el-input>
        </li>
      </ul>
    </div>
    <transmission :uploadList="uploadList" :downloadingList="downloadingList" :waitingList="waitingList" v-show="view == 'transmission'"></transmission>
    <el-dialog title="viewTitle" :visible.sync="showView">
      <!--<html-panel :url.asyc="viewUrl"></html-panel>-->
      <iframe :src="viewUrl"></iframe>
    </el-dialog>
    <img-preview :url="picUrl" v-model="show_preview"></img-preview>
    <el-dialog  :visible.sync="showMoveCopy" :title="i18n.choose_path">
      <el-tree
          ref="tree"
          :props="treeProps"
          :load="loadNode"
          :render-content="renderContent"
          node-key="fileid"
          :default-expanded-keys="['']"
          lazy
          :check-strictly="true"
          highlight-current>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="move">{{i18n.OK}}</el-button>
        <el-button size="small" @click="closeDialog">{{i18n.cancel}}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="shareDialog" :title="i18n.share + i18n.file">
      <el-tabs type="card">
        <el-tab-pane :label="i18n.link + i18n.share">
          <el-form :model="form" label-width="120px">
            <el-form-item :label="i18n.validity + i18n.colon">
              <el-radio-group v-model="form.validity">
                <el-radio :label="0">{{i18n.unLimit}}</el-radio>
                <el-radio :label="1">
                  <span v-if="form.validity == 0">{{i18n.customize}}</span>
                  <template v-else>
                    <el-input v-model="form.customizeValidity" :maxlength="4" size="mini" autofocus style="width:50px"></el-input>
                    {{i18n.day}}
                  </template>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="i18n.download + i18n.times + i18n.colon">
              <el-radio-group v-model="form.times">
                <el-radio :label="0">{{i18n.unLimit}}</el-radio>
                <el-radio :label="1">
                  <span v-if="form.times == 0">{{i18n.customize}}</span>
                  <template v-else>
                    <el-input v-model="form.customizeTimes" :maxlength="4" size="mini" autofocus style="width:50px"></el-input>
                    {{i18n.limitTime}}
                  </template>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="i18n.contacts + i18n.share"></el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
  import { getList, multipartUpload, download, viewLink, getPreviewUrl, rename, addFile, delFile, getCapacity, bpcList, search, move } from './request'
  import { getFileTypeByFileName, clear } from '@/utils/file'
  import Transmission from '@/components/Transmission'
  import { mapGetters } from 'vuex'
  import HtmlPanel from '@/components/HtmlPanel'
  import ImgPreview from '@/components/imgPreview'
  import axios from 'axios'
  const { ipcRenderer, shell, remote } = require('electron')
  const { Menu, MenuItem } = remote
  const fs = require('fs')

  export default {
    data() {
      return ({
        files: [],
        file_selected: [],
        file_copyed: [],
        pagination: {
          currentPage: 1,
          pageSize: 20,
          total: 20
        },
        uploadList: [],
        downloadList: [],
        downloadingList: [],
        waitingList: [],
        viewUrl: '',
        viewTitle: '',
        showView: false,
        picUrl: 'static/img/loading_img.gif',
        show_preview: false,
        fullPath: '',
        parentPath: '/',
        keyword: '',
        showMoveCopy: false,
        treeData: [],
        treeProps: {
          children: 'children',
          label: 'filename',
          isLeaf: 'isLeaf'
        },
        menu: null,
        blankMenu: null,
        shareDialog: false,
        form: {
          validity: 0,
          customizeValidity: '',
          times: 0,
          customizeTimes: '',
        }
      })
    },
    computed: {
      ...mapGetters([
        'view'
      ]),
      crumbs() {
        //let ids = this.$route.params[0].split('/')
        let paths = this.fullPath.slice(1).split('/')
        return paths
        /*return paths.map((path, index) => {
          return {
            path: path,
            id: ids[index]
          }
        })*/
      },
    },
    methods: {
      calPath(i) {
        if (!this.$route.params[0]) {
          return '/'
        } else {
          let origin = this.$route.params[0].split('/')
          let newLink = origin.slice(0, i + 1)
          return '/disk/home/' + newLink.join('/')
        }
      },
      multipartUpload() {
        try {
          this.uploadList = []
          let fileList = document.getElementById('multipartFile').files
          if (fileList.length == 0) return
          for (let i = 0; i < fileList.length; i += 1) {
            let item = fileList[i]
            this.uploadList.push({
              file: fileList[i],
              percent: 0,
              name: item.name,
              size: item.size,
              path: item.path,
              state: 'progressing',
              parentPath: this.parentPath
            })
          }
          clear(document.getElementById('multipartFile'))
          //console.log(files)
          multipartUpload(this.uploadList, 0).then(data => {
            this.getList()
            return getCapacity({})
          }).then(data => {
            this.$store.dispatch('render', data.result)
          })
        } catch (e) {
          console.log(e)
        }
      },
      select_file(f, event) {
        if (!event.ctrlKey) {
          this.file_selected = []
          this.file_selected.push(f)
        } else {
          let index = this.file_selected.indexOf(f)
          if (index != -1) {
            this.file_selected.splice(index, 1)
          } else {
            this.file_selected.push(f)
          }
        }
      },
      preview(f) {
        let ext = f.filename.substring(f.filename.lastIndexOf('.') + 1)

        if (ext == 'doc' || ext == 'docx' || ext == 'ppt' || ext == 'pptx' || ext == 'xls' || ext == 'xlsx' || ext == 'pdf' || ext == 'txt') {
          /*let params = {
            md5 : f.md5,
            fileName : f.filename,
            fileSize : f.filesize,
          }
          viewLink(params).then(data => {
            this.viewTitle = f.filename
            this.viewUrl = data.result.viewlink
            this.showView = true
          })*/
          ipcRenderer.send('item:file', {
            name: f.filename,
            msg: 'preview'
          })
          if(!shell.openItem('D:\\tmp\\' + f.filename)) {
            this.download()
          }
        } else if (ext == 'jpg' || ext == 'jpeg' || ext == 'gif' || ext == 'png' || ext == 'bmp' || ext == 'ico') {
          getPreviewUrl(this.file_selected[0]).then(url => {
            this.picUrl = url
            setTimeout(() => {
              this.show_preview = true
            },200)
          })
        }
      },
      active(f) {
        return (this.file_selected.indexOf(f) != -1)
      },
      download2(list) {
        if (list) {
          list.forEach(f => {
            let filename = this.non_repeating_name(this.downloadList, f.filename)
            let item = {
              filename: filename,
              percent: f.percent,
              filesize: f.filesize,
              md5: f.md5
            }
            this.downloadList.push(item)
            //download(item)
          })
        } else {
          this.file_selected.forEach(f => {
            let filename = this.non_repeating_name(this.downloadingList.concat(this.waitingList), f.filename)
            let item = {
              filename: filename,
              percent: 0,
              filesize: f.filesize,
              md5: f.md5,
              uid: 'Testuser010',
              bucketName: 'app_da6ad3d086e831a8_Testuser010_bucket',
            }
            if (this.downloadingList.length < 2) {
              this.downloadingList.push(item)
              download(item)
            } else {
              this.waitingList.push(item)
            }
          })
        }
      },
      download(list) {
        let downloadList,
          pushList = []
        if (list) {
          downloadList = list
        } else {
          downloadList = this.file_selected
        }

        downloadList.forEach(f => {
          let filename = this.non_repeating_name(this.downloadingList.concat(this.waitingList), f.filename)
          let item = {
            filename: filename,
            percent: f.percent || 0,
            filesize: f.filesize,
            md5: f.md5,
            uid: f.uid || 'Testuser010',
            bucketName: f.bucketName || 'app_da6ad3d086e831a8_Testuser010_bucket',
          }
          if (f.key) {
            Object.assign(item, {key: f.key})
          }
          if (this.downloadingList.length < 5) {
            this.downloadingList.push(item)
            pushList.push(item)
          } else {
            this.waitingList.push(item)
          }
        })

        console.log(pushList)
        ipcRenderer.send('item:file', {
          file: pushList,
          msg: 'download'
        })
      },
      non_repeating_name(arr, baseName) {
        let arr_existed = []
        for (let i = 0; i < arr.length; i += 1) {
          let item = arr[i]
          if (item.filename.indexOf(baseName) == 0) {
            arr_existed.push(item.filename.replace(baseName, ''))
          }
        }

        if (arr_existed.length == 0 || arr_existed.indexOf('') == -1) {
          return baseName
        }
        for (let i = 1; i < arr_existed.length + 2; i += 1) {
          if (arr_existed.indexOf('(' + i + ')') == -1) {
            return (baseName + '(' + i + ')')
          }
        }
      },
      newFolder() {
        let baseName = this.i18n.new + this.i18n.folder

        let filename = this.non_repeating_name(this.files, baseName)
        this.files.unshift({
          filename: filename,
          filetype: '2',
          newFolder: true
        })
      },
      handleBlur(e, file) {
        if (file.newFolder) {
          this.addFile(e, file)
        } else {
          this.rename(e,file)
        }
      },
      addFile (e, file) {
        let params = {
          classify: 5,
          fileName: e.target.value,
          fileType: 2,
          flag: 1,
          md5: '',
          parentPath: this.parentPath,
          userAccount: 'Testuser003'
        }

        addFile(params).then(() => {
          this.getList()
        })
      },
      rename(e, file) {
        let params = {
          fileId: file.fileid,
          newName: e.target.value,
          oldName: file.filename,
          path: '/' + file.fileid
        }

        rename(params).then(() => {
          this.getList()
        })
      },
      del() {
        let func = () => {
          let fileList = this.file_selected.map(f => {
            return {
              path: '/' + f.fileid,
              fileName: f.filename,
              md5: f.md5 == '' ? '0' : f.md5,
              fileId: f.fileid
            }
          })
          let params = {
            fileList: fileList
          }

          delFile(params).then(() => {
            this.getList()
          })
        }
        this.confirm('warning',this.i18n.del_warning, func)
      },
      renameMode() {
        this.$set(this.file_selected[0], 'renaming', true)
      },
      showDialog() {
        this.showMoveCopy = true
        this.treeData = [
          {
            fileid : '',
            filename : this.i18n.home,
            path: '/',
            children : [],
            isLeaf : false
          }]
      },
      loadNode(node, resolve) {
        if (node.level == 0) {
          resolve(this.treeData)
        } else {
          let params = {
            path: node.data.path,
            index: 1,
            pageSize: 100,
            type: 1
          }
          getList(params).then(data => {
            try {
              let result = data.result.subinfos
              result = result.map(function (e, i) {
                e.path = node.data.path == '/' ? ('/' + e.fileid) : (node.data.path + '/' + e.fileid)
                return e
              })
              resolve(result)
            } catch (e) {
              console.log(e)
            }
          })
        }
      },
      renderContent(h, { node, data, store }) {
        return h(
          'span',
          null,
          [node.expanded ? h(
            'i',
            { 'class': 'folder-icon folder-icon-open' },
            []
          ) : h(
            'i',
            { 'class': 'folder-icon folder-icon-closed'},
            []
          ), node.label]
        )
      },
      move() {
        let parentPath = this.$refs.tree.getCurrentNode().path
        let promises = this.file_selected.map((e, i) => {
          return new Promise((resolve, reject) => {
            let params = {
              fullPath : this.parentPath == '/' ? ('/' + e.fileid) : (this.parentPath + '/' + e.fileid),
              parentPath : parentPath,
              opType : 1
            }
            move(params).then(data => {
              if (data.errorCode == 200) {
                resolve()
              } else {
                reject()
              }
            })
          })
        })
        Promise.all(promises).then(data => {
          this.showMoveCopy= false
          this.getList()
        })
      },
      copy() {
        this.file_copyed = Object.assign([], this.file_selected)
      },
      paste() {
        let promises = this.file_copyed.map((e, i) => {
          return new Promise((resolve, reject) => {
            let params = {
              fullPath : e.fullPath,
              parentPath : this.parentPath,
              opType : 2
            }
            move(params).then(data => {
              if (data.errorCode == 200) {
                resolve()
              } else {
                reject()
              }
            })
          })
        })
        Promise.all(promises).then(() => {
          this.getList()
        })
      },
      showContext(f) {
        if (f) {
          let index = this.file_selected.indexOf(f)
          if (index == -1) {
            this.file_selected = []
            this.file_selected.push(f)
          }
          setTimeout(() => {
            this.menu.popup(remote.getCurrentWindow())
          })
        } else {
          setTimeout(() => {
            this.blankMenu.popup(remote.getCurrentWindow())
          })
        }
      },
      initContext() {
        var _this = this
        let menu = this.menu = new Menu()
        let blankMenu = this.blankMenu = new Menu()
        let i18n = this.i18n
        menu.append(new MenuItem({label: i18n.copy, click() { _this.copy() }}))
        blankMenu.append(new MenuItem({label: i18n.paste, click() { _this.paste() }}))
        //menu.append(new MenuItem({type: 'separator'}))
      },
      closeDialog() {
        this.showMoveCopy = false
      },
      getType(filename) {
        return getFileTypeByFileName(filename)
      },
      getList() {
        if (this.keyword) {
          let params = {
            index: this.pagination.currentPage,
            pageSize: this.pagination.pageSize,
            type : 0,//“0”：所有（包括文件和文件夹）,“1”：文件夹 ,“2”：文件
            keyword : this.keyword,
            userType : 1,
          }
          search(params).then(data => {
            try {
              this.files = data.result.Infos
              //this.pagination.total = parseInt(data.total, 10)
            } catch (e) {
              console.log(e)
            }
          })
        } else {
          let params = {
            index: this.pagination.currentPage,
            pageSize: this.pagination.pageSize,
            path: this.parentPath,
            type: 0
          }
          getList(params).then(data => {
            try {
              let files = this.files = data.result.subinfos
              this.fullPath = data.result.fullDirName
              for (let i = 0; i < files.length; i += 1) {
                files[i].fullPath = this.parentPath == '/' ? ('/' + files[i].fileid) : (this.parentPath + '/' + files[i].fileid)
              }
              this.pagination.total = parseInt(data.total, 10)
            } catch (e) {
              console.log(e)
            }
          })
        }
      },
      bpcList() {
        bpcList({}).then(data => {
          let list = data.result.subinfos
          this.uploadList = list.map(e => {
            let path = e.path || 'E:\\softwares\\test2.zip'
            return {
              file: '',
              percent: Math.round(e.frameSeq  * e.frameSize / e.fileSize * 100),
              name: e.fileName,
              size: e.fileSize,
              path: path,
              state: 'paused',
              parentPath: e.parentPath
            }
          })
        })
      },
      search() {
        if (this.keyword) {
          this.getList()
        } else {
          this.$router.push({ path: '/disk/home' })
        }
      },
    },
    created() {
      /*axios.post(`http://202.104.112.245/v1/mideastore/service/download/listdir`, {
        downloadFlag: "DOWN_FILE_LIST_FLAG__80be6fba4b53e3017c78265ec07cb89b"
      })*/
      //this.getList()
      //this.bpcList()
      //this.initContext()
      ipcRenderer.on('download', (event, arg) => {
        this.download(arg)
      })
    },
    watch: {
      '$route' (to, from) {
        this.parentPath = this.$route.params[0] ? ('/' + this.$route.params[0]) : '/'
        this.getList()
        //this.bpcList()
      }
    },
    components: {
      Transmission,
      HtmlPanel,
      ImgPreview,
    }
  }
</script>

<style>
  .toolBar{
    display: flex;
    padding: 5px 0;
  }
  .crumb {
    border: 1px solid #dcdfe6;
    padding: 9px;
    flex: 1;
  }
  .searchBox {
    flex: 0 0 180px;
    margin-left: 10px;
  }
</style>