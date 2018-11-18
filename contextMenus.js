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
    title: 'Snake',
    id: 'snake',
    contexts: [...contexts, 'browser_action'],
  })

  chrome.contextMenus.create({
    title: 'SB video download',
    id: 'highest',
    parentId: 'snake',
    contexts,
  })
})

/* -------------------------------------------------------
  ---- Context menu listeners
-------------------------------------------------------- */

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const isSpankbang = /spankbang.com/i.test(tab.url)
  const incognito = !!tab.incognito

  if (isSpankbang) {
    fn.downloadVideo({
      tabId: tab.id,
      query: info.menuItemId,
      webApp: 'spankbang',
      callback: (url) => console.log(`%c${url}`, 'color:blue'),
    })
  }
})
