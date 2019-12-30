import * as c from '../constants'

chrome.runtime.onMessage.addListener((action: any) => {
  console.log(action)

  switch (action.type) {
    case c.MY_CONTEXT_MENU_ITEM: {
      window.alert(`Received action type: ${action.type}`)
      break
    }
  }
})
