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

const modal = (function() {
  this.elem = document.createElement('div')
  this.elem.id = 'snake-modal'
  document.body.appendChild(this.elem)

  this.modal = $('#snake-modal').iziModal({
    headerColor: '#373546',
    background: '#1f1d2b',
    radius: 8,
    width: '90%',
    zindex: 99999,
    onClosed: function() {
      const body = document.querySelector('body')
      body.classList.remove('body-fixed')
    },
    appendTo: false,
    appendToOverlay: false,
  })

  function open(options) {
    if (options.title) this.modal.iziModal('setTitle', options.title)
    if (options.message) this.modal.iziModal('setSubtitle', options.message)
    this.modal.iziModal('open')
    const body = document.querySelector('body')
    body.classList.add('body-fixed')
  }

  function setInnerHtml(html) {
    this.elem.innerHTML = html
  }

  return {
    open: function(options) {
      if (!options) return false
      open(options)
    },
    setInnerHtml: function(html) {
      if (!html) return false
      setInnerHtml(html)
    },
  }
})()

const port = chrome.runtime.connect({ name: 'snake' })

chrome.runtime.onConnect.addListener((_port) => {
  // Listen for incoming background queries after we're connected
  _port.onMessage.addListener((msg) => {
    console.log(msg)
    if (msg.query) {
      handleQuery({ query: msg.query, options: msg })
    }
    if (msg.modal) {
      modal.open(msg.modal)
    }
  })
  _port.onDisconnect.addListener((result) => {
    console.log('Disconnected: ', result)
  })
})

// Handles a given query and returns a result back to the caller
function handleQuery({ query, options }) {
  switch (query) {
    case 'get-html':
      callback(getHtml(options))
      break
    case 'query-options':
      break
    case 'galleria':
      initGalleria(options)
      break
    case 'galleria-display':
      displayGalleria(options)
      break
    default:
      return null
  }

  function getHtml(options) {
    let selector = 'body'
    if (options.selector) selector = options.selector
    return document.querySelector(selector).innerHTML
  }

  function initGalleria(options) {
    const selector = options.selector
    const webApp = options.webApp
    if (webApp === 'spankbang') {
      const videoNodes = document.getElementsByClassName('video-item')
      const videoPages = []
      for (let i = 0; i < videoNodes.length; i++) {
        const node = videoNodes[i]
        const nodeChildren = node.childNodes
        const data = {}

        for (let x = 0; x < nodeChildren.length; x++) {
          const nodeChild = nodeChildren[x]
          if (nodeChild.tagName === 'A') {
            data.pageUrl = nodeChild.href
          }
          if (/inf/i.test(nodeChild.className)) {
            data.videoTitle = nodeChild.textContent
          }
          if (nodeChild.tagName === 'UL') {
            data.datePosted = nodeChild.children[0].textContent
            data.views = nodeChild.children[1].textContent
            data.thumbsUp = nodeChild.children[2].textContent
          }
        }
        videoPages.push(data)
      }
      port.postMessage({
        webApp: 'spankbang',
        query: 'video-pages',
        videoPages,
        url: window.location.href,
      })
    }
  }

  function download() {
    console.log('You clicked me!')
  }

  function displayGalleria(options) {
    const { data } = options
    const elem = document.createElement('div')
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      const childElem = document.createElement('div')
      const titleElem = document.createElement('h4')
      const downloadElem = document.createElement('div')
      const thumbnailsElem = document.createElement('div')
      titleElem.innerHTML = `
        <a class="video-page video-title" href="${d.pageUrl}" target="_blank">
          ${d.videoTitle || 'N/A'} - ${d.datePosted || 'N/A'}
        </a>
      `
      titleElem.className += 'video-title video-page'
      downloadElem.innerHTML = 'Download'
      downloadElem.className += 'download'
      downloadElem.onclick = download
      thumbnailsElem.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;margin-bottom:30px;">
        ${d.thumbnails.map(
          (thumb) => `
          <div style="flex:1 0 18%;border:1px solid #8a3ab9;">
            <img style="width:100%;height:100%;object-fit:cover;" src="${
              thumb.thumbnail
            }" />
          </div>
          `,
        )}
        </div>
      `
      childElem.appendChild(titleElem)
      childElem.appendChild(downloadElem)
      childElem.appendChild(thumbnailsElem)
      elem.appendChild(childElem)
    }
    modal.setInnerHtml(`
      <style>
        .wrapper {
          position: relative;
          padding: 12px;
          overflow: scroll;
          height: 100%;
        }
        .video-title {
          cursor: pointer;
          font-size: 1.4em;
          font-weight: bold;
          marginBottom: 15px;
          color: #0070c2;
          transition: all 0.5s ease-out;
        }
        .video-title:hover {
          color: #F8A31E;
        }
        .download {
          color: #63C17B;
          transition: all 0.5s ease-out;
          cursor: pointer;
          font-size: 1.25em;
          font-weight: bold;
          margin: 6px 0;
        }
        .download:hover {
          color: #398FCD;
        }
        .body-fixed {
          overflow: hidden;
          position: fixed;
        }
      </style>
      <div class="wrapper">
        ${elem.innerHTML}
      </div>
    `)
    modal.open({
      title: 'Thumbnails from videos',
      message:
        'Each section includes 1 video and 10 thumbnails corresponding to the video.',
    })
  }
}
