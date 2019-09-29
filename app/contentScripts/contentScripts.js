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
const PORNHUB_DOWNLOAD_DISABLED_VIDEO = 'pornhub-download-disabled-video'

const modal = (function() {
  const elem = document.createElement('div')
  elem.style.margin = 'auto'
  elem.setAttribute('id', 'chromez-modal')

  const $elem = $(elem)

  return {
    getElem() {
      return $elem
    },
    open(...args) {
      let options
      // The caller wants to pass in data to overwrite the modal content
      if (isString(args[0])) {
        $elem.html(args[0])
        options = args[1]
      } else {
        options = args[0]
      }
      $elem.modal({ fadeDuration: 250, ...options })
    },
    close() {
      $elem.html('')
      $.modal.close()
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
    case PORNHUB_DOWNLOAD_DISABLED_VIDEO: {
      $.ajax({
        url: action.linkUrl,
        success: (html) => {
          const $html = $(html)
          const items = pornhub.getMediaLinks($html)
          const modalElem = modal.getElem()
          console.log(items)

          if (!items) {
            window.alert(
              'Could not find any links to this video. Check console',
            )
            console.log('items: ', items)
            console.log('dispatched action: ', action)
          }
          // const imgs = photos.map(
          //   ({ src }) =>
          //     `<div style="margin-bottom:10px">
          //       <img src="${src}" width="100%" height="auto" style="object-fit:cover;" />
          //     </div>`,
          // )
          // modalElem.html(imgs)
          // modal.open()
        },
      })
    }
    default:
      break
  }
})

const chromez = makeChromez()
const el = document.createElement('div')
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
