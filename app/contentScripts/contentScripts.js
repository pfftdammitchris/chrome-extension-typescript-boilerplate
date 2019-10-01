/*
  Manifest guide:
    https://developer.chrome.com/extensions/manifest

  Manifest permissions: 
    https://developer.chrome.com/extensions/declare_permissions

  content-scripts cannot use chrome API's except:
    chrome.extension, chrome.i18n, chrome.runtime, and chrome.storage

  iziModal documentation:
    http://izimodal.marcelodolce.com/
*/

// ACTION TYPE CONSTANTS
const INSTAGRAM_POST_PHOTOS = 'instagram-post-photos'
const PORNHUB_GET_VIDEO_LINKS = 'pornhub-get-video-links'

const modal = (function() {
  const container = document.createElement('div')

  function getModalHtml({ title, body }) {
    return `
      <div id="chromez-modal" class="chromez-modal">
        <div class="chromez-modal-content">
          <div class="chromez-modal-content-header">
            <h3 id="chromez-title">${title}</h3>
            <span class="chromez-modal-close">&times;</span>
          </div>
          <hr class="divider" />
          <div class="chromez-modal-content-body">
            ${body}
          </div>
        </div>
      </div>
    `
  }

  document.body.appendChild(container)
  const elem = document.getElementById('chromez-modal')

  return {
    getElem() {
      return $elem
    },
    open(...args) {
      let options
      // The caller wants to pass in data to overwrite the modal content
      if (isString(args[0])) {
        elem.innerHTML = args[0]
        options = args[1]
      } else {
        options = args[0]
      }
      elem.style.display = 'flex'
    },
    close() {
      elem.innerHTML = ''
      elem.style.display = 'none'
    },
  }
})()

const makeChromez = function createChromez() {
  return {
    connect(options) {
      chrome.runtime.connect(options)
    },
  }
}

// Invoked when we connected to the background
chrome.runtime.onConnect.addListener((port) => {
  console.log(`connected: ${port}`)
  const { name, disconnect, postMessage, sender } = port
  port.onDisconnect.addListener((result) => {
    console.log('Disconnected: ', result)
  })
})

chrome.runtime.onMessage.addListener((action, sender, sendResponse) => {
  switch (action.type) {
    case INSTAGRAM_POST_PHOTOS: {
      if (!action.linkUrl) {
        return console.warn(
          `You tried to fetch an instagram post's photos but no link was given. Action: ${action}`,
        )
      }
      $.ajax({
        url: action.linkUrl,
        success: (html) => {
          const $html = $(html)
          const { photos } = instagram.getPhotosFromPost($html)
          const modalElem = modal.getElem()
          const imgs = photos.map(
            ({ src }) =>
              `<div style="margin-bottom:10px">
                <img src="${src}" width="100%" height="auto" style="object-fit:cover;" />
              </div>`,
          )
          modalElem.html(imgs)
          modal.open()
        },
      })
    }
    case PORNHUB_GET_VIDEO_LINKS: {
      const req = new XMLHttpRequest()
      req.open('GET', action.linkUrl)
      req.send()
      req.onreadystatechange = function() {
        let modalElem, nodes

        const doc = new DOMParser().parseFromString(
          req.responseText,
          'text/xml',
        )
        const title = pornhub.getTitle()
        const thumbnail = pornhub.getThumbnail()
        let items = pornhub.getMediaLinks(doc)
        console.log(JSON.stringify(items))

        // Failed
        if (!items) {
          window.alert(
            `The media links could not be extracted. Reason: ${error.message}`,
          )
          console.log('items: ', items)
          console.log('dispatched action: ', action)
          return
        }
        // Success
        else {
          function formatReducer(acc, item) {
            if (!acc[item.format]) {
              acc[item.format] = {}
            }
            return acc
          }
          function qualitiesReducer(acc, item) {
            if (!acc[item.format]) {
              formatReducer(acc, item)
            }
            if (Array.isArray(item.quality)) {
              item.quality.forEach((quality) => {
                if (!Array.isArray(acc[item.format][quality])) {
                  acc[item.format][quality] = [item]
                } else {
                  acc[item.format][quality].push(item)
                }
              })
            } else {
              if (!Array.isArray(acc[item.format][item.quality])) {
                acc[item.format][item.quality] = [item]
              } else {
                acc[item.format][item.quality].push(item)
              }
            }
            return acc
          }
          // const formatsWithQualities = formats.reduce(())
          // Reduce to obj in format like: { [format]: Array, ...etc }
          const callAll = (...fns) => (...args) =>
            fns.reduce((acc, fn) => fn && fn(...args), (x) => x)
          const xform = callAll(formatReducer, qualitiesReducer)
          items = items.reduce(xform, {})

          modalElem = modal.getElem()

          function getQuality(str) {
            return `
                  <strong style="font-style:italic;">${str}</strong>
                `
          }

          // for now we will only support mp4
          const mp4Videos = items.mp4

          if (!mp4Videos) {
            window.alert('No mp4 items found. Aborting...')
            return
          }

          // Higher quality ones to the top
          const mp4Formats = Object.keys(mp4Videos).reverse()

          const htmlItems = mp4Formats.reduce((acc, format) => {
            const item = mp4Videos[format][0]
            return acc.concat(`
                  <div style="padding:12px;display:inline-block">
                    <div>
                      <div>
                        Format: <strong>${item.format}</strong>
                      </div>
                      <div>
                        Quality: ${
                          Array.isArray(item.quality)
                            ? item.quality.map(getQuality)
                            : getQuality(item.quality)
                        }
                      </div>
                      <div>
                        <a href="${item.videoUrl}" target="_blank">Download</a>
                      </div>
                    </div>
                  </div>
                `)
          }, '')

          modalElem.html(`
              <h2 style="color:#fff;font-style:italic;margin:20px 0;">${title}</h2>
              <div style="padding:12px;width:100%;height:100%">
                <div style="width:100%;height:100%">
                  <div style="width:100%;height:100%;max-height:500px;overflow:hidden;">
                    <img src="${thumbnail}" style="width:100%;height:100%;object-fit:cover"></img>
                  </div>
                </div>
                <div>
                  ${htmlItems}
                </div>
              </div>
              `)
          modal.open()
        }

        const statusCode = this.status
        const readyState = this.readyState
        if (readyState == 4 && statusCode == 200) {
          console.log(req.responseText)
        }
      }
    }
    default:
      break
  }
})

const chromez = makeChromez()
// const el = document.createElement('div')
chromez.connect()

// const modal = (function() {
//   this.elem = document.createElement('div')
//   this.elem.id = 'snake-modal'
//   document.body.appendChild(this.elem)

//   this.modal = $('#snake-modal').iziModal({
//     headerColor: '#373546',
//     background: '#1f1d2b',
//     radius: 8,
//     width: '90%',
//     zindex: 99999,
//     onClosed: function() {
//       const body = document.querySelector('body')
//       body.classList.remove('body-fixed')
//     },
//     appendTo: false,
//     appendToOverlay: false,
//   })

//   function open(options) {
//     if (options.title) this.modal.iziModal('setTitle', options.title)
//     if (options.message) this.modal.iziModal('setSubtitle', options.message)
//     this.modal.iziModal('open')
//     const body = document.querySelector('body')
//     body.classList.add('body-fixed')
//   }

//   function setInnerHtml(html) {
//     this.elem.innerHTML = html
//   }

//   return {
//     open: function(options) {
//       if (!options) return false
//       open(options)
//     },
//     setInnerHtml: function(html) {
//       if (!html) return false
//       setInnerHtml(html)
//     },
//   }
// })()
