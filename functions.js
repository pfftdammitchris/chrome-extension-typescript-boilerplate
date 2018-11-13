const fn = (function() {
  return {
    downloadVideo: function downloadVideo({ tabId, query, webApp, callback }) {
      vids
        .setTab(tabId)
        .setQuery(query)
        .setWeb(webApp)
        .download(function(url) {
          const elem = document.createElement('input')
          elem.value = url
          document.body.appendChild(elem)
          elem.select()
          document.execCommand('copy')
          storage.push('videos', url)
          storage.save()
          if (typeof callback === 'function') {
            callback(url)
          }
        })
    },
  }
})()
