// PornHub module
// All interactive objects must be jQuery-ified before using!
const pornhub = (function() {
  return {
    // Get media links from a video page
    getMediaLinks($html) {
      if (!$html) {
        return console.warn(
          `You tried to get photos but no jquery nodes were passed in.`,
        )
      }

      let items

      const scripts = Array.from(
        document.querySelectorAll('script[type="text/javascript"]'),
      )

      const elem = scripts.find((el) => /mediaDefinitions/i.test(el.innerHTML))

      if (elem) {
        const htmlStr = elem.innerHTML
        const startIndex = htmlStr.indexOf('{')
        const endIndex = htmlStr.indexOf('};') + 1
        const json = JSON.parse(htmlStr.substring(startIndex, endIndex))
        if (json) {
          items = json.mediaDefinitions
        }
      }

      return items
    },
  }
})()
