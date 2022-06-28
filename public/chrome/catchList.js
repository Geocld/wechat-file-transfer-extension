function catchList() {
  const listDoms = document.querySelectorAll('.msg-list__item .msg-item__content')
  let list = []
  for (let i = 0; i < listDoms.length; i++) {
    const firstNode = listDoms[i].firstElementChild
    if (firstNode) {
      const className = firstNode.className
      let type = ''
      let text = ''
      let img = ''
      let canDownload = false
      let fileTitle = ''
      let fileDesc = ''
      if (className === 'msg-file') {
        type = 'file'
        fileTitle = firstNode.querySelector('.msg-file__title').textContent
        fileSize = firstNode.querySelector('.msg-file__desc').textContent
      } else if (className === 'msg-text') {
        type = 'text'
        text = firstNode.textContent
      } else if (className === 'msg-image') {
        type = 'image'
        img = firstNode.querySelector('img').src
        canDownload = !!firstNode.querySelector('.icon__download')
      }
      list.push({
        text,
        type,
        img,
        fileTitle,
        fileDesc,
        canDownload
      })
    }
  }
  
  // send message to content script
  window.postMessage({ "data": list }, '*');
}

catchList()
