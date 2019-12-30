export function dispatch({
  type,
  tabId,
  ...args
}: {
  type: string
  tabId: string
}) {
  return chrome.tabs.sendMessage(tabId, { type, ...args }, (response: any) => {
    console.log('Response received: ', response)
  })
}

export function getActiveTab(cb: (tab: any) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
    const activeTab = tabs[0]
    cb(activeTab)
  })
}
