/* -------------------------------------------------------
  ---- Initialize context menus on installation
-------------------------------------------------------- */

chrome.runtime.onInstalled.addListener((port) => {
  const contexts = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio',
  ]

  chrome.contextMenus.create({
    title: 'ChromezContext',
    id: 'chromez',
    contexts: [...contexts, 'browser_action'],
  })

  chrome.contextMenus.create({
    title: 'Inside ChromezContext Testing',
    id: 'cctest',
    parentId: 'chromez',
    contexts,
  })
})

/* -------------------------------------------------------
  ---- Context menu listeners
-------------------------------------------------------- */

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('addListener info arg for contextMenu: ', info)
  console.log('addListener tab arg for contextMenu: ', tab)
  const isIncognito = !!tab.incognito
})
