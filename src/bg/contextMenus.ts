import { dispatch } from 'bg/utils'
import { MY_CONTEXT_MENU_ITEM } from '../constants'

chrome.contextMenus.onClicked.addListener(
  (
    info: {
      menuItemId: string
      linkUrl?: string
      pageUrl?: string
      srcUrl?: string
    },
    tab: any,
  ) => {
    console.log(info)

    switch (info.menuItemId) {
      case MY_CONTEXT_MENU_ITEM:
        return dispatch({
          type: MY_CONTEXT_MENU_ITEM,
          tabId: tab.id,
          ...info,
        })
      default:
        break
    }
  },
)
