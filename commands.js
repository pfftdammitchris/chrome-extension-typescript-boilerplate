chrome.commands.onCommand.addListener((command) => {
  // Send message to client side to display modal
  if (command === 'query-options') {
    fn.getActiveTab((tab) => {
      Port.init(tab.id)
      Port.postMessage({ query: command })
    })
  }
  // Ctrl + Z
  if (command === 'galleria') {
    fn.getActiveTab((tab) => {
      const webSupportsQuery = fn.supportsQuery(tab.url, command)
      const webApp = fn.getWebApp(tab.url, command)
      if (webSupportsQuery) {
        if (webApp === 'spankbang') {
          spankbang.galleria({ tab })
        }
        if (!webApp) {
          // Send a message to the tab to display not supported modal
          Port.postMessage({
            modal: {
              title: 'Not supported',
              message: 'This website does not have support for galleria yet.',
            },
          })
        }
      } else {
        // Send a message to the tab to display not supported modal
        Port.postMessage({
          modal: {
            title: 'Not supported',
            message:
              'This website does not have support for the Galleria feature yet.',
          },
        })
      }
    })
  }
  // Ctrl + Space
  if (command === 'snatch-video') {
    fn.getActiveTab((tab) => {
      const supportsWeb = fn.supportsQuery(tab.url, command)
      if (supportsWeb) {
        const web = fn.getWebApp(tab.url)
        if (web) {
          let body
          Port.postMessage(
            { query: 'get-html', selector: '#container' },
            (html) => {
              const elem = fn.htmlToNode(html)
              const newBodyElem = document.createElement('body')
              newBodyElem.appendChild(elem)
              document.body = newBodyElem
              vids
                .setTab(tab.id)
                .setQuery(command)
                .setWeb(web)
                .download(function(url) {
                  console.log('Finished!', url)
                })
            },
          )
        }
      } else {
        // Send a message to the tab to display not supported modal
        Port.postMessage({
          modal: {
            title: 'Not supported',
            message:
              'This website does not have support for video snatching yet.',
          },
        })
      }
    })
  }
})
