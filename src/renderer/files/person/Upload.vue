<template>
    <div id="mainUpload">
        <div class="el-upload el-upload--text">
            <a href="javascript:;" class="file">上传数据
                <input title="请选择要上传的文件" id="fileInput" class="file-select-proxy" type="file" multiple="" size="100" @change="onFilesAdded">
            </a>
        </div>
        <ul class="el-upload-list el-upload-list--text MT15" style="height : 200px;overflow: auto;border : 1px solid rgb(221, 221, 221);margin:0 150px 50px 0;">
            <li class="el-upload-list__item is-success" v-for="(item,index) in fileList" v-if="item.fileStatus!=2">
                <a v-if="!+item.expired" class="el-upload-list__item-name" :title="item.filename" style="width:20%;" :class="{'normal-a':item.noPreview}" @click="filePreview(index)">
                    <i class="el-icon-document"></i>{{item.filename}}
                </a>
                <a v-if="+item.expired" class="el-upload-list__item-name upload-expire-a" :title="item.filename" style="width:20%; text-decoration: none;">
                    <i class="el-icon-document"></i>{{item.filename}}
                </a>
                <label class="el-upload-list__item-status-label" v-if="!+item.expired">
                    <i class="el-icon-circle-check" :class="item.fileStatus==3 || item.fileStatus==4 ? 'showIt': 'hideIt'"></i>
                </label>
                <i v-if="!+item.expired" class="el-icon-close" :class="item.fileStatus==3 || item.fileStatus==4 ? 'hideIt': 'showIt'" @click="deleteUploadItem(index)"></i>
                <i v-if="+item.expired" class="el-icon-close showIt" @click="deleteUploadItem(index)"></i>
                <el-progress :percentage="item.percent" :stroke-width="4" style="top:5px;left:200px;width:40%;"></el-progress>
                <span class="speed" v-show="item.speed && item.percent != 100">{{item.speed | fileSizeFormate}}/S</span>
                <span class="speed" v-show="item.speed==0">失败</span>
                <span class="file-size">{{item.filesize | fileSizeFormate}}<span v-if="+item.expired">（失效）</span></span>
            </li>
        </ul>
    </div>
</template>

<script>
    const CHUNK_SIZE = 512 * 1024;//默认分片大小
    const LIMIT_UPLOAD_NUM = 10;//控制上传文件数量(10)
    const LIMIT_FILE_SIZE = 1 * 1024 * 1024 * 1024;//限制上传的单个文件大小(1 * 1024 * 1024 * 1024)
    import Vue from "vue"
    let token = "";
    export default{
        data(){
            return {
                fileList : [],
                uploadIndex : 0,
                isUploading : false
            }
        },
        watch : {
            uploadIndex : function(){
                if(this.uploadIndex < this.fileList.length){
               //     this.fileUploadOneByOne(this.uploadIndex);
                }
            }
        },
        methods : {
            deleteUploadItem(i){
                var that = this;
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                    var fileItem = that.fileList[i];
                    var data = {
                        md5 : fileItem.md5,
                        cephId : fileItem.cephId,
                        uploadId : fileItem.uploadId,
                        trackId : fileItem.trackId,
                        token : token
                    };

                    if(that.fileList[i].fileStatus == 1){
                        return that.Util.request('front.upload.fileUploadCancel',{params:data,dealSelf:true});
                    }else{
                        return new Promise(function(resolve,reject){
                            var result = {
                                data : {
                                    errorCode : 200
                                }
                            };
                            resolve(result);
                        });
                    }
                }).then(function(res){
                    var result = res.data;
                    if(result.errorCode == 200){
                        that.fileList[i].fileStatus = 2;
                        that.$forceUpdate();//强制渲染，防止草稿回填的上传文件数据删除失效的问题
                    }else{

                    }
                });
            },
            //文件预览
            filePreview(i){
                var fileItem = this.fileList[i];
                if(fileItem.noPreview){
                    return false;
                }
                var data = {
                    md5 : fileItem.md5,
                    cephId : fileItem.cephId,
                    fileName : fileItem.filename,
                    fileSize : fileItem.filesize,
                    trackId : fileItem.trackId,
                    token : token
                };
                var ext = fileItem.filename.substring(fileItem.filename.lastIndexOf('.')+1);
                ext = ext.toLowerCase();
                var imageExt = ['jpg','jpeg','gif','png','bmp','ico'];
                var isImage = false;
                if(imageExt.indexOf(ext) != -1){
                    isImage = true;
                }
                this.Util.request('common.filePreView',{params:data,dealSelf:true}).then(function(res){
                    var result = res.data;
                    if(result.errorCode == 200){
                        if(isImage){
                            var newWindow = window.open();
                            newWindow.document.write("<img src="+result.result.viewlink.replace(/\s/g, '')+">");
                        }else{
                            window.open(result.result.viewlink);
                        }
                    } else if(result.errorCode == 704) {
                    	_this.$notify({
					        title: '错误',
					        message: "未在有效的时间范围",
					        offset: 100,
					        type: 'error'
					    });
                    } else if(result.errorCode == 708) {
                    	_this.$notify({
					        title: '错误',
					        message: "流程已废弃",
					        offset: 100,
					        type: 'error'
					    });
                    }
                });
            },
            fileUploadOneByOne(){
                var that = this;
                this.isUploading = true;
                that.getmd5(that.fileList[that.uploadIndex]).then(function(md5){//获取MD5回调
                    var fileItem = that.fileList[that.uploadIndex];
                    var data = {
                        md5: md5,
                        fileName: fileItem.filename,
                        isBPC: 0,
                        fileSize: fileItem.filesize,
                        frameSize: fileItem.chunkSize,
                        frameNum: fileItem.frameNum,
                        token: token
                    };
                    that.fileList[that.uploadIndex].md5 = md5;
                    return that.Util.request('front.upload.addFile',{params:data,dealSelf:true});
                }).then(function(res){//预上传回调
                    if(res.data.errorCode == 300 || res.data.errorCode == 801){//token is illegal.
                        that.$notify({
                            title: '警告',
                            message: '您处于未登录状态',
                            type: 'warning'
                        });
                        setTimeout(function(){
                            sessionStorage.removeItem("user");
                            that.$router.push({name: "登录"});
                            window.location.reload();
                        },2000);
                    }
                    return that.fileUpload(that.fileList[that.uploadIndex],res.data);
                }).then(function(res){//单个文件所有分片上传完成回调，通知后台
                    var fileItem = that.fileList[that.uploadIndex];
                    var parameter = {trackId:fileItem.trackId,cephId: fileItem.cephId,md5: fileItem.md5, uploadId: fileItem.uploadId, frameNum: fileItem.frameNum, token: token};
                    return that.Util.request('front.upload.fileUploadFinish',{params:parameter,dealSelf:true});
                },function(res){
                	if(res == 'seconds'){
                		throw 'seconds';
                	}else{
                		throw 'network error!';	
                	}
                	
                }).then(function(res){//通知后台回调
                    var result = res.data;
                    if(result.errorCode == 200){
                        console.log('上传完成上报成功',result);
                        that.fileList[that.uploadIndex].fileStatus = 3;
                    //    resolve();
                    } else {
                        console.log('上传完成上报出错',result);
                        that.fileList[that.uploadIndex].fileStatus = 5;
                        that.fileList[that.uploadIndex].percent = 99;
                        that.fileList[that.uploadIndex].speed = 0;
                    //    reject();
                    }
                    //各分片已经上传完成,设置fileid
                    if(that.uploadIndex+1 < that.fileList.length){
                        that.fileList[that.uploadIndex].uploadTime = that.Util.formatDate1(new Date());
                        that.uploadIndex++;
                        that.fileUploadOneByOne();
                    }else{
                        that.isUploading = false;
                    }
                }).catch(function(err){
                    console.log(err)

                    if(that.uploadIndex+1 < that.fileList.length){
                        that.uploadIndex++;
                        that.fileUploadOneByOne();
                    }else{
                        that.isUploading = false;
                    }
                });
            },
            onFilesAdded(event){
                var that = this;
                var addFiles = event.target.files;
                //单次文件窗口添加的文件数量大于10个，提醒用户不能超过10个，此次添加不成功
                if(addFiles.length > LIMIT_UPLOAD_NUM){
                        that.$notify({
                          title: '警告',
                          message: '上传文件不能超过'+ LIMIT_UPLOAD_NUM +'个',
                          type: 'warning'
                        });
                        return false;
                }
                //遍历已经添加的文件列表，过滤掉里面已经取消上传的文件，统计已经有的文件数加上此次添加的文件数，如果大于10个，提醒用户所有文件数量不能超过10个，此次添加不成功
                var countAddFiles = 0;
                for(var i=0;i<that.fileList.length;i++){
                    if(that.fileList[i].fileStatus != 2 && that.fileList[i].fileStatus != 5){
                        countAddFiles++;
                    }
                }
                if(countAddFiles+addFiles.length > LIMIT_UPLOAD_NUM){
                    that.$notify({
                      title: '警告',
                      message: '上传文件不能超过'+ LIMIT_UPLOAD_NUM +'个',
                      type: 'warning'
                    });
                    return false;
                }
                for(var i=0;i<addFiles.length;i++){
                    var item = addFiles[i];
                    if(item.size > LIMIT_FILE_SIZE){//单个文件大小超过1G，过滤掉，不让上传
                        that.$notify({
                          title: '警告',
                          message: '不允许上传超过1G大小的文件（'+ item.name +'）',
                          type: 'warning'
                        });
                        continue;
                    }
                    var isPreview = Vue.filter('isPreview');
                    
                    var fileItem = {
                        filename : item.name,
                        fileid : '',
                        cephID : '',
                        uploadTime : '',
                        filesize : item.size,
                        percent : 0,
                        status : 0,
                        fileItem : item,
                        md5 : '',
                        frameNum : 0,
                        chunkSize : 0,
                        uploadId : '',
                        uploadingFrameNum : 1,
                        ak : '',
                        sk : '',
                        bucketName : '',
                        trackId : '',
                        endpoint : '',
                        fileStatus : 0,//0:未上传，1：上传中，2：已取消，3：成功，4：秒传成功，5：失败
                        noPreview : isPreview(item.name)
                    };
                    that.fileList.push(fileItem);
                }
                var fileObj = document.getElementById('fileInput');
                that.clearInputFile(fileObj);
                if(!that.isUploading){
                    that.fileUploadOneByOne();
                }
            },
            //清除file表单域，兼容各浏览器
            clearInputFile(f){
                if(f.value){
                    try{
                        f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
                    }catch(err){
                        console.log(err);
                    }
                    if(f.value){ //for IE5 ~ IE10
                        var form = document.createElement('form'), ref = f.nextSibling, p = f.parentNode;
                        form.appendChild(f);
                        form.reset();
                        p.insertBefore(f,ref);
                    }
                }
            },
            //文件上传
            fileUpload(fileItem,result){
                var fileItem = fileItem;
                var that = this;
                return new Promise(function(resolve,reject){
                    console.log('上传添加文件接口状态',result);
                    if(result.errorCode == 200){
                        if(result.result.fileId && !result.result.uploadId){
                            //文件秒传
                            that.fileList[that.uploadIndex].percent = 100;
                            that.fileList[that.uploadIndex].fileid = result.result.fileId;
                            that.fileList[that.uploadIndex].fileStatus = 4;
                            that.fileList[that.uploadIndex].cephId = result.result.cephId;
                            that.fileList[that.uploadIndex].trackId = result.result.trackId;
                            that.fileList[that.uploadIndex].uploadTime = that.Util.formatDate1(new Date());
                            reject('seconds');//秒传
                        }else if(result.result.uploadId){
                            //上传初始化
                            that.fileList[that.uploadIndex].fileStatus = 1;
                            that.fileList[that.uploadIndex].uploadId = result.result.uploadId;
                            that.fileList[that.uploadIndex].ak = result.result.ak;
                            that.fileList[that.uploadIndex].sk = result.result.sk;
                            that.fileList[that.uploadIndex].bucketName = result.result.bucketName;
                            that.fileList[that.uploadIndex].endpoint = result.result.cephUrl;
                            that.fileList[that.uploadIndex].cephId = result.result.cephId;
                            that.fileList[that.uploadIndex].trackId = result.result.trackId;
                            that.chunkUpload(fileItem,resolve,reject);
                        }
                    }else if(result.errorCode == 603){
                        reject('获取uploadId失败');
                    }else if(result.errorCode == 608){
                        reject('文件名不合法');
                    }else{
                        reject(res.data);
                    }
                });
            },
            //分片上传
            chunkUpload(fileItem,resolve,reject){
                var that = this;
                that.fileList[that.uploadIndex].fileStatus == 1;
                var start = (fileItem.uploadingFrameNum -1) * fileItem.chunkSize;
                var end = start + fileItem.chunkSize;
                var _blob = fileItem.uploadingFrameNum == fileItem.frameNum ? fileItem.fileItem.slice(start) : fileItem.fileItem.slice(start, end);
                var startTime = new Date().getTime();
                var S3 = new AWS.S3({'accessKeyId':fileItem.ak, 'secretAccessKey':fileItem.sk, 'endpoint':fileItem.endpoint,'s3ForcePathStyle':true});
                that.uploadPart(S3,fileItem.bucketName,fileItem.md5,fileItem.uploadingFrameNum,fileItem.uploadId,_blob).then(function(){
                    var costTime = new Date().getTime()-startTime;
                    //更新上传速度
                    that.fileList[that.uploadIndex].speed = Math.round(_blob.size / costTime * 1000 ) * (Math.floor(Math.random() * (1.5 -1.3)) + 1.3);
                    //日志上报
                    var logContent = {'userAccount': JSON.parse(sessionStorage.getItem("user")).userAccount, 'fileName':  fileItem.filename, 'frameSeq': fileItem.uploadingFrameNum, 'frameSize': fileItem.chunkSize, 'costs': costTime};
                    var data = {md5:fileItem.md5,cephId:fileItem.cephId,uploadId:fileItem.uploadId,logType:1,logContent:JSON.stringify(logContent),token:token};
                    return that.Util.request('front.upload.postUploadLog',{params:data,dealSelf:true});
                },function(res){
                	//更新上传速度
                    that.fileList[that.uploadIndex].speed = 0;
                    that.fileList[that.uploadIndex].fileStatus = 5;
                  	reject();
                }).then(function(res){
                //    if(res.errorCode != 200){
                //        console.log('分片日志上报失败');
                //        reject();
                //    }else{
                //        console.log('分片日志上报成功');
                		if(that.fileList[that.uploadIndex].fileStatus == 5){
                			return;
                		}
                        //更新进度条
                        that.fileList[that.uploadIndex].percent = Math.round(fileItem.uploadingFrameNum * 100/fileItem.frameNum);
                        if(fileItem.uploadingFrameNum < fileItem.frameNum && fileItem.fileStatus != 2){
                            //递归操作
                            that.fileList[that.uploadIndex].uploadingFrameNum++;
                            that.chunkUpload(fileItem,resolve,reject);
                        }else if(fileItem.uploadingFrameNum === fileItem.frameNum){
                            //所有分片上传完成
                            resolve();
                        }else if(fileItem.fileStatus == 2){
                            reject('上传中取消上传');
                        }
                //    }
                });

            },
            //调用S3接口分片上传
            uploadPart: function(s3,bucket, key, partnum, uploadId, body){
                var s3 = s3;
                return new Promise(function(resolve,reject){
                    if(!key || typeof(key) == 'undefined' || !uploadId
                        || typeof(uploadId) == 'undefined'){}
                    bucket = bucket == null || bucket == ''?
                             this.get('bucket'): bucket;
                    partnum = partnum == null || partnum == ''?
                              0 : partnum;
                    var params = {
                        Bucket: bucket,
                        Key: key,
                        PartNumber: partnum,
                        UploadId: uploadId,
                    }
                    if(body) params['Body'] = body;
                    s3.uploadPart(params, function(err, data){
                        if(err){
                            reject(err);
                            console.log(err)
                        }else{
                            resolve(data.ETag);
                            console.log('分片上传中')
                        }
                    });
                });
            },
            //计算文件md5值
            getmd5(file){
                var that = this;
                return new Promise(function(resolve,reject){
                    if(file.fileStatus == 2){
                        reject('文件已经取消上传');
                    }
                    if(file.fileStatus != 0){
                        reject('文件已经上传过');
                    }
                    var filesize = file.filesize;
                    var chunk_size = that.definedChunkSize(filesize);
                    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
                    var total_num = filesize < chunk_size ? 1 : filesize % chunk_size == 0 ? filesize /chunk_size : filesize /chunk_size + 1;
                    //向下取整数
                    var chunks = Math.floor(total_num);
                    var code_time = 0;
                    var spark = new SparkMD5.ArrayBuffer();
                    var fileReader = new FileReader();
                    //读取文件
                    fileReader.onload = function(e){
                        spark.append(e.target.result);
                        code_time++;
                        if (code_time < 2){
                            loadNext(chunks -1);
                        } else {
                            var res= spark.end();
                        //    that.fileList[that.uploadIndex].md5 = res;
                            that.fileList[that.uploadIndex].frameNum = chunks;
                            that.fileList[that.uploadIndex].chunkSize = chunk_size;
                            resolve(res);
                        }
                    };
                    fileReader.onerror = function(){
                        reject("文件 "+ file.name +" md5计算出错。");
                    };
                    function loadNext(currentChunk){
                        var start = currentChunk * chunk_size,
                            end = ((start + chunk_size) >= filesize) ? filesize : start + chunk_size;
                        fileReader.readAsArrayBuffer(blobSlice.call(file.fileItem, start, end));
                    }
                    loadNext(0);
                });
            },
            //定义分片大小
            definedChunkSize(filesize){
                if(!filesize || typeof filesize === 'undefined')
                    return CHUNK_SIZE;
                //暂时解决某些大文件上传丢片问题
                if(filesize > 4 * 1024 * 1024 * 1024){
                    return 8 * 1024 * 1024;
                }else if(filesize > 50 * 1024 * 1024){
                    return 4 * 1024 * 1024;
                }else{
                    return CHUNK_SIZE;
                }
            }
        },
        mounted() {
        	if(JSON.parse(sessionStorage.getItem("user")))
        		token = JSON.parse(sessionStorage.getItem("user")).token;
        }
//      activated: function() {
//          
//      }
    }
</script>

<style scoped>

.file {
    position: relative;
    display: inline-block;
    background: #D0EEFF;
    border: 1px solid #20a0ff;
    border-radius: 4px;
    padding: 4px 12px;
    overflow: hidden;
    text-decoration: none;
    text-indent: 0;
    line-height: 20px;
    color: #fff;
    background-color: #20a0ff;
}
.file input {
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
}
.file:hover {
    background: #4db3ff;
    border-color: #4db3ff;
    color: #fff;
    text-decoration: none;
}
.file-size{
    position: absolute;
    right: 10%;
    top: 0;
}
.speed{
    position: absolute;
    right: 23%;
    top: 0;
}
.normal-a{
    text-decoration: none;
    cursor: default!important;
    color: #48576a!important;
}
.showIt{
    display:inline-block !important;
}
.hideIt{
    display:none;
}
.upload-expire-a:hover {
	color: #48576a !important;
}
</style>