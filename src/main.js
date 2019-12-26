const { app, BrowserWindow, BrowserView } = require('electron')
const debug = false

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = []

function newWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1000,
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

  // add to windows array
  windows.push(win)

  // and load the index.html of the app.
  win.loadFile('src/html/control-bar.html')

  // Open the DevTools.
  if(debug) win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show()
  })

  // Resize tabs when window is resized
  win.on('resize', () => {
    if( windows.length == 0 ) return
    let size = win.getSize()
    // Only resize tabs that are child of this window
    let childTabs = win.getBrowserViews()
    for (var i = 0; i < childTabs.length; i++) {
      childTabs[i].setBounds({
        x: 0,
        y: 70,
        width: size[0],
        height: size[1] - 70
      })
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', newWindow)

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
  if (windows.length == 0) {
    newWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here
function newTab(parentWindow, url){
  // Create new tab as BrowserView
  tab = new BrowserView()
  // Set parent it belongs to
  parentWindow.addBrowserView(tab)
  // Match parent size
  let size = parentWindow.getSize()
  tab.setBounds({
    x: 0,
    y: 70,
    width: size[0],
    height: size[1] - 70
  })

  // Open URL
  if(url == null){
    tab.webContents.loadFile('src/html/new-tab-page.html')
  }else {
    tab.webContents.loadURL(url)
  }


  // Add tab to the control-bar
  parentWindow.webContents.send('addTab', {
    id: tab.id,
    url: 'New tab'
  })
}

// Global functions
global.PrevPage = function(win){

}

global.NxtPage = function(win){

}

global.RefreshPage = function(win){

}

global.ActivateTab = function(data){
  console.log('activate tab with ID ' + data.id);
  let tabs = data.win.getBrowserViews()
  for (var i = 0; i < tabs.length; i++) {
    let win = data.win
    if(tabs[i].id==data.id) {
      win.removeBrowserView(tabs[i])
      win.addBrowserView(tabs[i])
    }
  }
}

global.NewTab = function(win){
  console.log('open new tab')
  newTab(win, null)
}

global.CloseTab = function(data){
  console.log('close tab with ID ' + data.id);
  let tabs = data.win.getBrowserViews()
  for (var i = 0; i < tabs.length; i++) {
    let win = data.win
    if(tabs[i].id==data.id) {
      win.removeBrowserView(tabs[i])
      tabs[i].destroy()
    }
  }
}

global.NewWindow = function(){
  console.log('open new window');
  newWindow()
}

global.CloseWindow = function(win){
  win.close()
}

global.Search = function(data){
  let tabs = data.win.getBrowserViews()
  let targetURL = 'https://www.google.com/search?q='+data.url.replace(' ', '+')
  // If no tabs, open new one
  if(tabs.length == 0){
    newTab(data.win, targetURL)
  }
  // If there are tabs, use current tab
  else {
    for (var i = 0; i < tabs.length; i++) {
      let win = data.win
      if(tabs[i].id==data.id) {
        tabs[i].webContents.loadURL(targetURL)
      }
    }
  }
}

global.LoadURL = function(data){
  let tabs = data.win.getBrowserViews()
  // If no tabs, open new one
  if(tabs.length == 0){
    newTab(data.win, data.url)
  }
  // Or just use current tab
  else {
    for (var i = 0; i < tabs.length; i++) {
      let win = data.win
      if(tabs[i].id==data.id) {
        tabs[i].webContents.loadURL(data.url)
      }
    }
  }
}
