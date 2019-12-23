// Remote reference to electron
const remote = require('electron').remote

// JQuery
window.$ = window.jQuery = require('jquery');

// Run on view loaded
$(function(){
  initWindowControls()
})

// add listeners for frame's buttons buttons
function initWindowControls(){
  document.getElementById('close-app-btn').addEventListener('click', function (event) {
      var window = remote.getCurrentWindow();
      window.close();
  })

  document.getElementById('hide-app-btn').addEventListener('click', function (event) {
      var window = remote.getCurrentWindow();
      window.minimize();
  })

  document.getElementById('maximize-app-btn').addEventListener('click', function (event) {
      var window = remote.getCurrentWindow();
      window.maximize();
  })
}
