<script>
  // @ts-nocheck
  import { onMount } from 'svelte'

  let isLogin = false
  let hasOpenWx = false
  let message = ''
  let showMore = false
  let isSending = false
  let chatList = []

  const viewPage = () => {
    let windowId = null
    chrome.windows.getAll(
      {
        populate: true
      },
      function (windows) {
        windows.forEach(function (win) {
          if (win.tabs.length) {
            win.tabs.forEach(function (tab) {
              if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
                windowId = tab.windowId
              }
            })
          }
        })

        if (windowId) {
          chrome.windows.update(windowId, { focused: true })
          window.close()
        } else {
          chrome.windows.create(
            {
              url: 'https://filehelper.weixin.qq.com',
              type: 'popup',
              focused: true
            },
            function (w) {
              console.log(w)
              window.close()
            }
          )
        }
      }
    )
  }

  function callTabAndSendMessage(params, callback) {
    chrome.windows.getAll(
      {
        populate: true
      },
      wins => {
        wins.forEach(win => {
          win.tabs.forEach(tab => {
            if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
              chrome.tabs.sendMessage(tab.id, { ...params }, function (response) {
                console.log(response)
                console.log('message has send to wxobserve.js')
                callback && callback()
              })
            }
          })
        })
      }
    )
  }

  function callTabAndExecuteScript(file, callback) {
    chrome.windows.getAll(
      {
        populate: true
      },
      wins => {
        wins.forEach(win => {
          win.tabs.forEach(tab => {
            if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
              hasOpenWx = true // already open wx
              chrome.tabs.executeScript(
                tab.id,
                {
                  file
                },
                res => {
                  callback(res)
                }
              )
            }
          })
        })
      }
    )
  }

  const sendMessage = () => {
    if (!message.length || isSending) {
      return false
    }
    isSending = true
    callTabAndSendMessage({ sendMessage: true, message }, () => {
      isSending = false
      message = ''
    })
  }

  const sendFile = () => {
    callTabAndSendMessage({ sendFile: true })
  }

  const checkLogin = () => {
    return new Promise(resolve => {
      callTabAndExecuteScript('chrome/wxInfo.js', res => {
        const info = res[0]
        isLogin = info.isLogin
        resolve(isLogin)
      })
    })
  }

  const handleMore = () => {
    showMore = !showMore
  }

  const logout = () => {
    callTabAndSendMessage({ logout: true })
    window.close()
  }

  onMount(async () => {
    const login = await checkLogin()
    if (login) {
      console.log('catchList')

      // 监听content script那边发送过来的数据（聊天列表）
      chrome.runtime.onMessage.addListener(request => {
        chatList = request.chatList
      })

      callTabAndSendMessage({ getChatList: true })
    }
  })
</script>

<main class="wrap">
  {#if isLogin}
    <div class="chat-panel">
      <div class="chat-header">
        <div class="header-title">文件传输助手</div>

        <span class="more">
          <img src="/images/dot.svg" alt="" on:click={handleMore} />
        </span>

        {#if showMore}
          <div class="more-popup">
            <div class="more-popup-item" on:click={viewPage}>进入网页版</div>

            {#if isLogin}
              <div class="more-popup-item" on:click={logout}>退出</div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="chat-body">
        {#each chatList as { type, text, img, fileTitle, fileDesc }}
          {#if type === 'text'}
            <div class="msg-content">
              <div class="msg-text">{text}</div>
            </div>
          {:else if type === 'image'}
            <div class="msg-content">
              <div class="msg-image"><img src={img} alt="" /></div>
            </div>
          {:else if type === 'file'}
            <div class="msg-content">
              <div class="msg-file">
                <div class="file-icon">
                  <img src="/images/txt.png" alt="" />
                </div>
                <div class="file-content">
                  <p class="file-title">{fileTitle}</p>
                  <p class="file-desc">{fileDesc}</p>
                </div>
              </div>
            </div>
          {:else}
            <div class="msg-content">
              <div class="msg-text">{text}</div>
            </div>
          {/if}
        {/each}
      </div>

      <div class="chat-footer">
        <div class="operations">
          <span class="icon-file" on:click={sendFile} />
        </div>
        <textarea class="chat-input" bind:value={message} />
        <div class="input-send">
          <span class="btn {message.length || !isSending ? '' : 'btn-disabled'}" on:click={sendMessage}>
            {isSending ? '发送中...' : '发送'}
          </span>
        </div>
      </div>
    </div>
  {:else}
    <div class="chat-header">
      <div class="header-title">文件传输助手</div>
    </div>
    <img src="/images/cover.jpeg" alt="" style="width: 100%; vertical-align: top;" />
    <span class="btn btn-block" on:click={viewPage}>登录</span>
  {/if}
</main>

<style>
  @import 'normalize.css';
  .wrap {
    width: 500px;
    min-height: 200px;
    background: #f9f9f9;
  }
  .btn {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    box-sizing: border-box;
    color: #07c160;
    line-height: 32px;
    min-width: 110px;
    padding: 0 24px;
    text-align: center;
    vertical-align: middle;
    font-size: 14px;
    cursor: pointer;
  }
  .btn-disabled {
    background-color: rgba(0, 0, 0, 0.08);
    color: #999;
  }
  .btn-block {
    display: block;
    width: 100%;
  }
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 500px;
  }
  .chat-header {
    position: relative;
    border-bottom: 1px solid #e3e4e5;
  }
  .header-title {
    padding: 0 8px;
    color: #191919;
    height: 30px;
    line-height: 30px;
    font-weight: bold;
  }
  .more {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .more img {
    width: 100%;
    vertical-align: top;
    cursor: pointer;
  }
  .more-popup {
    position: absolute;
    z-index: 999;
    top: 28px;
    right: 10px;
    background: #fff;
    border-radius: 5px;
    padding: 0 10px;
  }
  .more-popup-item {
    cursor: pointer;
    font-size: 13px;
    padding: 5px 0;
  }
  .chat-body {
    flex: 1;
    box-sizing: border-box;
    height: 70%;
    overflow-y: auto;
  }
  .msg-content {
    display: flex;
    font-size: 14px;
  }
  .msg-text,
  .msg-file {
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    flex-direction: row-reverse;
    margin: 10px;
  }
  .msg-text {
    display: block;
    max-width: 250px;
    text-align: left;
    word-break: break-all;
    background: #95ec69;
    line-height: 1.5;
  }
  .msg-file {
    background: #fff;
    align-items: center;
    justify-content: space-between;
    min-height: 65px;
    width: 148px;
    cursor: pointer;
  }
  .file-icon img {
    width: 40px;
    height: 40px;
  }
  .file-desc {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }
  .msg-image {
    flex: 1;
  }
  .msg-image img {
    max-width: 50%;
  }

  .chat-footer {
    border-top: 1px solid #e3e4e5;
    display: flex;
    flex-direction: column;
    height: 150px;
  }
  .operations {
    display: flex;
    padding: 10px 16px;
  }
  .icon-file {
    background: url('/images/icon__file.svg') no-repeat 50% / contain;
    height: 15px;
    width: 17px;
    cursor: pointer;
  }
  .chat-input {
    border: none;
    resize: none;
    flex: 1;
    font-size: 14px;
    padding: 0 8px;
    outline: none;
    background: #f9f9f9;
  }
  .input-send {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px;
    line-height: 32px;
  }
</style>
