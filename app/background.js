/*
  Downloads API:
    https://developer.chrome.com/extensions/downloads#method-download
*/

const KINK_GET_PHOTOS = 'kink-get-photos'
const INSTAGRAM_POST_PHOTOS = 'instagram-query-post-photos'
const PORNHUB_GET_VIDEO_LINKS = 'pornhub-get-video-links'

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
      title: 'Query K Photos',
      id: KINK_GET_PHOTOS,
      contexts: [...contexts, 'browser_action'],
    },
    {
      title: 'Query IG Photos',
      id: INSTAGRAM_POST_PHOTOS,
      contexts: [...contexts, 'browser_action'],
    },
    {
      title: 'Query PH Links',
      id: 'pornhub-get-video-links',
      contexts: [...contexts, 'browser_action'],
    },
    {
      title: 'Query CC',
      id: 'candidcreeps-get-video',
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
