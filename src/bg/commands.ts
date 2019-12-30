/*
  Documentation:
    https://developer.chrome.com/extensions/commands
  Bookmarks:
    https://developer.chrome.com/extensions/bookmarks
*/

chrome.commands.onCommand.addListener((command) => {
  // Opens the modal in the UI on a kink.com's video page and displays the video's photos
  if (command === 'kink-get-photos') {
    getActiveTab((tab) => {
      dispatch(tab.id, { type: command, ...tab })
    })
  }
  // Send message to client side to display modal
  if (command === 'query-options') {
    getActiveTab((tab) => {
      Port.init(tab.id)
      Port.postMessage({ query: command })
    })
  }
  // Ctrl + Z
  if (command === 'galleria') {
    getActiveTab((tab) => {
      const webSupportsQuery = supportsQuery(tab.url, command)
      const webApp = getWebApp(tab.url, command)
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
    getActiveTab((tab) => {
      const supportsWeb = supportsQuery(tab.url, command)
      if (supportsWeb) {
        const web = getWebApp(tab.url)
        if (web) {
          let body
          Port.postMessage(
            { query: 'get-html', selector: '#container' },
            (html) => {
              const elem = htmlToNode(html)
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
  // Shift + D
  if (command === 'download-candidcreeps-video') {
    getActiveTab((tab) => {
      Port.postMessage({ query: 'download-candidcreeps-video' }, function(
        html,
      ) {
        console.log(html)
      })
    })
  }
})
