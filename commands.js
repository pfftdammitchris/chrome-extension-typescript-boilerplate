chrome.commands.onCommand.addListener((command) => {
  if (command === 'spankbang-video') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      const isSpankbang = /spankbang.com/i.test(activeTab.url)
      const incognito = !!activeTab.incognito

      if (isSpankbang) {
        fn.downloadVideo({
          tabId: activeTab.id,
          query: 'highest',
          webApp: 'spankbang',
          callback: (url) => console.log(`%c${url}`, 'color:blue'),
        })
      }
    })
  }
})
