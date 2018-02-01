import axios from 'axios'
import { getmd5, get_chunkSize, getFileType } from '@/utils/upload'

let domain = 'http://172.20.32.159'

const sendList = params => {
  return axios.post(`${domain}/v1/mideastore/service/share/get/list`, params)
}
const receiveList = params => {
  return axios.post(`${domain}/v1/mideastore/service/share/receive/list`, params)
}


export {
  sendList,
  receiveList,
}
