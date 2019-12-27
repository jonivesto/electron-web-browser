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
    <div onclick="activateTab(this.id)" class="tab" id="tab-`+id+`"><div class="tab-favicon"></div><span class="tab-title">`
      +url+`</span><button type="button" class="close-tab-btn" onclick="closeTab(this)"></button>
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

require('electron').ipcRenderer.on('updateAdressValue', (event, value) => {
  $('#address-bar').val(value)
})

require('electron').ipcRenderer.on('tabUpdateTitle', (event, data) => {
  $('#tab-'+data.id+'>.tab-title').html(data.title)
})

require('electron').ipcRenderer.on('tabUpdateFavicon', (event, data) => {
  $('#tab-'+data.id+'>.tab-favicon').css('background-image','url('+data.url+')')
})

require('electron').ipcRenderer.on('historyBtnStatus', (event, data) => {
  $('#prev-page-btn').prop('disabled', data.back);
  $('#next-page-btn').prop('disabled', data.forward);
})

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
  // Get value
  let value = $('#address-bar').val()
  // Unfocus
  $('#address-bar').blur()
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
      remote.getGlobal('Maximize')(remote.getCurrentWindow())
  })

  document.getElementById('prev-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('PrevPage')({
        win: remote.getCurrentWindow(),
        id: activeTab
      })
  })

  document.getElementById('next-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('NxtPage')({
        win: remote.getCurrentWindow(),
        id: activeTab
      })
  })

  document.getElementById('refresh-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('RefreshPage')({
        win: remote.getCurrentWindow(),
        id: activeTab
      })
  })

  document.getElementById('new-tab-btn').addEventListener('click', function (event) {
      remote.getGlobal('NewTab')(remote.getCurrentWindow())
  })
}
