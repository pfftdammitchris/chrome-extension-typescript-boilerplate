// PornHub module
// All interactive objects must be jQuery-ified before using!
const pornhub = (function() {
  return {
    // Get media links from a video page
    // The items in the beginning in the result array are the higher quality ones
    getMediaLinks() {
      let json, items

      const scripts = Array.from(
        document.querySelectorAll('script[type="text/javascript"]'),
      )

      const elem = scripts.find((el) => /mediaDefinitions/i.test(el.innerHTML))

      if (elem) {
        const htmlStr = elem.innerHTML
        const startIndex = htmlStr.indexOf('{')
        const endIndex = htmlStr.indexOf('};') + 1

        try {
          json = JSON.parse(htmlStr.substring(startIndex, endIndex))
          items = json.mediaDefinitions
        } catch (error) {
          return false
        }
      }

      /*
        interface Item {
          defaultQuality: boolean
          format: string   ("mp4")
          quality: string | string[]   ("1080" or something like ["1080", "720", "480", "240"])
          videoUrl: string
        }
      */

      return items
    },
    getTitle() {
      const titleElem = document.getElementById('videoTitle')
      return titleElem ? titleElem.textContent : ''
    },
    getThumbnail() {
      return document
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
    },
  }
})()
