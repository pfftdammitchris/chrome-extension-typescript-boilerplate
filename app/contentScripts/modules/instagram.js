// Instagram module
// All interactive objects must be jQuery-ified before using!
const instagram = (function() {
  const dataKeywordRegex = /window.__additionalDataLoaded/i
  // const regex = /window._sharedData/i

  function _extractSharedData(textContent) {
    if (!dataKeywordRegex.test(textContent)) {
      return window.alert(
        'You tried to extract shared data but no window._sharedData was found.',
      )
    }
    const start = textContent.indexOf('{')
    const end = textContent.lastIndexOf('}') + 1
    const jsonStr = textContent.substring(start, end)
    try {
      const json = JSON.parse(jsonStr)
      return json
    } catch (error) {
      // window.alert(`Error parsing sharedData: `, error.message)
      return false
    }
  }

  function _getLast(arr) {
    return arr.slice(arr.length - 1)
  }

  return {
    user: {
      homepage: {
        getPhotosFromPost($html) {
          if (!$html) {
            return window.alert(
              `You tried to get photos but no jquery nodes were passed in.`,
            )
          }
          let sharedData
          $html.filter((index, elem) => {
            // const regex = /window._sharedData =/i
            if (elem.tagName === 'SCRIPT' || elem.type === 'text/javascript') {
              if (dataKeywordRegex.test(elem.textContent)) {
                sharedData = _extractSharedData(elem.textContent)
              }
            }
          })
          if (!sharedData) {
            return window.alert(
              `There was non shared data for this instagram post. Returning now...`,
            )
          }

          // console.log(sharedData)
          const { graphql } = sharedData
          const data = graphql.shortcode_media
          const isMultiple = data.edge_sidecar_to_children !== undefined
          const result = {
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
          console.log(result)
          return result
        },
        // queryPhotosFromPost(html) {
        //   if (!html) {
        //     return window.alert(
        //       `You tried to get photos but there was no HTML passed in`,
        //     )
        //   }
        //   let sharedData
        //   const doc = new DOMParser().parseFromString(html)
        //   $html.filter((index, elem) => {
        //     const regex = /window._sharedData =/i
        //     if (elem.tagName === 'SCRIPT' || elem.type === 'text/javascript') {
        //       if (regex.test(elem.textContent)) {
        //         sharedData = _extractSharedData(elem.textContent)
        //       }
        //     }
        //   })
        //   if (!sharedData) {
        //     return window.alert(
        //       `There was non shared data for this instagram post. Returning now...`,
        //     )
        //   }
        //   // console.log(sharedData)
        //   const { graphql } = sharedData.entry_data.PostPage[0]
        //   if (!graphql) {
        //     return window.alert(`No data available for index ${index}`)
        //   }
        //   const data = graphql.shortcode_media
        //   const isMultiple = data.edge_sidecar_to_children !== undefined
        //   return {
        //     owner: data.owner,
        //     id: data.id,
        //     shortcode: data.shortcode,
        //     isVideo: data.is_video,
        //     location: data.location,
        //     photos: isMultiple
        //       ? data.edge_sidecar_to_children.edges.map(
        //           ({ node }) => _getLast(node.display_resources)[0],
        //         )
        //       : [{ src: data.display_url }],
        //     likes: data.edge_media_preview_like,
        //     comments: data.edge_media_preview_comment.edges.map(({ node }) => ({
        //       [node.owner.username]: node,
        //     })),
        //     timestampTaken: data.taken_at_timestamp,
        //   }
        // },
      },
    },
  }
})()
