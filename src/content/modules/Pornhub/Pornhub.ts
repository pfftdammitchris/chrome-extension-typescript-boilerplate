import Filter from 'content/Filter'
import { ElemsState } from './types'

function usePornhub() {
  const [state, dispatch] = React.useReducer(initialState, reducer)
  const ref = React.useRef<any>()

  function filterByDuration(url: string, { duration: { min }, containerId }) {
    const container = document.getElementById(containerId)
    const elemsList = container.querySelectorAll('li')

    const results = []

    elemsList.forEach((elem) => {
      let id,
        url,
        relatedUrl,
        title,
        duration,
        quality,
        username,
        profile,
        views,
        rating,
        added,
        src,
        thumbUrl

      id = elem.dataset.id
      const vkey = elem.getAttribute('_vkey')
      const anchorVideoThumb = elem.getElementsByClassName('linkVideoThumb')[0]
      if (anchorVideoThumb) {
        url = anchorVideoThumb.getAttribute('href')
        relatedUrl = anchorVideoThumb.dataset.relatedUrl
        title = anchorVideoThumb.dataset.title
        const img = anchorVideoThumb.querySelector('img')
        if (img) {
          src = img.dataset.src
          thumbUrl = img.dataset.thumbUrl
        }
      }
      const durationElem = elem.getElementsByClassName('duration')[0]
      if (durationElem) {
        duration = Number(durationElem.innerText.split(':')[0])
        if (duration < min) {
          elem.style.display = 'none'
        }
      }
      const qualityElem = elem.getElementsByClassName('hd-thumbnail')[0]
      if (qualityElem) quality = qualityElem.innerText
      const usernameElem = elem.getElementsByClassName('usernameWrap')[0]
      if (usernameElem) {
        const userAnchorElem = usernameElem.querySelector('a')
        if (userAnchorElem) {
          username = userAnchorElem.getAttribute('title')
          profile = userAnchorElem.getAttribute('href')
        }
      }
      const viewsElem = elem.getElementsByClassName('views')[0]
      if (viewsElem) views = viewsElem.innerText
      const ratingElem = elem.querySelector('.rating-container .value')
      if (ratingElem) rating = ratingElem.innerText
      const addedElem = elem.getElementsByClassName('added')[0]
      if (addedElem) added = addedElem.innerText

      results.push({
        id,
        vkey,
        url,
        relatedUrl,
        title,
        duration,
        quality,
        username,
        profile,
        views,
        rating,
        added,
        src,
        thumbUrl,
      })
    })

    return results
  }

  function filterPlaylistVideos(url: string, filter) {
    if ('duration' in filter) {
      const { min, max } = filter.duration
      // setup
      if (!document.getElementById('view-display-status')) {
        // const overlay = document.createElement('div')
        const overlay = React.createElement('div')
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
    }
  }

  function addHiddenElem(id: string, options: any) {
    if (pageObj) {
      const visibleElems = visiblesRef.current
      const hiddenElems = hiddensRef.current
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
        hiddenElems.items[id] = createPageObjElemObj(options)
      }
    } else {
      console.error(
        'No page object! Please create a page object and pass it as arguments',
      )
    }
  }

  function addVisibleElem(id: string, options: any) {
    if (pageObj) {
      const visibleElems = visiblesRef.current
      const hiddenElems = hiddensRef.current
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
        visibleElems.items[id] = createPageObjElemObj(options)
      }
    } else {
      console.error(
        'No page object! Please create a page object and pass it as arguments',
      )
    }
  }

  function createPageObjElemObj(options: any) {
    return {
      elem: options.elem,
      details: options.details,
      ...options,
    }
  }

  function filter(type: string, options: any = {}) {
    switch (type) {
      case 'duration': {
        const { pageUrl, linkUrl = pageUrl } = options
        if (linkUrl) {
          if (!(linkUrl in _store.playlist.page)) {
            _store.playlist.page[linkUrl] = createPageObj()
          }
          return filterDuration(_store.playlist.page[linkUrl], options)
        } else {
          console.error('No link URL was found!')
        }
      }
      default:
        break
    }
  }

  function filterDuration(options: any) {
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

      const phImageEl = liElem.querySelector('div.phimage')
      const durationEl = phImageEl.getElementsByClassName('duration')[0]
      let durationMins =
        durationEl && durationEl.innerText && durationEl.innerText.split(':')[0]
      duration = durationEl && durationEl.innerText
      durationMins = Number(durationMins)

      // Check the duration first since we have a chance to bail out
      //  early before unnecessarily continuing
      if (typeof durationMins === 'number') {
        if (durationMins < minDuration) {
          // If its already hidden then we don't need to proceed
          if (pageObj.hiddenElems.ids.includes(id)) {
            return
          }
        }
      }

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

        const usernameEl = uploaderBlockEl.querySelector('div.usernameWrap')

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

      if (phImageEl) {
        const qualityEl = phImageEl.getElementsByClassName('hd-thumbnail')[0]

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

      if (typeof durationMins === 'number') {
        const pageObjElemObj = ph.playlist.page.createPageObjElemObj({
          elem: liElem,
          details,
        })
        // Add to hidden elems
        if (durationMins <= minDuration) {
          ph.playlist.page.addHiddenElem(id, pageObj, pageObjElemObj)
          liElem.parentNode.removeChild(liElem)
        }
        // Add to visible elems
        else {
          ph.playlist.page.addVisibleElem(id, pageObj, pageObjElemObj)
        }
      }
      return details
    }
  }

  return {
    addVisibleElem,
    addHiddenElem,
    filter,
    filterByDuration,
    filterPlaylistVideos,
  }
}

export default usePornhub
