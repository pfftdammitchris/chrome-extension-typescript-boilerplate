/*
  Manifest guide:
    https://developer.chrome.com/extensions/manifest

  Manifest permissions: 
    https://developer.chrome.com/extensions/declare_permissions

  content-scripts cannot use chrome API's except:
    chrome.extension, chrome.i18n, chrome.runtime, and chrome.storage
*/

// ACTION TYPE CONSTANTS
const ONLOAD = 'onload'

// Generates content to render in the modal
/**
 * @param { string[] } srcs - Array of base64 data for the "src" attr for <img /> elements
 * @return { string }
 */
function generateGallery(srcs) {
  let html = ''
  srcs.forEach((src) => {
    html += `
      <div style="width:100%;height:100%;max-width:320px;margin:3px;max-height:350px;">
        <a href="${src}" target="_blank">
          <img src="${src}" style="width:100%;height:100%;object-fit:cover;"></img>
        </a>
      </div>`
  })
  return html
}

const modal = (function() {
  const chromezModal = document.createElement('div')
  chromezModal.classList.add('chromez-modal')

  function getModalHtml({ title, content }) {
    return `
      <div class="chromez-modal-content">
        <div style="width:100%;height:100%;overflow-y:auto;">
          <div class="chromez-modal-content-header">
            <h2>${title}</h2>
            <span class="chromez-modal-close">&times;</span>
          </div>
          <div class="chromez-modal-content-body">
            ${content}
          </div>
        </div>
      </div>
    `
  }

  document.body.appendChild(chromezModal)

  return {
    getElem() {
      return chromezModal
    },
    getModalHtml,
    open(options) {
      if (options) {
        const { title, content } = options
        chromezModal.innerHTML = getModalHtml({
          title,
          content,
        })
      }
      chromezModal.style.display = 'flex'
    },
    close() {
      chromezModal.innerHTML = ''
      chromezModal.style.display = 'none'
    },
  }
})()

const ph = (function() {
  const _store = {
    playlist: {
      page: {},
    },
  }

  return {
    playlist: {
      // Utilities for working on ph playlist pages
      // Example link: https://pornhubpremium.com/playlist/22453871
      page: {
        // pageObj = { hiddenElems, visibleElems }
        // options = { elem, minDuration, maxDuration, value }
        addHiddenElem(id, pageObj, options) {
          if (pageObj) {
            const { hiddenElems, visibleElems } = pageObj
            // Remove from visible elems if its in there
            if (visibleElems.ids.includes(id)) {
              const index = visibleElems.ids.indexOf(id)
              visibleElems.ids.splice(index, 1)
            }
            if (id in visibleElems.items) {
              delete visibleElems.items[id]
            }
            if (!hiddenElems.ids.includes(id)) {
              hiddenElems.ids.push(id)
            }
            if (!(id in hiddenElems.items)) {
              hiddenElems.items[id] = this.createPageObjElemObj(options)
            }
          } else {
            console.error(
              'No page object! Please create a page object and pass it as arguments',
            )
          }
        },
        // pageObj = { hiddenElems, visibleElems }
        // options = { elem, minDuration, maxDuration, value }
        addVisibleElem(id, pageObj, options) {
          if (pageObj) {
            const { hiddenElems, visibleElems } = pageObj
            // Remove from hidden elems if its in there
            if (hiddenElems.ids.includes(id)) {
              const index = hiddenElems.ids.indexOf(id)
              hiddenElems.ids.splice(index, 1)
            }
            if (id in hiddenElems.items) {
              delete hiddenElems.items[id]
            }
            if (!visibleElems.ids.includes(id)) {
              visibleElems.ids.push(id)
            }
            if (!(id in visibleElems.items)) {
              visibleElems.items[id] = this.createPageObjElemObj(options)
            }
          } else {
            console.error(
              'No page object! Please create a page object and pass it as arguments',
            )
          }
        },
        createPageObj() {
          return {
            hiddenElems: { ids: [], items: {} },
            visibleElems: { ids: [], items: {} },
          }
        },
        createPageObjElemObj(options) {
          return {
            elem: options.elem,
            details: options.details,
            ...options,
          }
        },
        filter(type, options = {}) {
          switch (type) {
            case 'duration': {
              const { pageUrl, linkUrl = pageUrl } = options
              if (linkUrl) {
                if (!(linkUrl in _store.playlist.page)) {
                  _store.playlist.page[linkUrl] = this.createPageObj()
                }
                return this.filterDuration(
                  _store.playlist.page[linkUrl],
                  options,
                )
              } else {
                console.error('No link URL was found!')
              }
            }
            default:
              break
          }
        },
        filterDuration(pageObj, options) {
          // setup
          if (!document.getElementById('view-display-status')) {
            const overlay = document.createElement('div')
            overlay.id = 'chromez-overlay'
            overlay.style.position = 'fixed'
            overlay.style.top = '0'
            overlay.style.right = '0'
            overlay.style.bottom = '0'
            overlay.style.left = '0'
            overlay.style.overflow = 'hidden'
            overlay.style.zIndex = '1'
            overlay.style.pointerEvents = 'none'

            const stat = document.createElement('div')
            stat.id = 'chromez-overlay-stat'
            stat.style.height = '100%'
            stat.style.display = 'flex'
            stat.style.justifyContent = 'flex-end'
            stat.style.alignItems = 'center'

            overlay.appendChild(stat)
            document.body.appendChild(overlay)

            displayStatus(stat)
          }
          function displayStatus(elem) {
            if (elem) {
              elem.innerHTML = `
              <div style="padding:12px;position:relative;z-index:1;">
                <div>Hidden: ${pageObj.hiddenElems.ids.length}</div>
                <div>Visible: ${pageObj.visibleElems.ids.length}</div>
                <div id="view-display-status" style="cursor:pointer;position:relative;z-index:99999">View</div>
              </div>
            `
            }
          }
          displayStatus(document.getElementById('chromez-overlay-stat'))
          const {
            duration: { min: minDuration, max: maxDuration },
          } = options

          const videoPlaylist = document.getElementById('videoPlaylist')
          const liElemsList = videoPlaylist.querySelectorAll('li')

          for (let index = 0; index < liElemsList.length; index++) {
            const liElem = liElemsList[index]
            processItem(liElem)
          }

          // URL of tab should be this shape: https://pornhubpremium.com/playlist/${playlistId}
          function processItem(liElem) {
            let id,
              vkey,
              href,
              url,
              relatedUrl,
              title,
              duration,
              quality,
              profile = {},
              views,
              upvotes,
              dateAdded,
              src,
              thumbUrl

            if (!liElem) return

            id = liElem.dataset.id
            vkey = liElem.getAttribute('_vkey')

            const anchorEl = liElem.querySelector('a')

            if (anchorEl) {
              href = anchorEl.getAttribute('href')
            }

            const thumbInfoWrapperEl = document.querySelector(
              'div.thumbnail-info-wrapper',
            )

            if (thumbInfoWrapperEl) {
              const titleEl = thumbInfoWrapperEl.querySelector('.title')

              if (titleEl) {
                const linkEl = titleEl.querySelector('a')
                if (linkEl) {
                  url = linkEl.getAttribute('href')
                }
              }

              const uploaderBlockEl = thumbInfoWrapperEl.querySelector(
                'div.videoUploaderBlock',
              )

              const usernameEl = uploaderBlockEl.querySelector(
                'div.usernameWrap',
              )

              if (usernameEl) {
                const userAnchorEl = usernameEl.querySelector('a')
                if (userAnchorEl) {
                  profile = {
                    username: userAnchorEl.innerText,
                    url: userAnchorEl.getAttribute('href'),
                  }
                }
              }

              const detailsBlock = thumbInfoWrapperEl.lastElementChild

              if (detailsBlock) {
                const viewsEl = detailsBlock.firstElementChild
                if (viewsEl) views = viewsEl.innerText
                const ratingsEl = viewsEl && viewsEl.nextElementSibling
                if (ratingsEl) {
                  const upvotesEl = ratingsEl.querySelector('div.value')
                  if (upvotesEl) {
                    upvotes = upvotesEl.innerText
                  }
                }
                const addedEl = detailsBlock.lastElementChild
                if (addedEl) dateAdded = addedEl.innerText
              }
            }

            const phImageEl = liElem.querySelector('div.phimage')

            if (phImageEl) {
              const qualityEl = phImageEl.getElementsByClassName(
                'hd-thumbnail',
              )[0]

              if (qualityEl) {
                quality = qualityEl.innerText
              }

              const anchorElem = phImageEl.querySelector('a.linkVideoThumb')

              if (anchorElem) {
                title = anchorElem.dataset.title
                relatedUrl = anchorElem.dataset.relatedUrl
              }

              const imgEl = phImageEl.querySelector('img')
              if (url) {
                src = imgEl.getAttribute('src')
                thumbUrl = imgEl.dataset.thumb_url
              }
            }

            const details = {
              id,
              vkey,
              href,
              relatedUrl,
              title,
              duration,
              quality,
              profile,
              views,
              upvotes,
              dateAdded,
              src,
              thumbUrl,
            }

            const durationEl = phImageEl.getElementsByClassName('duration')[0]

            if (durationEl) {
              if (durationEl.innerText) {
                let result = durationEl.innerText.split(':')[0]
                if (result) {
                  result = Number(result)

                  // TODO: add an option for querying here
                  if (typeof result === 'number') {
                    const pageObjElemObj = ph.playlist.page.createPageObjElemObj(
                      { elem: liElem, details },
                    )
                    // Add to hidden elems
                    if (result <= minDuration) {
                      ph.playlist.page.addHiddenElem(
                        id,
                        pageObj,
                        pageObjElemObj,
                      )
                      liElem.parentNode.removeChild(liElem)
                    }
                    // Add to visible elems
                    else {
                      ph.playlist.page.addVisibleElem(
                        id,
                        pageObj,
                        pageObjElemObj,
                      )
                    }
                  }
                }
                duration = durationEl.innerText
              }
            }
            return details
          }
        },
        getHiddenElems(linkUrl) {
          return _store.playlist.page[linkUrl].hiddenElems
        },
        getVisibleElems(linkUrl) {
          return _store.playlist.page[linkUrl].visibleElems
        },
      },
    },
  }
})()

chrome.runtime.onConnect.addListener((port) => {
  console.log('%cWe are connected to the background!', 'color:green;')
  port.onMessage.addListener((msg) => {
    console.log(`%cport.onMessage: ${msg}`, 'color:blue')
  })
})

chrome.runtime.onMessage.addListener((action, sender, sendResponse) => {
  console.log(action)

  if (action.type === 'onload') {
    sendResponse({ acknowledged: true })
    return
  }

  switch (action.type) {
    case ONLOAD:
      chrome.runtime.connect()
      break
    case 'pornhub-playlist-videos-page-query': {
      const options = {
        ...action,
        duration: { min: 10, max: null },
      }

      const onStart = () => ph.playlist.page.filter('duration', options)

      onStart()
      registerListeners()

      function registerListeners() {
        window.removeEventListener('scroll', onStart)
        window.addEventListener('scroll', onStart)
      }
      break
    }
    // case 'megapreview-get-page-photos': {
    //   const modalElem = modal.getElem();
    //   if (modalElem.style.display !== "none") {
    //     modalElem.style.display = "none";
    //   } else {
    //     $.ajax({
    //       url: action.linkUrl || action.url,
    //       success: html => {
    //         const $html = $(html);
    //         const container = $(".megaList-content", $html);
    //         console.log(container);

    //         const items = [];
    //         const srcs = [];
    //         $(container)
    //           .find("a")
    //           .each((index, elem) => {
    //             const $elem = $(elem);
    //             const src = $elem.find("img").attr("src");
    //             const duration = $(".video-thumb-details > span", $elem).text();
    //             const title = $(".file-block-title").text();
    //             srcs.push(src);
    //             items.push({
    //               src,
    //               duration,
    //               title
    //             });
    //           });
    //         console.log(items);
    //         const modalElem = $(modal.getElem());
    //         const containerHtml = modal.getModalHtml({
    //           title: action.title || "Photos",
    //           content: generateGallery(srcs)
    //         });
    //         modalElem.html(containerHtml);
    //         const closeBtn = document.getElementsByClassName(
    //           "chromez-modal-close"
    //         )[0];
    //         closeBtn.onclick = modal.close;
    //         modal.open();
    //       }
    //     });
    //   }
    //   break;
    // }
    //   const modalElem = modal.getElem();
    //   if (modalElem.style.display !== "none") {
    //     modalElem.style.display = "none";
    //   } else {
    //     $.ajax({
    //       url: action.linkUrl || action.url,
    //       success: html => {
    //         const root = $(html);
    //         const container = $("#previewImages", root);
    //         const imgElems = container.find("div.thumb > a > img");
    //         const srcs = [];
    //         imgElems.each((_, el) => {
    //           const src = $(el).attr("src");
    //           if (!srcs.includes(src)) {
    //             srcs.push(src);
    //           }
    //         });
    //         const modalElem = $(modal.getElem());
    //         const containerHtml = modal.getModalHtml({
    //           title: action.title || "Photos",
    //           content: generateGallery(srcs)
    //         });
    //         modalElem.html(containerHtml);
    //         const closeBtn = document.getElementsByClassName(
    //           "chromez-modal-close"
    //         )[0];
    //         closeBtn.onclick = modal.close;
    //         modal.open();
    //       }
    //     });
    //   }
    //   break;
    // }
    // case 'instagram-query-post-photos': {
    //   if (!action.linkUrl) {
    //     return window.alert(
    //       `You tried to fetch an instagram post's photos but no link was given. Action: ${JSON.stringify(
    //         action,
    //         null,
    //         2
    //       )}`
    //     );
    //   }
    //   $.ajax({
    //     url: action.linkUrl,
    //     success: html => {
    //       const $html = $(html);
    //       const { photos } = instagram.user.homepage.getPhotosFromPost($html);
    //       const modalElem = $(modal.getElem());
    //       const srcs = photos.map(({ src }) => src);
    //       const containerHtml = modal.getModalHtml({
    //         title: "Photos",
    //         content: generateGallery(srcs)
    //       });
    //       modalElem.html(containerHtml);
    //       const closeBtn = document.getElementsByClassName(
    //         "chromez-modal-close"
    //       )[0];
    //       closeBtn.onclick = modal.close;
    //       modal.open();
    //     }
    //   });
    //   // const xhttp = new XMLHttpRequest()
    //   // xhttp.onreadystatechange = function() {
    //   //   if (this.readyState == 4 && this.status == 200) {
    //   //     const html = this.responseText
    //   //     modal.open({
    //   //       content: html,
    //   //     })
    //   //     console.log(html)
    //   //   }
    //   // }
    //   // xhttp.open('GET', action.linkUrl, true)
    //   // xhttp.send()
    //   break;
    // }
    // case "download-candidcreeps-video": {
    //   if (!action.linkUrl) {
    //     return window.alert(
    //       `You tried to fetch an instagram post's photos but no link was given. Action: ${JSON.stringify(
    //         action,
    //         null,
    //         2
    //       )}`
    //     );
    //   }
    //   break;
    // }

    default:
      break
  }
})

// case 'pornhub-get-video-links': {
//   const req = new XMLHttpRequest()

//   req.onreadystatechange = function() {
//     let modalElem, nodes

//     const doc = new DOMParser().parseFromString(
//       req.responseText,
//       'text/xml',
//     )
//     const title = pornhub.getTitle()
//     const thumbnail = pornhub.getThumbnail()
//     let items = pornhub.getMediaLinks(doc)
//     console.log(JSON.stringify(items))

//     // Failed
//     if (!items) {
//       window.alert(`The media links could not be extracted. `)
//       console.log('items: ', items)
//       console.log('dispatched action: ', action)
//       return
//     }
//     // Success
//     else {
//       function formatReducer(acc, item) {
//         if (!acc[item.format]) {
//           acc[item.format] = {}
//         }
//         return acc
//       }
//       function qualitiesReducer(acc, item) {
//         if (!acc[item.format]) {
//           formatReducer(acc, item)
//         }
//         if (Array.isArray(item.quality)) {
//           item.quality.forEach((quality) => {
//             if (!Array.isArray(acc[item.format][quality])) {
//               acc[item.format][quality] = [item]
//             } else {
//               acc[item.format][quality].push(item)
//             }
//           })
//         } else {
//           if (!Array.isArray(acc[item.format][item.quality])) {
//             acc[item.format][item.quality] = [item]
//           } else {
//             acc[item.format][item.quality].push(item)
//           }
//         }
//         return acc
//       }
//       // const formatsWithQualities = formats.reduce(())
//       // Reduce to obj in format like: { [format]: Array, ...etc }
//       const callAll = (...fns) => (...args) =>
//         fns.reduce((acc, fn) => fn && fn(...args), (x) => x)
//       const xform = callAll(formatReducer, qualitiesReducer)
//       items = items.reduce(xform, {})

//       modalElem = modal.getElem()

//       function getQuality(str) {
//         return `
//               <strong style="font-style:italic;">${str}</strong>
//             `
//       }

//       // for now we will only support mp4
//       const mp4Videos = items.mp4

//       if (!mp4Videos) {
//         window.alert('No mp4 items found. Aborting...')
//         return
//       }

//       // Higher quality ones to the top
//       const mp4Formats = Object.keys(mp4Videos).reverse()

//       const htmlItems = mp4Formats.reduce((acc, format) => {
//         const item = mp4Videos[format][0]
//         return acc.concat(`
//               <div style="padding:12px;display:inline-block">
//                 <div>
//                   <div>
//                     Format: <strong>${item.format}</strong>
//                   </div>
//                   <div>
//                     Quality: ${
//                       Array.isArray(item.quality)
//                         ? item.quality.map(getQuality)
//                         : getQuality(item.quality)
//                     }
//                   </div>
//                   <div>
//                     <a href="${item.videoUrl}" target="_blank">Download</a>
//                   </div>
//                 </div>
//               </div>
//             `)
//       }, '')

//       modalElem.html(`
//           <h2 style="color:#fff;font-style:italic;margin:20px 0;">${title}</h2>
//           <div style="padding:12px;width:100%;height:100%">
//             <div style="width:100%;height:100%">
//               <div style="width:100%;height:100%;max-height:500px;overflow:hidden;">
//                 <img src="${thumbnail}" style="width:100%;height:100%;object-fit:cover"></img>
//               </div>
//             </div>
//             <div>
//               ${htmlItems}
//             </div>
//           </div>
//           `)
//       modal.open()
//     }

//     const statusCode = this.status
//     const readyState = this.readyState
//     if (readyState == 4 && statusCode == 200) {
//       console.log(req.responseText)
//     }
//   }
//   req.open('GET', action.linkUrl, true)
//   req.send()
//   break
// }

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
