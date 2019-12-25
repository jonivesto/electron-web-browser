// Remote reference to electron
const remote = require('electron').remote

// JQuery import
window.$ = window.jQuery = require('jquery')

// Run on view loaded
$(function(){
  initWindowControls()
})

function closeTab(tab){
  remote.getGlobal('CloseTab')({
    win: remote.getCurrentWindow(),
    tab: tab
  })
}

function submitAddressBar(){
  let value = $('#address-bar').val()
  // TODO: Detect if url or search
  // Go to URL
  if(true){
    remote.getGlobal('LoadURL')({
      win: remote.getCurrentWindow(),
      tab: tab,
      url: value
    })
  } else {
    // Do search
    remote.getGlobal('Search')({
      win: remote.getCurrentWindow(),
      tab: tab,
      url: value
    })
  }
}

// add listeners buttons
function initWindowControls(){
  document.getElementById('close-app-btn').addEventListener('click', function (event) {
      remote.getCurrentWindow().close()
  })

  document.getElementById('hide-app-btn').addEventListener('click', function (event) {
      remote.getCurrentWindow().minimize()
  })

  document.getElementById('maximize-app-btn').addEventListener('click', function (event) {
      remote.getCurrentWindow().maximize()
  })

  document.getElementById('prev-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('PrevPage')(remote.getCurrentWindow())
  })

  document.getElementById('next-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('NxtPage')(remote.getCurrentWindow())
  })

  document.getElementById('refresh-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('RefreshPage')(remote.getCurrentWindow())
  })

  document.getElementById('new-tab-btn').addEventListener('click', function (event) {
      remote.getGlobal('NewTab')(remote.getCurrentWindow())
  })
}
