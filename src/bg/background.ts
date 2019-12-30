/*
  Downloads API:
    https://developer.chrome.com/extensions/downloads#method-download
*/

import * as c from '../constants'
import './commands'
import './contextMenus'

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
      title: 'My context menu item',
      id: c.MY_CONTEXT_MENU_ITEM,
      contexts: [...contexts, 'browser_action'],
    },
  ]
  menus.forEach((menu) => chrome.contextMenus.create(menu))
})

chrome.runtime.onMessage.addListener((msg: string) => {
  console.log(msg)
})

/* -------------------------------------------------------
  ---- ICONS
-------------------------------------------------------- */

chrome.browserAction.onClicked.addListener((tab: any) => {
  console.log(`Browser action icon clicked. Here is the tab: ${tab}`)
})
