const supportedWebFeatures = {
  spankbang: ['snatch-video', 'galleria'],
}

// Sending messages from background to content
const generalQueries = ['get-html', 'query-options']

/* -------------------------------------------------------
  ---- Listeners
-------------------------------------------------------- */

/* -------------------------------------------------------
  ---- Browser actions
-------------------------------------------------------- */

// chrome.browserAction.onClicked.addListener(function(tab) {})

/* -------------------------------------------------------
  ---- Constructors
-------------------------------------------------------- */

// chrome.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener((msg) => {
//     console.log('Received from client! ', msg)
//   })
// })

const _Port = function _Port() {
  const self = this
  self.port = null // Used to send .postMessage calls from background side
  self.clientPort = null // Used to receive .postMessage calls from client side
  self._contentListener = null
  self.tab = {}
  self.listeningUrl = null // Listening URL = tab url from client
  // Open listening connection from client side
  chrome.runtime.onConnect.addListener((clientPort) =>
    self.listenClient(clientPort),
  )
  // Listen to tab changes from client side
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    self.port = chrome.tabs.connect(
      tabId,
      { name: 'snake ' },
    )
    if (info.status === 'loading') {
      fn.getActiveTab((activeTab) => {
        if (!activeTab) return
        if (self.tab.id !== activeTab.id) {
          self.tab = activeTab
        }
        if (self.listeningUrl !== activeTab.url) {
          self.listeningUrl = activeTab.url
        }
      })
    }
  })

  // Listens to incoming client messages
  self.listenClient = function(clientPort) {
    self.clientPort = clientPort
    self.clientPort.onMessage.addListener((msg) => {
      if (msg.query) {
        if (msg.webApp === 'spankbang') {
          if (msg.query === 'video-pages') {
            spankbang.displayGalleria(msg)
          }
        }
      }
    })
  }
  self.postMessage = function(msg) {
    self.port.postMessage(msg)
  }
}

const Port = new _Port()

function Galleria({ url = '', period = null } = {}) {
  this.url = url
  this.period = period
  this.sections = []

  this.setUrl = function(url) {
    this.url = url
    return this
  }

  this.setPeriod = function(period) {
    this.period = period
    return this
  }

  return this
}
