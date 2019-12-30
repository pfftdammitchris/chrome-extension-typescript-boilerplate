function isUndefined(v: any) {
  return typeof v === 'undefined'
}
function isString(v) {
  return typeof v === 'string'
}
function isNumber(v) {
  return typeof v === 'number'
}
function isArray(v) {
  return Array.isArray(v)
}
function isPlainObject(v) {
  return !!v && typeof v === 'object' && !isArray(v)
}
function isFunction(v) {
  return typeof v === 'function'
}

function getActiveTab(options, cb) {
  chrome.tabs.query(
    { active: true, currentWindow: true, ...options },
    (tabs) => {
      const activeTab = tabs[0]
      // Assume the caller just wants the tab back
      if (isFunction(options)) options(activeTab)
      else if (isFunction(cb)) cb(activeTab)
    },
  )
}
