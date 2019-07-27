const instagram = (function() {
  console.log('instagram module loaded')
  return {
    onContextMenuClick(...args) {
      console.log(`instagram module onContextMenuClick:`, args)
    },
  }
})()
