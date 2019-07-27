chrome.storage.sync.onChanged.addListener((changes) => {
  console.log('Storage onChange: ', changes)
})

const storage = (function() {
  return {
    // Similar to local storage -- in that it works offline while sync is saved on the internet
    local: {
      //
    },
    // Removes all items from storage
    clear() {
      return new Promise((resolve) => {
        chrome.storage.sync.clear(resolve)
      })
    },
    /**
     * Gets the amount of space in bytes being used by one or more items
     * @param { string | string[] } key - A key or list of keys
     * @return Promise<bytesInUse: number>
     */
    getBytesInUse(key) {
      return new Promise((resolve) => {
        chrome.storage.sync.getBytesInUse(key, resolve)
      })
    },
    /**
     * Promise using chrome.storage.sync.get()
     * @param { string | undefined } args[0] - key for object lookups or no key to get the entire storage data
     * @return Promise<null | data>
     */
    read(...args) {
      return new Promise((resolve) => {
        // We will assume that the caller wants the entire storage data returned
        //   if they don't pass in any arguments
        if (!args.length) {
          chrome.storage.sync.get(null, (data) => {
            console.log(`Grabbed entire chrome storage object: ${data}`)
            if (isPlainObject(data)) resolve(data)
          })
        }
        const [key] = args
        if (!key) {
          console.log(
            `%cTried to read an item from storage but key was invalid. Key: ${key}`,
            'color:salmon',
          )
          resolve(null)
        }
        chrome.storage.sync.get(key, resolve)
      })
    },
    /**
     * Removes an item or a list of items from storage
     * @param { string | string[] } key - A key or list of keys to remove
     * @return Promise<void>
     */
    remove(key) {
      return new Promise((resolve) => {
        if (!key) {
          console.warn(
            `Tried to remove an item from storage but key was invalid. Key: ${key}`,
          )
          resolve()
        }
        chrome.storage.sync.remove(key, resolve)
      })
    },
    /**
     * @param { string | object } key - Key or an object of data
     * @return Promise<void>
     */
    write: (key, data) => {
      return new Promise((resolve, reject) => {
        if (!key) {
          console.warn(
            `Tried to remove an item from storage but key was invalid. Key: ${key}`,
          )
        }
        if (isString(key)) {
          chrome.storage.sync.set({ [key]: data }, resolve)
        } else {
          if (isPlainObject(key)) data = key
          if (data) {
            chrome.storage.sync.set(data, resolve)
          } else {
            reject(new Error('data is invalid'))
          }
        }
      })
    },
  }
})()
