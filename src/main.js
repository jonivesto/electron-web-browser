//.########.##.......########..######..########.########...#######..##....##
//.##.......##.......##.......##....##....##....##.....##.##.....##.###...##
//.##.......##.......##.......##..........##....##.....##.##.....##.####..##
//.######...##.......######...##..........##....########..##.....##.##.##.##
//.##.......##.......##.......##..........##....##...##...##.....##.##..####
//.##.......##.......##.......##....##....##....##....##..##.....##.##...###
//.########.########.########..######.....##....##.....##..#######..##....##

const { app, BrowserWindow, BrowserView } = require('electron')
const debug = false

// Keep global references of the window objects, if you don't, the windows will
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

  win.on('maximize', () => {
    win['maximizedState'] = true
  })

  win.on('unmaximize', () => {
    win['maximizedState'] = false
  })
  win.restore()

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

  // Update title event
  tab.webContents.on('page-title-updated', (event, title, explicitSet) => {
    parentWindow.webContents.send('tabUpdateTitle', {
      id: tab.id,
      title: title
    })
  })

  // Update favicon event
  tab.webContents.on('page-favicon-updated', (event, favicons) => {
    parentWindow.webContents.send('tabUpdateFavicon', {
      id: tab.id,
      url: favicons[0]
    })
  })

  // Event when page loading starts
  tab.webContents.on('did-start-loading', (event, url) => {
    parentWindow.webContents.send('updateUrlBarButtons', {
      id: tab.id,
      pageReady: false,
      canGoBack: tab.webContents.canGoBack(),
      canGoForward: tab.webContents.canGoForward()
    })
  })

  // Event when page loading is ready
  tab.webContents.on('did-stop-loading', (event, url) => {
    parentWindow.webContents.send('updateUrlBarButtons', {
      id: tab.id,
      pageReady: true,
      canGoBack: tab.webContents.canGoBack(),
      canGoForward: tab.webContents.canGoForward()
    })
  })

  // Event when page color changes
  tab.webContents.on('did-change-theme-color', (event, color) => {
    // TODO:
  })

  // Open URL
  if(url == null){
    tab.webContents.loadFile('src/html/new-tab-page.html')
  }else {
    tab.webContents.loadURL(url)
    parentWindow.webContents.send('updateAdressValue', url)
  }

  // Add tab to the control-bar
  parentWindow.webContents.send('addTab', {
    id: tab.id,
    url: 'NewTab'
  })
}

// Returns tab with id in specific window
// @param win | BrowserWindow || parent window of the wanted tab
// @param id | int || id of the wanted tab
// @return BrowserView
function getTabWithID(win, id){
  let tabs = win.getBrowserViews()
  for (var i = 0; i < tabs.length; i++) {
    if(tabs[i].id == id) {
      return tabs[i]
    }
  }
}

// Global functions:
//
//

global.PrevPage = function(data){
  let tab = getTabWithID(data.win, data.id)
  let win = data.win

  tab.webContents.goBack()
  win.webContents.send('updateAdressValue', tab.webContents.getURL())
}

global.NxtPage = function(data){
  let tab = getTabWithID(data.win, data.id)
  let win = data.win

  tab.webContents.goForward()
  win.webContents.send('updateAdressValue', tab.webContents.getURL())
}

global.RefreshPage = function(data){
  let tab = getTabWithID(data.win, data.id)
  let win = data.win

  tab.webContents.loadURL(tab.webContents.getURL())
  win.webContents.send('updateAdressValue', tab.webContents.reload())
}

global.ActivateTab = function(data){
  let tab = getTabWithID(data.win, data.id)
  let win = data.win

  if(tab == null) return
  console.log('activate tab with ID ' + data.id);

  win.removeBrowserView(tab)
  win.addBrowserView(tab)
  win.webContents.send('updateAdressValue', tab.webContents.getURL())
}

global.NewTab = function(win){
  console.log('open new tab')
  newTab(win, null)
}

global.CloseTab = function(data){
  console.log('close tab with ID ' + data.id);
  let tab = getTabWithID(data.win, data.id)
  let win = data.win

  win.removeBrowserView(tab)
  tab.destroy()
}

global.NewWindow = function(){
  console.log('open new window');
  newWindow()
}

global.CloseWindow = function(win){
  win.close()
}

global.Maximize = function(win){
  if(win.maximizedState){
    win.restore()
  } else {
    win.maximize()
  }
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
    let tab = getTabWithID(data.win, data.id)
    let win = data.win

    tab.webContents.loadURL(targetURL)
    win.webContents.send('updateAdressValue', targetURL)
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
    let tab = getTabWithID(data.win, data.id)
    let win = data.win
    let targetURL = data.url

    tab.webContents.loadURL(targetURL)
    win.webContents.send('updateAdressValue', targetURL)
  }
}
