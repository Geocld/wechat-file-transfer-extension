function getMessages() {
  injectScript(chrome.extension.getURL('chrome/catchList.js'), 'body')
  window.addEventListener('message', function(e) {
    // console.log('收到了来自inject script的信息:')
    // console.log(e.data.data)
    chrome.runtime.sendMessage({chatList: e.data.data});
  }, false);
}

document.addEventListener('DOMContentLoaded', function () {

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log('received:')
    console.log(request, sender, sendResponse)
    
    sendResponse('received ok, request:', request)

    if (request.getChatList) {
      getMessages()
    }

    if (request.sendMessage) {
      injectScript(chrome.extension.getURL('chrome/sendMessage.js'), 'body', { message: request.message })
    }

    if (request.sendFile) {
      injectScript(chrome.extension.getURL('chrome/sendFile.js'), 'body')
    }
  })


  // dom observer
  let NEWEST = new Date().getTime();
  const targetNode = document.body;
  var callback = function () {
    const now = new Date().getTime();
    if (now - NEWEST > 100) {
      NEWEST = now;
      try {
        // chrome.runtime.sendMessage({ update: true });
        setTimeout(() => {
          getMessages()
        }, 500)
      } catch (e) {
        if (
          e.message.match(/Invocation of form runtime\.connect/) &&
          e.message.match(/doesn't match definition runtime\.connect/)
        ) {
          console.error('Chrome extension, Actson has been reloaded. Please refresh the page');
        } else {
          throw (e);
        }
      }
    }
  };

  const observer = new MutationObserver(callback);

  observer.observe(targetNode, { attributes: true, childList: true, subtree: true, characterData: true });
});

function injectScript(filePath, tag, params) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', filePath);
  script.onload = function () {
    if (document.getElementById('paramsContainer')) {
      // 先移除参数div
      this.parentNode.removeChild(document.getElementById('paramsContainer'));
    }
    // 执行完后移除掉
    this.parentNode.removeChild(this);
  };
  if (params) {
    var paramsContainer = document.createElement('div');
    paramsContainer.style.display = 'none';
    paramsContainer.setAttribute('id', 'paramsContainer');
    for (var key in params) {
      paramsContainer.setAttribute(key, params[key]);
    }
    node.appendChild(paramsContainer);
  }
  node.appendChild(script);
}

