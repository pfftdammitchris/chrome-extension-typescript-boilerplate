const storage = (function() {
  let obj = {}

  window.setTimeout(() => {
    // null = get entire contents of storage
    chrome.storage.local.get(null, (o) => {
      console.log(o)
      if (typeof o === 'object') obj = o
    })
  }, 200)

  return {
    read: (key) => {
      if (!key) return obj
      return obj[key]
    },
    write: (key, data) => {
      obj[key] = data
    },
    save: (callback) => {
      chrome.storage.local.set(obj, callback)
    },
    push: (key, data) => {
      // initiate the array
      if (!(key in obj)) {
        obj[key] = []
      }
      if (Array.isArray(obj[key])) {
        obj[key].push(data)
      }
      if (!key && !data) {
        throw new Error(
          'Check your push method in your storage object. Key/values passed in are falsey.',
        )
      }
    },
  }
})()
