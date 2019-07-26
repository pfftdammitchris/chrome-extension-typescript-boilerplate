const port = (function() {
  const _store = {
    port: null, // Used to send .postMessage calls from background side
    clientPort: null, // Used to receive .postMessage calls from client side
    contentListener: null,
    tab: null,
    listeningUrl: null, // Listening URL = tab url from client
  }

  // Opens the listening connection from client side
  chrome.runtime.onConnect.addListener((clientPort) => {
    _store.clientPort = clientPort
    _store.clientPort.onMessage.addListener((msg) => {
      console.log(msg)
    })
  })

  // Listen to tab changes from client side
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    _store.port = chrome.tabs.connect(tabId, { name: 'chromez' })
    if (info.status === 'loading') {
      getActiveTab((activeTab) => {
        if (!activeTab) {
          return console.warn(
            'No active tab. Returning from call while info.status === "loading"...',
          )
        }
        // If tab isn't initialized yet then just initialize it
        if (!_store.tab) {
          _store.tab = activeTab
        }
        // If the tab is already initialized but its not the current active tab,
        //    make it the current active tab
        else if (_store.tab.id !== activeTab.id) {
          _store.tab = activeTab
        }
        if (_store.listeningUrl !== activeTab.url) {
          _store.listeningUrl = activeTab.url
        }
      })
    }
  })

  const storeHelpers = {
    get(key) {
      const args = Array.prototype.slice.call(arguments, 0)
      // Allow the caller to choose to receive the store if they don't pass anything in
      if (args.length === 0) {
        return _store
      }
      const val = _store[key]
      if (val) {
        return val
      } else {
        console.warn(
          `Warning! You tried to retrieve store[${key}] but it was null or undefined`,
        )
      }
    },
    set(key, value) {
      if (!key) {
        return console.warn(
          `Warning! You tried to set "${key}" on the store but it was not valid`,
        )
      } else {
        _store[key] = value
      }
      return this
    },
  }

  return {
    store: storeHelpers,
    postMessage(msg) {
      if (_store.port != undefined) {
        _store.port.postMessage(msg)
      } else {
        console.warn(
          `Warning: Tried to invoke postMessage with "${msg}" but port was undefined`,
        )
      }
      return this
    },
  }
})()
