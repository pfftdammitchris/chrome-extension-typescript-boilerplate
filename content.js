/*
  Manifest guide:
    https://developer.chrome.com/extensions/manifest

  Manifest permissions: 
    https://developer.chrome.com/extensions/declare_permissions

  content-scripts cannot use chrome. API's except:
    chrome.extension, chrome.i18n, chrome.runtime, and chrome.storage
*/

// Listen for incoming queries after we're connected
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.web === 'spankbang') {
    let url

    const html = document.querySelector('body').innerHTML
    const start = html.search(/var cover_image/)
    const end = html.indexOf('</script>', start)

    /*
      Received the query lines as an array
      Ex: [
          'var stream_shd  = 0;',
          'var stream_id  = '2pto1';',
          'var stream_url_720p  = 'https://vcdn2.spankbang.com/4/5/4564081-720p.mp4?st=lu3rf1jiGJypqzYJWuqttg&e=1542147928;'
          ...etc
        ]
    */
    const queryLines = html
      .slice(start, end)
      .replace(/(var|\')/gi, '')
      .split(/;/)
      .map((str) => str.trim())

    // Final object with key + values { stream_u_id: '43423', stream_sd: '1', ...etc }
    const queries = queryLines.reduce((acc, str) => {
      const key = str.slice(0, str.search(/ /)).trim()
      const value = str.slice(str.search(/=/) + 1).trim()
      if (!(key in acc)) acc[key] = value
      return acc
    }, {})

    if (msg.query === 'get-highest') {
      url = getHighest(queries)
      sendResponse(url)
    }
  }
})

/** Grabs the highest available quality url and returns it
 * @param { object } queries - Key/value pairs where keys are the key and the values are the links
 */
function getHighest(queries) {
  let url
  // Best to lowest, in descending order
  const qualities = [
    'stream_url_4k',
    'stream_url_1080p',
    'stream_url_720p',
    'stream_url_480p',
    'stream_url_320p',
    'stream_url_240p',
  ]

  for (let i = 0; i < qualities.length; i++) {
    const quality = qualities[i]
    if (!!queries[quality]) {
      url = queries[quality]
      return queries[quality]
    }
  }

  if (!url) return null
}
