// Listen to tab changes from client side
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  console.log('onUpdated tab info: ', info)
  console.log('onUpdated tab tab: ', tab)
  chrome.tabs.connect(tabId, { name: 'chromez-bg' })

  switch (tab.status) {
    case 'complete':
      break
    default:
      break
  }
})
