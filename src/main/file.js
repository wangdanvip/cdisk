const domain = 'http://202.104.112.245'

const chunk_download = (file, contents, items_paused) => {
  //const chunkSize = 512 * 1024
  const chunkSize = 1000
  const fs = require('fs')
  const {net} = require('electron')
  let url = file.url
  let stream
  let receivedBytes = 0
  let dir = 'E:/tmp/'

  fs.stat(dir, function (er, stat) {
    if (er) {
      fs.mkdirSync(dir,function(err){
        if (err) {
          return console.error(err)
        }
      })
    }
    fs.stat(dir + file.filename + '.downloading', function (err, stats) {
      stream = !err ? fs.createWriteStream(dir + file.filename + '.downloading', {flags: 'a'}) :
        fs.createWriteStream(dir + file.filename + '.downloading')
      if (!err) {
        receivedBytes += stats.size
      }

      func()
    })
  })

  let func = (i) => {
    if (items_paused.includes(file.filename)) {
      stream.end()
      return
    }
    const request = net.request(url)
    /*let start = i * chunkSize
    let end = (i + 1) * chunkSize - 1*/
    let start = receivedBytes
    let end = receivedBytes + chunkSize - 1
    console.log(start, end)
    request.setHeader('Range', 'bytes=' + start + '-' + end)
    request.on('response', (response) => {
      response.on('data', chunk => {
        stream.write(chunk)
      })

      let contentLength = response.headers['content-length'][0]
      response.on('end', () => {
        receivedBytes += parseInt(contentLength)
        let percent = Math.round(receivedBytes * 100 / file.filesize)
        fs.writeFile(dir + file.filename + '.downloading.cfg', file.filename + '|' + percent + '|' + file.filesize + '|' + file.md5)
        contents.send('download-reply', file.filename, receivedBytes)
        if (contentLength < chunkSize) {
          stream.end()
          fs.rename(dir + file.filename + '.downloading', dir + file.filename)
          fs.unlink(dir + file.filename + '.downloading.cfg')
        } else {
          //i += 1
          func()
        }
      })
    })
    request.end()
  }

}
const download = (win, url) => {
  win.webContents.downloadURL(url);
}

const getList = () => {
  let fs = require('fs')
  let path = require('path')
  let fileArr = []

  let filePath = path.resolve('E:/tmp/')
  return fileDisplay(filePath)

  function fileDisplay(filePath){
    return new Promise((resolve, reject) => {
      fs.readdir(filePath, function (err, files) {
        if (err) {
          reject()
        } else {
          files.forEach(function (filename) {
            let filedir = path.join(filePath,filename)
            if (getdir(filedir) == 'cfg') {
              try {
                let arr = fs.readFileSync(filedir).toString().split('|')
                fileArr.push({
                  filename: arr[0],
                  percent: parseInt(arr[1]),
                  filesize: arr[2],
                  md5: arr[3],
                })
              } catch (e) {}
            }
          })
          resolve(fileArr)
        }
      })
    })
  }
}

const download_url = (file, contents, items_paused) => {
  const {net} = require('electron')
  let params = {
    md5: file.md5,
    fileName: file.filename,
    bucketName: file.bucketName,
    uid: file.uid,
  }
  if (file.key) {
    Object.assign(params, {key: file.key})
  }
  let body = JSON.stringify(params)

  const request = net.request({
    url: `${domain}/v1/mideastore/service/file/down`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  })
  request.on('response', (response) => {
    let body = ''
    response.on('data', (chunk) => {
      body += chunk
    })
    response.on('end', () => {
      try {
        body = typeof body == 'string' ? JSON.parse(body) : body
        console.log(body)
        Object.assign(file, {
          url: body.result.downloadurl
        })
      chunk_download(file, contents, items_paused)
      } catch (e) { console.log(e) }
    })
  })
  request.write(body)
  request.end()
}

let downloadList = []
const downloadItem = (list, contents) => {
  list.forEach(e => {
    if (e.filetype == 1) {
      downloadList.push(e)
    }
    if (e.subinfos) {
      downloadItem(e.subinfos, contents)
    }
  })
}

const fileList = (downloadFlag, contents) => {
  const {net} = require('electron')
  let params = {
    downloadFlag: downloadFlag
  }
  let body = JSON.stringify(params)
  const request = net.request({
    url: `${domain}/v1/mideastore/service/download/listdir`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    }
  })
  request.on('response', (response) => {
    let body = ''
    response.on('data', (chunk) => {
      body += chunk
    })
    response.on('end', () => {
      try {
        body = typeof body == 'string' ? JSON.parse(body) : body
        let list = body.result.subinfos
        downloadList = []
        downloadItem(list, contents)
        contents.send('download', downloadList)
      } catch (e) { console.log(e) }
    })
  })
  request.write(body)
  request.end()
} 

//get 
const getdir = (url) => {
  var arr = url.split('.')
  var len = arr.length
  return arr[len-1]
}

export {
  chunk_download,
  download,
  getList,
  download_url,
  fileList,
}