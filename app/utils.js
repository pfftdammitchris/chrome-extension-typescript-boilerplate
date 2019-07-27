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
      // Assume the caller just wants the tab back
      if (isFunction(options)) options(activeTab)
      else if (isFunction(cb)) cb(activeTab)
    },
  )
}

// Returns the site like "instagram" or "facebook"
function getSite(url) {}

// Pass in HTML as a string and retrieve it as a node.
function createHtmlNode(htmlStr) {
  const node = document.createElement('div')
  node.innerHTML = htmlStr
  return node
}

const display_resources = [
  {
    src:
      'https://scontent-lax3-2.cdninstagram.com/vp/945a3ff55ef8d7aba835e865458c0a79/5DC856B0/t51.2885-15/e35/p1080x1080/66618291_351891672370600_7303076124273663963_n.jpg?_nc_ht=scontent-lax3-2.cdninstagram.com',
    config_width: 1080,
    config_height: 1233,
  },
]

const edge_media_to_caption = {
  edges: [
    {
      node: {
        text:
          'Don\u2019t compare your life to others by what you see on the gram. Look up to lives that display examples in their day to day life. \u2800\n\u2800\nInstagram isn\u2019t real life **shocker**\n\u2800\nI can literally put \u201cI\u2019m so done\u201d \u2800\nAnd people will think something dramatic happened. \u2800\nYet I\u2019ll literally be talking about how McDonald\u2019s gave me one less nugget \ud83e\udd37\u200d\u2640\ufe0f',
      },
    },
  ],
}
