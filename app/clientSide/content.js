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

const makeUiPort = function createUiPort() {
  // Connect and listen to the background
  chrome.runtime.onConnect.addListener((port) => {
    const onMsg = (msg) => {
      console.log(msg)
    }
    const onDisconnect = (result) => {
      console.log('Disconnected: ', result)
    }
    port.onMessage.addListener(onMsg)
    port.onDisconnect.addListener(onDisconnect)
  })

  return {
    connect(options) {
      chrome.runtime.connect(options)
    },
  }
}

const uiPort = makeUiPort()

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
