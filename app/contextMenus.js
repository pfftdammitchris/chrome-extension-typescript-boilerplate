/* -------------------------------------------------------
  ---- Initialize context menus on installation
-------------------------------------------------------- */

function createContextMenus(contextMenus) {
  if (isArray(contextMenus)) {
    contextMenus.forEach((contextMenu) =>
      chrome.contextMenus.create(contextMenu),
    )
  }
  // We will assume that contextMenus is just a single context menu object
  else if (contextMenus) {
    chrome.contextMenus.create(contextMenus)
  }
}

/* -------------------------------------------------------
  ---- Context menu listeners
-------------------------------------------------------- */

/**
 * info:
 * @param { number | string } menuItemId - ID of the menu that was clicked
 * @param { boolean } editable - Flag indicating if the element is editable (text input, textarea, etc)
 * @param { number | string } parentMenuItemId - (optional) Parent ID if any
 * @param { string } mediaType - (optional) 'image' | 'video' | 'audio'
 * @param { string } linkUrl - (optional) Link if it was a URL
 * @param { string } srcUrl - (optional) Url for elements with a "src" URL
 * @param { string } pageUrl - (optional) URL of page the click was clicked on
 * @param { string } frameUrl - (optional) URL of frame of the element the context was clicked on
 * @param { integer } frameId - (optional) ID of frame of element where the menu was clicked (if it was a frame)
 * @param { string } selectionText - (optional) Text for context selection if any
 * @param { boolean } wasChecked - (optional) Flag indicating the state of the checkbox/radio before it was clicked
 * @param { boolean } checked - (optional) Flag indicating the state of checkbox/radio after it was clicked
 * @return {}
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log(`Context menu onClick info parameter: `, info)
  console.log(`Context menu onClick tab parameter: `, tab)
  // instagram.onContextMenuClick(info, tab)
  getActiveTab((activeTab) => {
    switch (info.menuItemId) {
      // KINK.com
      // Must be viewing a video's page (ex: kink.com/shoot/44191)
      case 'kink-get-photos':
        return dispatch(activeTab.id, { type: 'kink-get-photos', ...info })
      // INSTAGRAM
      // Must be on their profile page
      case 'instagram-query-post-photos':
        return dispatch(activeTab.id, {
          type: 'instagram-query-post-photos',
          ...info,
        })
      // PORNHUB
      // Must be on the video page
      case 'pornhub-get-video-links':
        return dispatch(activeTab.id, {
          type: 'pornhub-get-video-links',
          ...info,
        })
      default:
        break
    }
  })
})
