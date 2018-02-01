//根据文件名获取文件类型，返回对应的css类名
const getFileTypeByFileName = function(fileName){
  let videoType = ['avi','rmvb','rm','asf','divx','mpg','mpeg','mpe','wmv','mp4','vob','flv','mov','mkv'];
  let musicType = ['wav','aif','au','mp3','ram','wma','mmf','amr','aac','flac'];
  let pictureType = ['bmp','gif','jpg','jpeg','pic','png','tif','ico'];
  let compassType = ['rar','zip','arj','gz','z'];
  let suffixArray = fileName.split('.');
  let suffix = suffixArray[suffixArray.length-1];
  suffix = suffix.toLowerCase();
  if(suffix.charAt(suffix.length-1) == '等'){
    return 'shares';
  }else if(videoType.indexOf(suffix) != -1){
    return 'video';
  }else if(musicType.indexOf(suffix) != -1){
    return 'music';
  }else if(suffix == "jpg" || suffix == "jpeg"){
    return 'jpg';
  }else if(suffix == "png"){
    return 'png';
  }else if(suffix == "gif"){
    return 'gif';
  }else if(suffix == "bmp"){
    return 'bmp';
  }else if(suffix == "ico"){
    return 'ico';
  }else if(suffix == "zip"){
    return 'zip';
  }else if(suffix == 'doc' || suffix == 'docx'){
    return 'doc';
  }else if(suffix == 'xls' || suffix == 'xlsx'){
    return 'xls';
  }else if(suffix == 'ppt' || suffix == 'pptx'){
    return 'ppt';
  }else if(suffix == 'pdf'){
    return 'pdf';
  }else if(suffix == 'txt'){
    return 'txt';
  }else if(compassType.indexOf(suffix) != -1){
    return 'rar';
  }else if(pictureType.indexOf(suffix) != -1){
    return 'img';
  }else{
    return 'other';
  }
}
const doSave = function(value, type, name) {
  let blob;
  if (typeof window.Blob == "function") {
    blob = new Blob([value], {type: type});
  } else {
    let BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
    let bb = new BlobBuilder();
    bb.append(value);
    blob = bb.getBlob(type);
  }
  let URL = window.URL || window.webkitURL;
  let bloburl = URL.createObjectURL(blob);
  doDownload(bloburl)
}
const doDownload = function (bloburl) {
  let anchor = document.createElement("a");
  if ('download' in anchor) {
    anchor.style.visibility = "hidden";
    anchor.href = bloburl;
    anchor.download = name;
    document.body.appendChild(anchor);
    let evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    anchor.dispatchEvent(evt);
    document.body.removeChild(anchor);
  } else if (navigator.msSaveBlob) {
    //navigator.msSaveBlob(blob, name);
    location.href = bloburl;
  } else {
    location.href = bloburl;
  }
}
const clear = function(f){
  if(f.value){
    try{
      f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
    }catch(err){
    }
    if(f.value){ //for IE5 ~ IE10
      var form = document.createElement('form'), ref = f.nextSibling, p = f.parentNode;
      form.appendChild(f);
      form.reset();
      p.insertBefore(f,ref);
    }
  }
}

export {
  getFileTypeByFileName,
  doSave,
  doDownload,
  clear,
}
