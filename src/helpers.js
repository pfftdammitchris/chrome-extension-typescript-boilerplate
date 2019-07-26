const isUndefined = (v) => typeof v === 'undefined'
const isString = (v) => typeof v === 'string'
const isNumber = (v) => typeof v === 'number'
const isArray = (v) => Array.isArray(v)
const isPlainObject = (v) => !!v && typeof v === 'object' && !isArray(v)
const isFunction = (v) => typeof v === 'function'

function getActiveTab(options, cb) {
  chrome.tabs.query(
    { active: true, currentWindow: true, ...options },
    (tabs) => {
      const activeTab = tabs[0]
      if (isFunction(cb)) cb(activeTab)
    },
  )
}

// Pass in HTML as a string and retrieve it as a node.
function createHtmlNode(htmlStr) {
  const node = document.createElement('div')
  node.innerHTML = htmlStr
  return node
}
