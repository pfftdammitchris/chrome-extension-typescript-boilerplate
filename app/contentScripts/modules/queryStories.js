// data should be the XHR request that instagram makes from the url that starts with ?query_hash
// Click on a person's story to make that XHR request happen

const result = data.data.reels_media.reduce((acc, { items }) => {
  items.forEach((item) => {
    if (!item) {
      return
    }
    acc.push({
      dimensions: item.dimensions,
      display: item.display_resources[getLastIndex(item.display_resources)],
      thumbnail: item.display_url,
      isVideo: item.is_video,
      video: getBestVideo(item),
    })
  })
  return acc
}, [])

function getLastIndex(arr) {
  if (Array.isArray(arr)) {
    return arr.length - 1 === 0 ? 0 : arr.length - 1
  }
  return 0
}

function getBestVideo(item) {
  if (Array.isArray(item.video_resources)) {
    return item.video_resources[getLastIndex(item.video_resources)]
  }
  return null
}

const rootEl = document.getElementById('root')

function queryPhotos(items) {
  const photos = items.filter((item) => !item.isVideo)
  photos.forEach((item) => {
    if (!item) {
      return
    }
    const html = `
  <div style="display:inline-block;width:300px;height:300px;">
    <a href="${item.thumbnail}" target="_blank">
      <img src="${item.thumbnail}" style="width:100%;height:100%;" />
    </a>
  </div>
`
    rootEl.innerHTML += html
  })
}

function queryVideos(items) {
  const videos = items.filter((item) => item.isVideo)
  videos.forEach((item) => {
    if (!item) {
      return
    }
    const html = `
  <div style="display:inline-block;width:300px;height:300px">
    <a href="${item.video.src}" target="_blank">
      <img src="${item.thumbnail}" style="width:100%;height:100%;" />
    </a>
  </div>
`
    rootEl.innerHTML += html
  })
}

// const queryPhotosBtn = document.getElementById('query-photos')
// const queryVideosBtn = document.getElementById('query-videos')
// const clearQueriesBtn = document.getElementById('clear-queries')

// queryPhotosBtn.onclick = () => queryPhotos(result)
// queryVideosBtn.onclick = () => queryVideos(result)
// clearQueriesBtn.onclick = () => (rootEl.innerHTML = '')
