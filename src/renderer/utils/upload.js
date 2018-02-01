import { SparkMD5 } from './spark-md5'

const getmd5 = function(file, chunk_size){
  const promise = new Promise((resolve, reject) => {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
    let total_num = file.size < chunk_size ? 1 : file.size % chunk_size == 0 ? file.size /chunk_size : file.size /chunk_size + 1
    //向下取整数
    let chunks = Math.floor(total_num)
    let code_time = 0
    let spark = new SparkMD5.ArrayBuffer()
    let fileReader = new FileReader()
    //
    fileReader.onload = function(e){
      spark.append(e.target.result)
      code_time++
      if (code_time < 2){
        loadNext(chunks -1)
      } else {
        let res= spark.end()
        resolve(res)
      }
    }
    fileReader.onerror = function(){
      reject("文件 "+ file.name +" md5计算出错.")
    }
    function loadNext(currentChunk){
      let start = currentChunk * chunk_size,
        end = ((start + chunk_size) >= file.size) ? file.size : start + chunk_size
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
    }
    loadNext(0)
  })
  return promise
}

const get_chunkSize = function (fileSize) {
  let size = 512 * 1024
  if(fileSize > 50 * 1024 * 1024){
    size = 4 * 1024 * 1024;
  }
  if(fileSize > 4 * 1024 * 1024 * 1024){
    size = 8 * 1024 * 1024;
  }
  return size
}

const getFileType = function(fileName){
  var videoType = ['avi','rmvb','rm','asf','divx','mpg','mpeg','mpe','wmv','mp4','vob','flv','mov','mkv'];
  var musicType = ['wav','aif','au','mp3','ram','wma','mmf','amr','aac','flac'];
  var pictureType = ['bmp','gif','jpg','jpeg','pic','png','tif','ico'];
  var docType = ['doc', 'docx', 'txt', 'conf', 'xls', 'xlsx', 'pdf', 'ppt', 'pptx'];
  var suffixArray = fileName.split('.');
  var suffix = suffixArray[suffixArray.length-1];
  suffix = suffix.toLowerCase();
  if(videoType.indexOf(suffix) != -1){
    return '4';
  }else if(musicType.indexOf(suffix) != -1){
    return '3';
  }else if(pictureType.indexOf(suffix) != -1){
    return '1';
  }else if(docType.indexOf(suffix) != -1){
    return '2';
  }else{
    return '5';
  }
}

export {
  getmd5,
  get_chunkSize,
  getFileType
}
