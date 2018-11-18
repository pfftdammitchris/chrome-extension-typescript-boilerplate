const fn = (function() {
  // Tab object: https://developer.chrome.com/extensions/tabs#type-Tab
  function getActiveTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      callback(activeTab)
    })
  }

  // Returns the web host/app if it's currently supported. Returns null otherwise.
  function getWebApp(url, query) {
    let webApp
    const supportedWebs = Object.keys(supportedWebFeatures)
    for (let i = 0; i < supportedWebs.length; i++) {
      const web = supportedWebs[i]
      if (url.indexOf(web) !== -1) {
        const supportedQueries = supportedWebFeatures[web]
        if (supportedQueries.includes(query)) {
          webApp = web
          return webApp
        }
      }
    }
    if (!webApp) return false
  }

  // Loops through the list of supported web keys and returns a boolean if the query is supported.
  function isQuerySupported(url, query) {
    const supportedWebs = Object.keys(supportedWebFeatures)
    for (let i = 0; i < supportedWebs.length; i++) {
      const web = supportedWebs[i]
      if (url.indexOf(web) !== -1) {
        const supportedQueries = supportedWebFeatures[web]
        if (supportedQueries.includes(query)) {
          return true
        }
      }
    }
    return false
  }

  // Pass in HTML as a string and retrieve it as a node.
  function createHtmlNode(htmlString) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = htmlString
    return wrapper
  }

  return {
    getActiveTab,
    getWebApp: function(url, query) {
      if (!url) throw new Error('Missing URL as a parameter.')
      if (!query) throw new Error('Missing query as a parameter.')
      return getWebApp(url, query)
    },
    supportsQuery: function(url, query) {
      if (!url) throw new Error('Missing URL as a parameter.')
      if (!query) throw new Error('Missing query as a parameter.')
      return isQuerySupported(url, query)
    },
    htmlToNode: function(htmlString) {
      if (!htmlString) throw new Error('Missing htmlString parameter.')
      return createHtmlNode(htmlString)
    },
  }
})()
