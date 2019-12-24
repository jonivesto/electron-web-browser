const { app, BrowserWindow, BrowserView } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, tabs = []

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 300,
    minHeight: 300,
    fullscreenable: true,
    movable: true,
    resizable: true,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('src/html/control-bar.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  // Open tab
  newTab();

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show()
  })

  // Resize tabs when window is resized
  win.on('resize', () => {
    if( tabs.length == 0 || win == null ) return
    let size = win.getSize()
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setBounds({ x: 0, y: 70, width: size[0], height: size[1] - 70 })
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function newTab(){
  // Creste DOM area
  tab = new BrowserView()
  tabs.push(tab)
  win.setBrowserView(tab)
  tab.setBounds({ x: 0, y: 70, width: 900, height: 530 })
  tab.webContents.loadURL('https://electronjs.org')
  //dom.webContents.openDevTools()
}

// Global functions
global.PrevPage = function(){

}

global.NxtPage = function(){

}

global.RefreshPage = function(){

}

global.NewTab = function(){
  newTab()
}
