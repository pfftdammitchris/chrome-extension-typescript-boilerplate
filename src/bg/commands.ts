import { dispatch, getActiveTab } from 'bg/utils'

chrome.commands.onCommand.addListener((command: string) => {
  console.log(`%ccommand: ${command}`, 'color:magenta;font-weight:500;')

  // Look in manifest.json
  if (command === 'my_custom_command') {
    getActiveTab((tab: any) => {
      dispatch({ type: command, tabId: tab.Id, ...tab })
    })
  }
})
