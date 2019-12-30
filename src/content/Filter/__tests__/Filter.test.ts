import Filter from '..'

let filter: Filter

beforeEach(() => {
  // @ts-ignore
  filter = new Filter([{ id: 'id123' }, { id: 'id456' }])
})

it('should instantiate with this.visible and this.hidden', () => {
  expect(filter).toHaveProperty('hidden')
  expect(filter).toHaveProperty('visible')
})

it('should add to hidden', () => {
  // @ts-ignore
  filter.insert('hidden', { id: 'me' })
  const { hidden, visible } = filter.getState()
  expect(hidden.ids).toContain('me')
  expect(hidden.items).toHaveProperty('me')
  expect(visible.ids).not.toContain('me')
  expect(visible.items).not.toHaveProperty('me')
})

it('should add to visible', () => {
  // @ts-ignore
  filter.insert('visible', { id: 'me' })
  const { hidden, visible } = filter.getState()
  expect(visible.ids).toContain('me')
  expect(visible.items).toHaveProperty('me')
  expect(hidden.ids).not.toContain('me')
  expect(hidden.items).not.toHaveProperty('me')
})

it('should filter elements correctly', () => {
  const nodeList = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
  ]
  // @ts-ignore
  const myFilter = new Filter(nodeList)
  myFilter.filter(function(node: Element) {
    return Number(node.id) % 2 === 0
  })
  expect(myFilter.visible.ids).toContain(2)
  expect(myFilter.visible.ids).toContain(4)
  expect(myFilter.visible.ids).toContain(6)
  expect(myFilter.visible.items).toHaveProperty('2')
  expect(myFilter.visible.items).toHaveProperty('4')
  expect(myFilter.visible.items).toHaveProperty('6')
  expect(myFilter.hidden.ids).not.toContain(2)
  expect(myFilter.hidden.ids).not.toContain(4)
  expect(myFilter.hidden.ids).not.toContain(6)
  expect(myFilter.hidden.items).not.toHaveProperty('2')
  expect(myFilter.hidden.items).not.toHaveProperty('4')
  expect(myFilter.hidden.items).not.toHaveProperty('6')
})
