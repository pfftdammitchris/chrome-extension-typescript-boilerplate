/*
  vids:
    Sets a web app to a website and makes functions available tailored to a supported website.
*/

const vids = (function() {
  let tabId, query, web

  function setTab(id) {
    tabId = id
  }

  /** Sets the query
   * @param { string } id - Query
   */
  function setQuery(q, webApp) {
    if (webApp) web = webApp
    query = q
  }

  function setWeb(webApp) {
    web = webApp
  }

  /** Downloads a video by running through background process document object
   * @param { function } callback - (Optional) callback invoked after downloading completes
   */
  function download(callback) {
    switch (web) {
      case 'spankbang':
        return spankbang.downloadVideo({ callback })
        break
      default:
        return null
    }
    return this
  }

  return {
    setTab: function(id) {
      if (!id) throw new Error('setTab() needs to be passed an id argument.')
      setTab(id)
      return this
    },
    setQuery: function(q, webApp) {
      if (!q) throw new Error('setQuery() needs to be passed a query argument.')
      setQuery(q, webApp)
      return this
    },
    setWeb: function(webApp) {
      if (!webApp)
        throw new Error('setWeb() needs to be passed a webApp argument.')
      setWeb(webApp)
      return this
    },
    download: function(callback) {
      return download.call(this, callback)
    },
  }
})()
