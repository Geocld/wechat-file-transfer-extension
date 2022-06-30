function getMessages() {
  injectScript(chrome.runtime.getURL('chrome/catchList.js'), 'body')
}

document.addEventListener('DOMContentLoaded', function () {

  window.addEventListener(
    'message',
    function (e) {
      console.log('收到了来自inject script的信息:')
      console.log(e.data)
      
      if (e.data.chatList) {
        chrome.runtime.sendMessage({ chatList: e.data.chatList })
      }

      if (e.data.updateChatList) {
        getMessages()
      }
      
    },
    false
  )

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('received:')
    console.log(request, sender, sendResponse)

    // must have sendResponse, otherwise get error: 
    // the message port closed before a response was received. chrome extension
    sendResponse('received ok, request:', request)

    if (request.getChatList) {
      getMessages()
    }

    if (request.sendMessage) {
      injectScript(chrome.runtime.getURL('chrome/sendMessage.js'), 'body', { message: request.message })
    }

    if (request.sendFile) {
      injectScript(chrome.runtime.getURL('chrome/sendFile.js'), 'body')
    }

    if (request.logout) {
      injectScript(chrome.runtime.getURL('chrome/logout.js'), 'body')
    }
  })
})

function injectScript(filePath, tag, params) {
  var node = document.getElementsByTagName(tag)[0]
  var script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', filePath)
  script.onload = function () {
    if (document.getElementById('paramsContainer')) {
      // 先移除参数div
      this.parentNode.removeChild(document.getElementById('paramsContainer'))
    }
    // 执行完后移除掉
    this.parentNode.removeChild(this)
  }
  if (params) {
    var paramsContainer = document.createElement('div')
    paramsContainer.style.display = 'none'
    paramsContainer.setAttribute('id', 'paramsContainer')
    for (var key in params) {
      paramsContainer.setAttribute(key, params[key])
    }
    node.appendChild(paramsContainer)
  }
  node.appendChild(script)
}
