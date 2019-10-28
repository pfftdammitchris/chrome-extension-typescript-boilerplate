/*
  Downloads API:
    https://developer.chrome.com/extensions/downloads#method-download
*/

function ensureSendMessage(tabId, message, callback) {
  chrome.tabs.sendMessage(tabId, { type: 'onload' }, function(response) {
    if (response && response.acknowledged) {
      chrome.tabs.sendMessage(tabId, message, callback)
      console.log('The client side has acknowledged!')
    }
    // The other end does not have a listener
    else {
      chrome.tabs.executeScript(
        tabId,
        { file: 'contentScripts/contentScripts.js' },
        function() {
          chrome.contextMenus.onClicked.addListener((info, tab) => {
            console.log(`Context menu onClick info parameter: `, info)
            console.log(`Context menu onClick tab parameter: `, tab)
            switch (info.menuItemId) {
              // INSTAGRAM
              // Must be on their profile page
              case INSTAGRAM_QUERY_PHOTOS:
                {
                  const { linkUrl, menuItemId, pageUrl } = info
                  const { id, title } = tab
                  let context
                  
                  if ()

                  dispatch(tab.id, {
                    type: INSTAGRAM_QUERY_PHOTOS,
                  })
                }

                break
              // PORNHUB
              // Must be on the video page
              case 'pornhub-get-video-links':
                dispatch(activeTab.id, {
                  type: 'pornhub-get-video-links',
                  ...info,
                })
                break
              default:
                break
            }
          })
        },
      )
    }
  })
}

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  ensureSendMessage(tabs[0].id, { type: 'onload' })
})

// Invokes right after the extension gets done being installed on their browser
chrome.runtime.onInstalled.addListener(() => {
  const contexts = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio',
  ]
  // onClicking these in the UI will send to contextMenu handlers
  const menus = [
    {
      title: 'Query IG Photos',
      id: INSTAGRAM_QUERY_PHOTOS,
      contexts: [...contexts, 'browser_action'],
    },
    {
      title: 'Query PH Links',
      id: 'pornhub-get-video-links',
      contexts: [...contexts, 'browser_action'],
    },
  ]
  createContextMenus(menus)
})

// Invoked when we connected to the client side
chrome.runtime.onConnect.addListener((port) => {
  console.log(`%cConnected to port: ${port}`, 'color:green;font-weight:bold;')
  if (port.name === 'chromez') {
    port.onMessage.addListener(console.log)
  }
})

chrome.runtime.onMessage.addListener((msg) => {
  console.log(msg)
})

/* -------------------------------------------------------
  ---- ICONS
-------------------------------------------------------- */

chrome.browserAction.onClicked.addListener((tab) => {
  console.log(`Browser action icon clicked. Here is the tab: ${tab}`)
})

function dispatch(tabId, { type, ...args } = {}) {
  return chrome.tabs.sendMessage(tabId, { type, ...args }, (response) => {
    console.log('Response received: ', response)
  })
}
