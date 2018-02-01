<template>
  <div class="mb_img_preview" v-show="visible">
    <div class="dlg-hd">
      <a @click="close" :title="i18n.close"></a>
    </div>
    <div class="dlg-bd">
      <div class="img_wrap" :style="{display: wrapDisplay}" style="width: 100%;height: 100%;text-align: center;">
          <span v-show="!show_loading" :style="{width:imgWidth+'px',height:imgHeight+'px'}">
            <img @load="load" class="img_pre_ico" :src="url" :style="{width:imgWidth+'px',height:imgHeight+'px'}" alt="" style="vertical-align:middle;">
          </span>
      </div>
    </div>
    <div class="dlg-footer">
      <div class="dlg-footer-mb"></div>
      <div class="operate-container">
        <div class="img-control">
          <em class="control control-left" :title="i18n.left_rotate"></em>
          <em class="control control-right" :title="i18n.right_rotate"></em>
          <em class="control control-share" :title="i18n.share_friends"></em>
          <em class="control control-download" :title="i18n.download+i18n.pic"></em>
          <em class="control control-delete" :title="i18n.del+i18n.pic"></em>
        </div>
      </div>
    </div>
    <div class="dlg-menu">
      <span class="to_pre_img"></span>
      <span class="to_next_img"></span>
    </div>
    <div v-show="show_loading" class="tip_loading" style="width:24px;height:24px; position: absolute; left: 50%; top: 50%; margin-left: -12px; margin-top:-55px;">
      <img src="static/img/fancybox_loading.gif" alt="loading">
    </div>
  </div>
</template>

<script>
  let imgReady = (function () {
    let list = [], intervalId = null,
      // 用来执行队列
      tick = function () {
        let i = 0;
        for (; i < list.length; i++) {
          list[i].end ? list.splice(i--, 1) : list[i]();
        }
        !list.length && stop();
      },
      // 停止所有定时器队列
      stop = function () {
        clearInterval(intervalId);
        intervalId = null;
      };
    return function (url, ready, load, error) {
      let onready, width, height, newWidth, newHeight,
        img = new Image();
      img.src = url;
      // 如果图片被缓存，则直接返回缓存数据
      if (img.complete) {
        ready.call(img);
        load && load.call(img);
        return;
      }
      width = img.width;
      height = img.height;
      // 加载错误后的事件
      img.onerror = function () {
        error && error.call(img);
        onready.end = true;
        img = img.onload = img.onerror = null;
      };
      // 图片尺寸就绪
      onready = function () {
        newWidth = img.width;
        newHeight = img.height;
        if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
          ready.call(img);
          onready.end = true;
        }
      };
      onready();
      // 完全加载完毕的事件
      img.onload = function () {
        // onload在定时器时间差范围内可能比onready快
        // 这里进行检查并保证onready优先执行
        !onready.end && onready();
        load && load.call(img);
        // IE gif动画会循环执行onload，置空onload即可
        img = img.onload = img.onerror = null;
      };
      // 加入队列中定期执行
      if (!onready.end) {
        list.push(onready);
        // 无论何时只允许出现一个定时器，减少浏览器性能损耗
        if (intervalId === null) intervalId = setInterval(tick, 40);
      }
    };
  })()
  const { ipcRenderer } = require('electron')
  const remote = require('electron').remote
  export default {
    props: ['url', 'value'],
    data() {
      return ({
        visible: false,
        rotate_num: 0,
        imgWidth: '',
        imgHeight: '',
        wrapDisplay: 'block',
        show_loading: true,
      })
    },
    methods: {
      close() {
        this.visible = false
        ipcRenderer.send('fullScreen', false)
      },
      render() {
        ipcRenderer.send('fullScreen', true)
        var _this = this
        this.wrapDisplay = 'none'
        let cond_num = (this.rotate_num/90)%2
        /*let clientWidth = document.body.clientWidth
        let clientHeight = document.body.clientHeight*/
        let clientWidth = remote.getGlobal('size')[0]
        let clientHeight = remote.getGlobal('size')[1]
        imgReady(this.url, function () {
          let imgWidth = this.width
          let imgHeight = this.height
          if (cond_num == 0) {
            if(imgWidth<=clientWidth && imgHeight<=clientHeight){
              _this.imgWidth = imgWidth
              _this.imgHeight = imgHeight
            }else if(imgWidth>=clientWidth && imgHeight<=clientHeight){
              let h_now = imgHeight/(imgWidth/clientWidth)
              _this.imgWidth = clientWidth
              _this.imgHeight = h_now
            }else if(imgWidth<=clientWidth && imgHeight>=clientHeight){
              let w_now = imgWidth/(imgHeight/clientHeight)
              _this.imgWidth = w_now
              _this.imgHeight = clientHeight
            }else if(imgWidth>clientWidth && imgHeight>clientHeight){
              if(clientWidth/clientHeight <= imgWidth/imgHeight){
                let h_now = imgHeight/(imgWidth/clientWidth)
                _this.imgWidth = clientWidth
                _this.imgHeight = h_now
              }else{
                let w_now = imgWidth/(imgHeight/clientHeight)
                _this.imgWidth = w_now
                _this.imgHeight = clientHeight
              }
            }
          } else if (cond_num==1 || cond_num==-1) {

          }
          _this.wrapDisplay = 'table'
        })
      },
      load() {
        this.show_loading = false
      }
    },
    watch: {
      value(val) {
        this.visible = val
      },
      visible(val) {
        this.$emit('input', val)
        if (val) {
          this.render()
        }
      }
    }
  }
</script>

<style scoped="">
  .mb_img_preview {
    position: absolute;
    background: #1f1f1f;
    left:0px;
    top:0px;
    width: 100%;
    height: 100%;
    z-index:101;
  }
  .dlg-menu{
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 102;
    width: 100%;
    height: 100%;
   /* padding:0px 60px;*/
    overflow:hidden;
  }
  .to_pre_img,.to_next_img{
    position: absolute;
    top: 50%;
    display:table-cell;
    width: 44px;
    height: 70px;
    background: red;
    cursor:pointer;
    margin-top: -65px;
    background: url(../../../static/img/img_preview.png) 0 0 no-repeat;
  }
  .to_pre_img{
    left: 60px;
    background-position: -258px -181px;
  }
  .to_next_img{
    right: 60px;
    background-position: -493px -71px;
  }
  .to_pre_img:hover{
    background-position: -420px -176px;
  }
  .to_next_img:hover{
    background-position: -307px -176px;
  }
  .dlg-hd{
    position: absolute;
    right: 0px;
    top: 0px;
    width:60px;
    z-index: 105;
    height: 60px;
  }
  .dlg-hd>a{
    width: 60px;
    height: 60px;
    cursor: pointer;
    display: block;
    background: url(../../../static/img/img_preview.png) 0 -189px no-repeat;
  }
  .dlg-hd>a:hover{
    background-position: -390px -105px;
  }
  html,body,.dlg-bd{
    width: 100%;
    height: 100%;
  }
  .img_wrap{
    display: none;
    border:0px;
    width:100%;
    height:100%;
    overflow:hidden;
    text-align:center;
    float:left;
    position:relative;
  }
  .img_wrap > span{
    display:table-cell;
    vertical-align:middle;
    cursor:default;
  }
  .img_pre_ico{
    background: #ffffff;
  }
  .dlg-footer{
    height: 38px;
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
    text-align: center;
    z-index: 105;
  }
  .dlg-footer-mb{
    height: 38px;
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100%;
    background-color: #000;
    opacity: .5;
    filter: alpha(opacity=50);
    z-index: 10;
  }
  div.operate-container,div.operate-container > div,.img-control>em{
    position: relative;
    z-index: 20;
  }
  .img-control{
    margin: 0px auto;
    display: inline-block;
    zoom: 1;
  }
  .img-control .control {
    display: block;
    cursor: pointer;
    background: url(../../../static/img/img_preview.png) 0 0 no-repeat;
    _background: url(../../../static/img/img_preview.png) 0 0 no-repeat;
    float: left;
    margin: 0 8px;
    height: 38px;
    width: 30px;
  }
  .img-control .control-left {
    background-position: -136px 7px;
  }
  .img-control .control-left:hover {
    background-position: -136px -34px;
  }
  .img-control .control-right {
    background-position: -179px 7px;
  }
  .img-control .control-right:hover {
    background-position: -179px -34px;
  }
  .img-control .control-share {
    background-position: -222px 7px;
  }
  .img-control .control-share:hover {
    background-position: -222px -34px;
  }
  .img-control .control-download {
    background-position: -263px 7px;
  }
  .img-control .control-download:hover {
    background-position: -263px -34px;
  }
  .img-control .control-delete {
    background-position: -348px 7px;
  }
  .img-control .control-delete:hover {
    background-position: -348px -34px;
  }
</style>