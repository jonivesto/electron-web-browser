//.########.##.......########..######..########.########...#######..##....##
//.##.......##.......##.......##....##....##....##.....##.##.....##.###...##
//.##.......##.......##.......##..........##....##.....##.##.....##.####..##
//.######...##.......######...##..........##....########..##.....##.##.##.##
//.##.......##.......##.......##..........##....##...##...##.....##.##..####
//.##.......##.......##.......##....##....##....##....##..##.....##.##...###
//.########.########.########..######.....##....##.....##..#######..##....##

// Remote reference to electron
const remote = require('electron').remote

// JQuery import
window.$ = window.jQuery = require('jquery')

// Hold currently active tab here as integer ID
let activeTab;

// Run on page loaded
$(function(){
  initWindowControls()
  // Create a tab if none exist
  if($('.tab').length==0){
    remote.getGlobal('NewTab')(remote.getCurrentWindow())
  }
})

// Closes tab. Takes tab's close button as param
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
  if($('.tab').length == 0){
    remote.getGlobal('CloseWindow')(remote.getCurrentWindow())
  }
  // Set active tab
  else {
    setTimeout(function () {
      activateTab(document.getElementsByClassName('tab')[0].id)
    }, 50);
  }

  // Run fixes
  tabButtonFix()
  activeTabFix()
}

// When new tab is added, or order is changed from whatever reason,
// this function makes sure that new tab button is always the last element in tab bar
function tabButtonFix(){
  // Re-create the button
  $('#new-tab-btn').remove()
  $('#tabs-container').append(`<button type="button" name="new-tab" id="new-tab-btn">+</button>`)
  // Add listener for the button
  document.getElementById('new-tab-btn').addEventListener('click', function (event) {
      remote.getGlobal('NewTab')(remote.getCurrentWindow())
  })
}

// Adds new tab to current window
function addTab(id, url){
  activeTab = id
  $('#tabs-container').append(`
    <div onclick="activateTab(this.id)" class="tab" id="tab-`+id+`"><div class="tab-favicon"></div><span class="tab-title">`
      +url+`</span><button type="button" class="close-tab-btn" onclick="closeTab(this)"></button>
    </div>`);
  // New tab fixes
  tabButtonFix()
  activeTabFix()
}
// Use this to call addTab() from main.js
require('electron').ipcRenderer.on('addTab', (event, data) => {
  addTab(data.id, data.url)
})

// Highlight active tab when it is activated
function activeTabFix(){
  $(".active-tab").removeClass("active-tab")
  $("#tab-"+activeTab).addClass("active-tab")
}

// Update adress bar value
// This is called in many different events on main.js
require('electron').ipcRenderer.on('updateAdressValue', (event, value) => {
  // In case of new tab, just clear the field
  if(value.includes('new-tab-page')){
    $('#address-bar').val('')
  }
  // Update value
  else {
    $('#address-bar').val(value)
  }
})
// Update tab title when it is loaded
require('electron').ipcRenderer.on('tabUpdateTitle', (event, data) => {
  $('#tab-'+data.id+'>.tab-title').html(data.title)
})
// Update tab favicon when it's loaded
require('electron').ipcRenderer.on('tabUpdateFavicon', (event, data) => {
  $('#tab-'+data.id+'>.tab-favicon').css('background-image','url('+data.url+')')
})

function updateUrlBarButtons(options){
  // disable buttons when there is no actions available
  $('#prev-page-btn').prop("disabled", !options.canGoBack);
  $('#next-page-btn').prop("disabled", !options.canGoForward);

  if(options.pageReady){
    // page is loaded and can use refresh
    $('#refresh-page-btn').css('background-image','url(../img/refresh.png)')
  } else {
    // page load in progress and can be cancelled
    $('#refresh-page-btn').css('background-image','url(../img/close.png)')
    // set loader animation when loading starts
    $('#tab-'+options.id+'>.tab-favicon').css('background-image','url("../img/loader.gif")')
  }
}
require('electron').ipcRenderer.on('updateUrlBarButtons', (event, options) => {
  updateUrlBarButtons(options)
})

// Activates tab with ID
function activateTab(id){
  let integerID = id.split('-')[1]
  activeTab = Number(integerID)
  remote.getGlobal('ActivateTab')({
    win: remote.getCurrentWindow(),
    id: integerID
  })
  activeTabFix()
}

// This is called when user hits enter key on address bar input
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

// Add listeners for window controls
function initWindowControls(){
  // Address bar submit by pressing enter key
  $('#address-bar').on('keypress', function (e) {
    if(e.which === 13){
      submitAddressBar()
    }
  });
  // Close button
  document.getElementById('close-app-btn').addEventListener('click', function (event) {
      remote.getCurrentWindow().close()
  })
  // Minimize button
  document.getElementById('hide-app-btn').addEventListener('click', function (event) {
      remote.getCurrentWindow().minimize()
  })
  // Maximize / restore button
  document.getElementById('maximize-app-btn').addEventListener('click', function (event) {
      remote.getGlobal('Maximize')(remote.getCurrentWindow())
  })
  // Go back button
  document.getElementById('prev-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('PrevPage')({
        win: remote.getCurrentWindow(),
        id: activeTab
      })
  })
  // Go forward button
  document.getElementById('next-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('NxtPage')({
        win: remote.getCurrentWindow(),
        id: activeTab
      })
  })
  // Refresh button
  document.getElementById('refresh-page-btn').addEventListener('click', function (event) {
      remote.getGlobal('RefreshPage')({
        win: remote.getCurrentWindow(),
        id: activeTab
      })
  })
  // New tab button
  document.getElementById('new-tab-btn').addEventListener('click', function (event) {
      remote.getGlobal('NewTab')(remote.getCurrentWindow())
  })
}
