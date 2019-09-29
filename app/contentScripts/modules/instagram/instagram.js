// Instagram module
// All interactive objects must be jQuery-ified before using!
const instagram = (function() {
  function _extractSharedData(textContent) {
    const regex = /window._sharedData/i
    if (!regex.test(textContent)) {
      return console.warn(
        'You tried to extract shared data but no window._sharedData was found.',
      )
    }
    const start = textContent.indexOf('{')
    const end = textContent.lastIndexOf('}') + 1
    const jsonStr = textContent.slice(start, end)
    try {
      const json = JSON.parse(jsonStr)
      return json
    } catch (error) {
      console.warn(`Error parsing sharedData: `, error)
      return false
    }
  }

  function _getLast(arr) {
    return arr.slice(arr.length - 1)
  }

  return {
    getPhotosFromPost($html) {
      if (!$html) {
        return console.warn(
          `You tried to get photos but no jquery nodes were passed in.`,
        )
      }
      let sharedData
      $html.filter((index, elem) => {
        const regex = /window._sharedData =/i
        if (elem.tagName === 'SCRIPT' || elem.type === 'text/javascript') {
          if (regex.test(elem.textContent)) {
            sharedData = _extractSharedData(elem.textContent)
          }
        }
      })
      if (!sharedData) {
        return console.warn(
          `There was non shared data for this instagram post. Returning now...`,
        )
      }
      // console.log(sharedData)
      const { graphql } = sharedData.entry_data.PostPage[0]
      if (!graphql) {
        return console.warn(`No data available for index ${index}`)
      }
      const data = graphql.shortcode_media
      const isMultiple = data.edge_sidecar_to_children !== undefined
      return {
        owner: data.owner,
        id: data.id,
        shortcode: data.shortcode,
        isVideo: data.is_video,
        location: data.location,
        photos: isMultiple
          ? data.edge_sidecar_to_children.edges.map(
              ({ node }) => _getLast(node.display_resources)[0],
            )
          : [{ src: data.display_url }],
        likes: data.edge_media_preview_like,
        comments: data.edge_media_preview_comment.edges.map(({ node }) => ({
          [node.owner.username]: node,
        })),
        timestampTaken: data.taken_at_timestamp,
      }
    },
  }
})()
