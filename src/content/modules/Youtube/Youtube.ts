import Filter from 'content/Filter'
import { convertToMs } from 'utils'

function Youtube(this: any, pageUrl: string) {
  this.pageUrl = pageUrl
  this.count = 0
  this.filter = new Filter()
}

Youtube.prototype.init = function(url: string) {
  if (this.pageUrl !== url) this.pageUrl = url
  const container = document.querySelector(
    '#contents.style-scope.ytd-item-section-renderer',
  )
  if (container) {
    let elemsList: any = container.querySelectorAll('ytd-video-renderer')
    elemsList = Array.from(elemsList)
    console.log(elemsList.length)

    elemsList.forEach((node: Element) => {
      const bounds = node.getBoundingClientRect()
      // If we already went through a video on the screen, just remove it from the page
      if (bounds.top < 0) {
        if (node.parentNode) {
          node.parentNode.removeChild(node)
          return
        }
      }
      if (typeof node.id === 'string') {
        if (/chromez_react/i.test(node.id)) {
          return
        }
      }
      node.id = `chromez_react${this.count}`
      this.count++
    })
    this.filter.setAll(elemsList)
  }
}

Youtube.prototype.filterByDuration = function(duration: {
  min: number
  max?: number
}) {
  this.filter.filter(function(node: Element): boolean {
    const durationElem = node.querySelector(
      'span.style-scope.ytd-thumbnail-overlay-time-status-renderer',
    )
    if (durationElem) {
      let durationTime = durationElem.textContent
      if (durationTime) {
        durationTime = durationTime.trim()
        const durationParts = durationTime.split(':')
        let hour = 0
        let min = 0
        let sec = 0
        switch (durationParts.length) {
          case 2:
            min = Number(durationParts[0])
            sec = Number(durationParts[1])
            break
          case 3:
            hour = Number(durationParts[0])
            min = Number(durationParts[1])
            sec = Number(durationParts[3])
            break
          default:
            break
        }
        let currentDurationInMs = convertToMs(hour, 'hours')
        currentDurationInMs += convertToMs(min, 'minutes')
        currentDurationInMs += convertToMs(sec, 'seconds')
        let maxMs
        const minMs = convertToMs(duration.min, 'minutes')
        if (typeof duration.max === 'number') {
          maxMs = convertToMs(duration.max, 'minutes')
        }
        if (currentDurationInMs < minMs) {
          if (node.parentNode) {
            node.parentNode.removeChild(node)
            return false
          }
        }
        if (typeof maxMs === 'number') {
          if (currentDurationInMs > maxMs) {
            if (node.parentNode) {
              node.parentNode.removeChild(node)
              return false
            }
          }
        }
        return true
      }
    }
    return false
  })
  const state = this.filter.getState()
  console.log(
    `%chidden: ${state.hidden.ids.length}   |   visible: ${state.visible.ids.length}`,
    'color:blue;',
  )
}

export default Youtube
