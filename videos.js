const vids = (function() {
  let tabId, query, web

  function setTab(id) {
    if (!id) {
      throw new Error('setTab() needs to be passed an id argument.')
    }
    tabId = id
  }

  /** Sets the query
   * @param { string } id - Query
   */
  function setQuery(id, webApp) {
    if (!id) {
      throw new Error('setQuery() needs to be passed an id argument.')
    }
    if (webApp) web = webApp

    switch (id) {
      case 'highest':
        query = 'get-highest'
        break
      default:
        query = null
    }
  }

  function setWeb(webApp) {
    if (!webApp) {
      throw new Error('setWeb() needs to be passed a webApp argument.')
    }
    web = webApp
  }

  /** Sends a message to the content script's listener.
   * @param { object } additionalArgs - (Optional) additional arguments passed to the options parameter for tabs.sendMessage().
   * @param { function } callback - (Optional) callback invoked after tabs.sendMessage() completes
   */
  function download(additionalArgs, callback) {
    if (typeof additionalArgs === 'function') {
      callback = additionalArgs
      additionalArgs = Object.create(additionalArgs)
    }
    chrome.tabs.sendMessage(tabId, { query, web, ...additionalArgs }, callback)
  }

  return {
    setTab: function(...args) {
      setTab(...args)
      return vids
    },
    setQuery: function(...args) {
      setQuery(...args)
      return vids
    },
    setWeb: function(...args) {
      setWeb(...args)
      return vids
    },
    download: function(...args) {
      download(...args)
      return vids
    },
  }
})()
