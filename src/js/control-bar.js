// Remote reference to electron
const remote = require('electron').remote

// JQuery
window.$ = window.jQuery = require('jquery');

// Run on view loaded
$(function(){
  initWindowControls()
})

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
      remote.getGlobal('PrevPage')()
  })

  document.getElementById('next-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('NxtPage')()
  })

  document.getElementById('refresh-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('RefreshPage')()
  })

  document.getElementById('new-tab-btn').addEventListener('click', function (event) {
      remote.getGlobal('NewTab')()
  })
}
