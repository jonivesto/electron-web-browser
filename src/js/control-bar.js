// Remote reference to electron
const remote = require('electron').remote

// JQuery import
window.$ = window.jQuery = require('jquery')

let activeTab;

// Run on view loaded
$(function(){
  initWindowControls()
  // Create one tab if none exist
  if($('.tab').length==0){
    remote.getGlobal('NewTab')(remote.getCurrentWindow())
  }
})

function closeTab(btn){
  // Get tab id
  let tab = $(btn).parent().attr('id').split('-')[1]
  // Remove parent element
  $(btn).parent().remove()
  // Close browserview
  remote.getGlobal('CloseTab')({
    win: remote.getCurrentWindow(),
    id: tab
  })

  // If last tab was closed
  if($('.tab').length==0){
    remote.getGlobal('CloseWindow')(remote.getCurrentWindow())
  }
  // Set active tab
  else {
    setTimeout(function () {
      activateTab(document.getElementsByClassName('tab')[0].id)
    }, 50);
  }

  // New tab btn fix
  tabButtonFix()
  activeTabFix()
}

function tabButtonFix(){
  $('#new-tab-btn').remove()
  $('#tabs-container').append(`<button type="button" name="new-tab" id="new-tab-btn">+</button>`)

  document.getElementById('new-tab-btn').addEventListener('click', function (event) {
      remote.getGlobal('NewTab')(remote.getCurrentWindow())
  })
}

function addTab(id, url){
  activeTab = id
  $('#tabs-container').append(`
    <div onclick="activateTab(this.id)" class="tab" id="tab-`+id+`">`
      +url+`<button type="button" class="close-tab-btn" onclick="closeTab(this)">x</button>
    </div>`);
  // New tab btn fix
  tabButtonFix()
  activeTabFix()
}
require('electron').ipcRenderer.on('addTab', (event, data) => {
  addTab(data.id, data.url)
})

function activeTabFix(){
  $(".active-tab").removeClass("active-tab")
  $("#tab-"+activeTab).addClass("active-tab")
}

function activateTab(id){
  let integerID = id.split('-')[1]
  activeTab = Number(integerID)
  remote.getGlobal('ActivateTab')({
    win: remote.getCurrentWindow(),
    id: integerID
  })
  activeTabFix()
}

function submitAddressBar(){
  let value = $('#address-bar').val()
  // Go to URL
  if(false){
    remote.getGlobal('LoadURL')({
      win: remote.getCurrentWindow(),
      id: activeTab,
      url: value
    })
  } else {
    // Do search
    remote.getGlobal('Search')({
      win: remote.getCurrentWindow(),
      id: activeTab,
      url: value
    })
  }
}

// add listeners buttons
function initWindowControls(){
  $('#address-bar').on('keypress', function (e) {
    if(e.which === 13){
      submitAddressBar()
    }
  });

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
