/*
  Downloads API:
    https://developer.chrome.com/extensions/downloads#method-download
*/

const portApi = (function() {
  const _store = {}

  const storeHelpers = {
    get(key) {
      const args = Array.prototype.slice.call(arguments, 0)
      // Allow the caller to choose to receive the store if they don't pass anything in
      if (args.length === 0) {
        return this
      }
      const val = _store[key]
      if (val) {
        return val
      } else {
        console.warn(
          `Warning! You tried to retrieve store[${key}] but it was null or undefined`,
        )
      }
    },
    set(key, value) {
      if (!key) {
        return console.warn(
          `Warning! You tried to set "${key}" on the store but it was not valid`,
        )
      } else {
        _store[key] = value
      }
      return this
    },
  }

  return {
    store: storeHelpers,
  }
})()

const store = portApi.store

/* -------------------------------------------------------
  ---- PREPARATION
-------------------------------------------------------- */

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
      title: 'View photos',
      id: 'instagram-post-photos',
      contexts: [...contexts, 'browser_action'],
    },
    {
      title: 'Get media links',
      id: 'pornhub-get-video-links',
      contexts: [...contexts, 'browser_action'],
    },
  ]
  createContextMenus(menus)
})

// Invoked when we connected to the client side
chrome.runtime.onConnect.addListener((port) => {
  //
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
