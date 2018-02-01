import axios from 'axios'
import { getmd5, get_chunkSize, getFileType } from '@/utils/upload'

let domain = 'http://172.20.32.159'
let userAccount = "c0d6af9c-5370-4756-a90d-6e2e7b317292"

const getList = params => {
  return axios.post(`${domain}/v1/mideastore/service/group/list`, params)
}

//添加文件或目录
const addFile = params => {
  return axios.post(`${domain}/v1/mideastore/service/add`, params).then(res => res.result)
}
//获取OSS AUTH
const ossauth = params => {
  return axios.post(`${domain}/v1/mideastore/service/get/ossauth`, params).then(auth => {
    let result = auth.result
    let s3 = new AWS.S3({'accessKeyId':result.ak, 'secretAccessKey':result.sk,  'endpoint': result.cephUrl,'s3ForcePathStyle':true});
    return {
      bucket: result.bucketName,
      s3: s3,
    }
  })
}
//上传分片
const upload = (s3, params) => {
  return new Promise((resolve, reject) => {
    s3.uploadPart(params, function(err, data){
      if (err) {
        reject(err)
      } else {
        resolve(data.eTag)
      }
    })
  })
}
//上传完成
const uploadFinish = params => {
  return axios.post(`${domain}/v1/mideastore/service/upload/end`, params)
}

// 分片上传
const multipartUpload = (file) => {
  let fileSize = file.size
  let chunkSize = get_chunkSize(fileSize)
  getmd5(file, chunkSize).then((md5) => {
    let _params = {
      userAccount: userAccount,
      md5: md5,
      isBPC: '0',
    }

    let params = Object.assign({
      fileType: '1',
      classify: getFileType(file.name),
      fileName: file.name,
      parentPath: '/',
      fileSize: fileSize,
      framesize: chunkSize,
      frameNum: Math.ceil(fileSize / chunkSize)
    }, _params)

    addFile(params).then(uploadInfo => {
      ossauth(_params).then(auth => {
        let s3 = auth.s3
        var params = {
          Bucket: auth.bucket,
          Key: md5,
          PartNumber: 1,
          UploadId: uploadInfo.uploadId,
        }
        let blob = file.slice((params.PartNumber -1) * chunkSize, params.PartNumber * chunkSize)
        params['Body'] = blob

        upload(s3, params).then(() => {
          if (params.PartNumber < params.frameNum) {
            params.PartNumber += 1
            upload(s3, params)
          } else {
            let params = {
              md5: md5,
              uploadId: uploadInfo.uploadId,
              frameNum: Math.ceil(fileSize / chunkSize),
            }
            uploadFinish(params).then(() => {

            })
          }
        })
      })
    })
  })
}
//下载文件
const download = file => {
  let params = {
    userAccount: userAccount,
    md5 : file.md5,
    purpose : 2,
  }
  ossauth(params).then(auth => {
    let s3 = auth.s3
    let params = {
      Bucket: auth.bucket,
      Key: file.md5,
      Expires : 1800 //设置获取链接的过期时间(60s*30=30min)
    }
    s3.getSignedUrl('getObject', params, function(err, url) {
      if (err) {
        console.log(err)
      } else {
        let openUrl = url.substring(0,url.indexOf(params.Bucket)).concat('download/').concat(url.substring(url.indexOf(params.Bucket), url.indexOf("?"))).concat('/').concat(file.filename).concat(url.substring(url.indexOf("?")))
        //console.log(openUrl)
        let opener = window.open(openUrl);
      }
    })
  })
}

export {
  getList,
  multipartUpload,
  download,
}

