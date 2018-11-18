# Snake: Google Chrome Extension

---

# Features:

## Spankbang

- Detects and retrieves the highest quality link possible in a video page by copying the URL to your clipboard.

### Shortcuts

| Keys         | Description                  |
| ------------ | ---------------------------- |
| Ctrl + Space | Copy video link to clipboard |

## Notes for SpankBang Galleria:

URL schemes:

- base: https://spankbang.com
- new: /new_videos/

1. Grab all links similar to: https://spankbang.com/2qh15/video/monster+ass+public+fucked
2. Send request
3. Retrieve source code
  1. Parse thumbnails:
    1. document.getElementsByClassName('thumbnails')[0].children      *iterate*
    2. child.children: 
      1. [0] > img.src && img.title
      2. [1] > span.innerText
  2. Parse highest download link
    1. Invoke fn.downloadVideo()
  3. Parse uploader username
    1. document.querySelector('a.user')
      1. href: .getAttribute('href')
      2. username: .innerText
      3. avatar: .firstChild.getAttribute('src')