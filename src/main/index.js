import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { chunk_download, download, getList, download_url, fileList } from './file'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let contents
  
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  global.size = mainWindow.getSize()

  mainWindow.loadURL(winURL)

  contents = mainWindow.webContents
  let session = contents.session
  let items_paused = []
  let items_canceled = []
  let item_preview = ['']

  //dialog.showSaveDialog({})
  //session.setDownloadPath('/tmp')
  session.cookies.get({}, (error, cookies) => {
    console.log(error, cookies)
  })

  ipcMain.on('item:file', function(e, params) {
    let msg = params.msg
    let file = params.file
    if (msg == 'pause'){
      items_paused.push(file.filename)
    } else if (msg == 'resume') {
      let index = items_paused.indexOf(file.filename)
      items_paused.splice(index , 1)
      //chunk_download(file, contents, items_paused)
      download_url(file, contents, items_paused)
    } else if (msg == 'cancel') {
      items_canceled.push(file.filename)
    } else if (msg == 'preview') {
      item_preview[0] = file.filename
    } else if (msg == 'download') {
      //chunk_download(file, contents, items_paused)
      //download(mainWindow, file.url)
      file.forEach(e => {
        download_url(e, contents, items_paused)
      })
    }
  })
  ipcMain.on('fullScreen', function(e, flag) {
    mainWindow.setFullScreen(flag)
  })

  session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
    item.setSavePath('/tmp'+`\\${item.getFilename()}`)
    let name = item.getFilename()

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        //console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (items_canceled.includes(name)) {
          item.cancel()
        } else {
          if (items_paused.includes(name)) {
            item.pause()
          } else {
            console.log(item.getReceivedBytes() / item.getTotalBytes())
            //mainWindow.setProgressBar(item.getReceivedBytes() / item.getTotalBytes())
            contents.send('download-reply', name, item.getReceivedBytes())
            item.resume()
          }
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        if (item_preview.includes(name)) {
          shell.openItem('D:\\tmp\\' + name)
        }
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  contents.on('did-finish-load', () => {
    //fileList("DOWN_FILE_LIST_FLAG__a332c1bc86477fc3784a7923f2741db3", contents)
    
    try {  
      /*let str = decodeURI(process.argv.slice(1)[0])
      downloadList = JSON.parse(str.slice(11, str.length - 1))*/

      let str = process.argv.slice(1)[0]
      let downloadFlag = str.slice(11, str.length - 1)
      fileList(downloadFlag, contents)
    } catch (e) { console.log(e) }
      getList().then(data => {
        for (let i = 0; i < data.length; i += 1) {
          items_paused.push(data[i].filename)
        }
        contents.send('download', data)
      })
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.setAsDefaultProtocolClient('electron')
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    let str = commandLine.slice(1)[0]
    let downloadFlag = str.slice(11, str.length - 1)
    fileList(downloadFlag, contents)
    try {
      /*let str = commandLine.slice(1)[0]
      let downloadFlag = str.slice(11, str.length - 1)
      fileList(downloadFlag, contents)*/

      //dialog.showErrorBox('', commandLine.slice(1)[0])
    } catch (e) { console.log(e) }
  }
})

if (shouldQuit) {
  app.quit()
}

app.on("open-url", function(event, url) {
  try {
      downloadList = JSON.parse(url)
      contents.send('download', downloadList)
      //dialog.showErrorBox('', downloadList)
    } catch (e) { console.log(e) }
})

export {
  contents
}


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
