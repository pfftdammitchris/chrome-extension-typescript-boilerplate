const spankbang = (function() {
  const self = this
  self.history = {}
  self._galleria = new Galleria()
  self.paths = {
    base: 'https://spankbang.com',
    categories: '/categories',
    trending: '/trending_videos',
    upcoming: '/upcoming',
    interesting: '/interesting',
    new: '/new_videos',
    longest: '/longest_videos',
    popular: (opts) => {
      let url = '/most_popular'
      if (opts.period && self.periods.includes(opts.period))
        url += '/?period=' + opts.period
      return url
    },
    pornstars: '/pornstars',
    users: {
      profile: (opts) => '/hot/' + opts.username,
      videos: '/users/videos',
      recommendations: '/users/recommendations',
      subscriptions: '/users/social',
      playlists: '/users/playlists',
      liked: '/users/liked',
      history: '/users/history',
    },
  }

  self.periods = ['today', 'week', 'month', 'season', 'year', 'all']

  self.categories = [
    'amateur',
    'anal',
    'asian',
    'babe',
    'bbw',
    'big ass',
    'big dick',
    'big tits',
    'blonde',
    'blowjob',
    'bondage',
    'brunette',
    'cam',
    'compilation',
    'creampie',
    'cumshot',
    'deep throat',
    'dp',
    'ebony',
    'fetish',
    'fisting',
    'gay',
    'groupsex',
    'handjob',
    'hardcore',
    'hentai',
    'homemade',
    'indian',
    'interracial',
    'japanese',
    'latina',
    'lesbian',
    'massage',
    'masturbation',
    'mature',
    'milf',
    'pov',
    'public',
    'redhead',
    'shemale',
    'small tits',
    'solo',
    'squirt',
    'striptease',
    'teen',
    'threesome',
    'toy',
    'vintage',
    'vr',
  ]

  self.videoQualities = [
    'stream_url_4k',
    'stream_url_1080p',
    'stream_url_720p',
    'stream_url_480p',
    'stream_url_320p',
    'stream_url_240p',
  ]

  // Download initiates when IDM picks up the data from clipboard as a link
  // If IDM is not installed, then the user just has the link copied to clipboard
  function downloadVideo({ callback }) {
    const elem = document.querySelector('#video').nextElementSibling
      .nextElementSibling
    const contents = elem.innerHTML
    const start = contents.search(/var cover_image/)
    const end = contents.indexOf('</script>', start)
    /*
      Received the url lines as an array
      Ex: [
          'var stream_shd  = 0;',
          'var stream_id  = '2pto1';',
          'var stream_url_720p  = 'https://vcdn2.spankbang.com/4/5/4564081-720p.mp4?st=lu3rf1jiGJypqzYJWuqttg&e=1542147928;'
          ...etc
        ]
    */
    const urlLines = contents
      .slice(start, end)
      .replace(/(var|\')/gi, '')
      .split(/;/)
      .map((str) => str.trim())
    // Final object with key + values { stream_u_id: '43423', stream_sd: '1', ...etc }
    const queries = urlLines.reduce((acc, str) => {
      const key = str.slice(0, str.search(/ /)).trim()
      const value = str.slice(str.search(/=/) + 1).trim()
      if (!(key in acc)) acc[key] = value
      return acc
    }, {})
    const downloadLink = self.retrieveHighestVideoDownloadLink(queries)
    if (!downloadLink) return null
    const inputElem = document.createElement('input')
    inputElem.value = downloadLink
    document.body.appendChild(inputElem)
    inputElem.select()
    document.execCommand('copy')
    storage.push('videos', downloadLink)
    storage.save()
    if (typeof callback === 'function') {
      callback(downloadLink)
    }
  }

  /** Grabs the highest available quality url and returns it
   * @param { object } queries - Key/value pairs where keys are the key and the values are the links
   */
  function getHighest(queries) {
    let url
    for (let i = 0; i < videoQualities.length; i++) {
      const quality = videoQualities[i]
      if (!!queries[quality]) {
        url = queries[quality]
        return url
      }
    }
    if (!url) return null
  }

  function initGalleria({ query = '/trending_videos', tab } = {}) {
    // Use previously fetched data to save resources
    if (self.history[tab.url]) {
      console.log('Using previously fetched data...')
      return Port.postMessage({
        query: 'galleria-display',
        data: self.history[tab.url],
      })
    }
    if (!/spankbang/i.test(self._galleria.url)) {
      self._galleria.setUrl(self.paths.base + query)
    }
    let currentTab = tab
    if (!currentTab) {
      fn.getActiveTab((activeTab) => (currentTab = activeTab))
    }
    Port.postMessage({
      query: 'galleria',
      selector: '#browse',
      webApp: 'spankbang',
    })
  }

  // Invoked from Port, originating from client side
  function displayGalleria({ videoPages, url }) {
    // Accumulates to sections array, sends it to content to display in the modal
    // Each item in this array represents a video
    const videoResults = []
    for (let i = 0; i < videoPages.length; i++) {
      $.ajax(videoPages[i].pageUrl)
        .done((data) => {
          const videoPage = videoPages[i]
          $.each($.parseHTML(data), (i, el) => {
            if (el.tagName === 'MAIN') {
              const wrapper = $(el).find('.thumbnails')
              const thumbElems = wrapper.children()
              const thumbnails = []
              $.each(thumbElems, (ii, thumbElem) => {
                const thumbUrl = $(thumbElem)
                  .find('img')
                  .attr('src')
                const seekTime = $(thumbElem)
                  .find('span')
                  .text()
                thumbnails.push({ thumbnail: thumbUrl, seekTime })
              })
              // Every video should have a thumbnail for sure. If thumbnails array is empty, we might have
              // hit a random link. don't include those.
              if (thumbnails.length) {
                videoResults.push({ ...videoPage, thumbnails })
              }
            }
          })
          if (i === videoPages.length - 1) {
            callback({ url })
          }
        })
        .fail((error) => {
          console.error(error)
        })
    }
    function callback({ url } = {}) {
      if (videoResults.length) {
        self.history[url] = videoResults
        Port.postMessage({
          query: 'galleria-display',
          data: videoResults,
        })
      } else {
        Port.postMessage({
          modal: {
            title: 'A problem occurred.',
            message: 'Could not find any video links from this page.',
          },
        })
      }
    }
  }

  return {
    downloadVideo,
    retrieveHighestVideoDownloadLink: getHighest,
    categories: self.categories,
    paths: self.paths,
    periods: self.periods,
    videoQualities: self.videoQualities,
    galleria: initGalleria,
    displayGalleria,
  }
})()
