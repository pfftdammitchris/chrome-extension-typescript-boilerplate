import { convertToMs } from 'utils'

export interface VisibilityObj {
  ids: string[]
  items: {
    [nodeId: string]: Element
  }
}

class Filter {
  elemsList: Element[] = []
  hidden: VisibilityObj = { ids: [], items: {} }
  visible: VisibilityObj = { ids: [], items: {} }

  add(node: Element) {
    this.elemsList.push(node)
  }

  setAll(elemsList: Element[]) {
    this.elemsList = elemsList
  }

  getState(): { hidden: VisibilityObj; visible: VisibilityObj } {
    return { hidden: this.hidden, visible: this.visible }
  }

  insert(type: 'hidden' | 'visible', node: Element): Filter {
    const reversedType = type === 'hidden' ? 'visible' : 'hidden'
    if (!this[type].ids.includes(node.id)) {
      this[type].ids.push(node.id)
    }
    this[type].items[node.id] = node
    // Check and remove from the opposite if found
    if (this[reversedType].ids.includes(node.id)) {
      const index = this[reversedType].ids.indexOf(node.id)
      this[reversedType].ids.splice(index, 1)
    }
    if (node.id in this[reversedType].items) {
      delete this[reversedType].items[node.id]
    }

    return this
  }

  hide(node: Element): Filter {
    return this.insert('hidden', node)
  }

  show(node: Element): Filter {
    return this.insert('visible', node)
  }

  filter(callback: (node: Element) => boolean) {
    for (let index = 0; index < this.elemsList.length; index++) {
      const node = this.elemsList[index]
      if (callback(node)) {
        // this.show(node)
      } else {
        // this.hide(node)
      }
    }
    return
  }

  exists(type: 'hidden' | 'visible', node: Element): boolean {
    if (this[type].ids.includes(node.id)) return true
    if (node.id in this[type].items) return true
    return false
  }

  isHidden(node: Element): boolean {
    return this.exists('hidden', node)
  }

  isVisible(node: Element): boolean {
    return this.exists('visible', node)
  }
}

export default Filter
