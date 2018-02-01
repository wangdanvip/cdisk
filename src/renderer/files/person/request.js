import axios from 'axios'
import { getmd5, get_chunkSize, getFileType } from '@/utils/upload'
import { doDownload } from '@/utils/file'
const { ipcRenderer } = require('electron')

let domain = 'http://202.104.112.245'
let userAccount = "Testuser010"

const getList = params => {
  return axios.post(`${domain}/v1/mideastore/service/list`, params)
}

//添加文件或目录
const addFile = params => {
  return axios.post(`${domain}/v1/mideastore/service/add`, params).then(res => res.result)
}
//获取OSS AUTH
const ossauth = params => {
  return axios.post(`${domain}/v1/mideastore/service/get/ossauth`, params).then(auth => {
    let result = auth.result
    let s3 = new AWS.S3({
      'accessKeyId': result.ak,
      'secretAccessKey': result.sk,
      'endpoint': result.cephUrl,
      's3ForcePathStyle': true
    });
    return {
      bucket: result.bucketName,
      s3: s3,
    }
  })
}
//获取预览链接
const viewLink = params => {
  return axios.post(`${domain}/v1/mideastore/service/get/view/link`, params)
}

const upload = (s3, params, file, chunkSize, frameNum, item) => {
  //上传分片
  const uploadPart = (resolve, reject) => {
    console.log(item.state)
    let blob = file.slice((params.PartNumber - 1) * chunkSize, params.PartNumber * chunkSize)
    params['Body'] = blob
    s3.uploadPart(params, function (err, data) {
      if (err || item.state != 'progressing') {
        reject(err || item.state)
      } else {
        item.percent = Math.round(params.PartNumber * 100 / frameNum)
        if (params.PartNumber < frameNum) {
          params.PartNumber += 1
          uploadPart(resolve, reject)
        } else {
          resolve()
        }
      }
    })
  }
  return new Promise((resolve, reject) => {
    uploadPart(resolve, reject)
  })
}
//上传完成
const uploadFinish = params => {
  return axios.post(`${domain}/v1/mideastore/service/upload/end`, params)
}

// 分片上传
const multipartUpload = (uploadList, index) => {
  let func = (resolve, reject) => {
    let item = uploadList[index]
    let file = item.file
    let fileSize = file.size
    let chunkSize = get_chunkSize(fileSize)
    let frameNum = Math.ceil(fileSize / chunkSize)
    let md5
    let _params
    let params
    let uploadInfo
    getmd5(file, chunkSize).then((m) => {
      md5 = m
      _params = {
        userAccount: userAccount,
        md5: md5,
        isBPC: '0',
      }

      params = Object.assign({
        fileType: '1',
        classify: getFileType(file.name),
        fileName: file.name,
        parentPath: item.parentPath,
        fileSize: fileSize,
        framesize: chunkSize,
        frameNum: frameNum
      }, _params)

      return addFile(params)
    }).then(upload_info => {
      if (upload_info.fileid) {
        item.percent = 100
        return new Promise((resolve, reject) => {
          reject('miaochuan')
        })
      } else {
        uploadInfo = upload_info
        return ossauth(_params)
      }
    }).then(auth => {
      let s3 = auth.s3
      let c_params = {
        Bucket: auth.bucket,
        Key: md5,
        PartNumber: 1,
        UploadId: uploadInfo.uploadId,
      }
      return upload(s3, c_params, file, chunkSize, frameNum, item)
    }).then(() => {
      let params = {
        md5: md5,
        uploadId: uploadInfo.uploadId,
        frameNum: frameNum,
      }
      return uploadFinish(params)
    }).then(() => {
      if (index < uploadList.length - 1) {
        index += 1
        multipartUpload(uploadList, index, parentPath)
      } else {
        resolve()
      }
    }).catch(err => {
      console.log(err)
      if (index < uploadList.length - 1) {
        index += 1
        multipartUpload(uploadList, index, parentPath)
      } else if (err == 'miaochuan') {
        resolve()
      }
    })
  }
  return new Promise((resolve, reject) => {
    func(resolve, reject)
  })
}
//下载文件
const download2 = (file) => {
  let func = (resolve, reject) => {
    let params = {
      userAccount: userAccount,
      md5: file.md5,
      purpose: 2,
    }
    ossauth(params).then(auth => {
      let s3 = auth.s3
      let params = {
        Bucket: auth.bucket,
        Key: file.md5,
        Expires: 1800 //设置获取链接的过期时间(60s*30=30min)
      }

      s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
          reject(err)
        } else {
          let openUrl = url.substring(0, url.indexOf(params.Bucket)).concat('download/').concat(url.substring(url.indexOf(params.Bucket), url.indexOf("?"))).concat('/').concat(file.filename).concat(url.substring(url.indexOf("?")))
          //console.log(openUrl)
          /*let opener = window.open(openUrl);
           setTimeout(() => {
           opener.close();
           }, 1000)*/

          file.url = openUrl
          ipcRenderer.send('item:file', {
            file: file,
            msg: 'download'
          })
          //doDownload(openUrl)
          resolve()
        }
      })
    })
  }
  return new Promise((resolve, reject) => {
    func(resolve, reject)
  })
}

const download = (file) => {
  let params = {
    md5: file.md5,
    fileName: file.filename,
    bucketName: file.bucketName,
    uid: file.uid,
  }

  axios.post(`${domain}/v1/mideastore/service/file/down`, params).then(data => {
    console.log(data.result.downloadurl)
    window.open(data.result.downloadurl)
  })
}

const getPreviewUrl = file => {
  let func = (resolve, reject) => {
    let params = {
      userAccount: userAccount,
      md5: file.md5,
      purpose: 2,
    }
    ossauth(params).then(auth => {
      let s3 = auth.s3
      let params = {
        Bucket: auth.bucket,
        Key: file.md5,
        Expires: 1800 //设置获取链接的过期时间(60s*30=30min)
      }
      s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
          reject(err)
        } else {
          resolve(url)
        }
      })
    })
  }
  return new Promise((resolve, reject) => {
    func(resolve, reject)
  })
}
const rename = params => {
  return axios.post(`${domain}/v1/mideastore/service/rename`, params)
}
//删除文件
const delFile = params => {
  return axios.post(`${domain}/v1/mideastore/service/delete`, params)
}
const getCapacity = params => {
  return axios.post(`${domain}/v1/mideastore/service/get/capacity`, params)
}
//断点续传列表
const bpcList = params => {
  return axios.post(`${domain}/v1/mideastore/service/get/bpc/list`, params)
}
const search = params => {
  return axios.post(`${domain}/v1/mideastore/service/search/by/filename`, params)
}
const move = params => {
  return axios.post(`${domain}/v1/mideastore/service/move`, params)
}

export {
  getList,
  multipartUpload,
  download,
  getPreviewUrl,
  viewLink,
  rename,
  addFile,
  delFile,
  getCapacity,
  bpcList,
  search,
  move,
}
