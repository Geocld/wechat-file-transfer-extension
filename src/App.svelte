<script>
  // @ts-nocheck
  import { onMount } from "svelte";

  let isLogin = false;
  let hasOpenWx = false;
  let message = "";
  let chatList = [];

  const viewPage = () => {
    let windowId = null;
    chrome.windows.getAll(
      {
        populate: true,
      },
      function (windows) {
        windows.forEach(function (win) {
          if (win.tabs.length) {
            win.tabs.forEach(function (tab) {
              if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
                windowId = tab.windowId;
              }
            });
          }
        });

        if (windowId) {
          chrome.windows.update(windowId, { focused: true });
          window.close();
        } else {
          chrome.windows.create(
            {
              url: "https://filehelper.weixin.qq.com",
              type: "popup",
              focused: true,
            },
            function (w) {
              console.log(w);
              window.close();
            }
          );
        }
      }
    );
  };

  const sendMessage = () => {
    if (!message.length) {
      return false;
    }
    chrome.windows.getAll(
      {
        populate: true,
      },
      (wins) => {
        wins.forEach((win) => {
          win.tabs.forEach((tab) => {
            if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
              chrome.tabs.sendMessage(
                tab.id,
                { sendMessage: true, message },
                function (response) {
                  console.log(response);
                  console.log("message has send to wxobserve.js");
                  message = "";
                }
              );
            }
          });
        });
      }
    );
  };

  const sendFile = () => {
    chrome.windows.getAll(
      {
        populate: true,
      },
      (wins) => {
        wins.forEach((win) => {
          win.tabs.forEach((tab) => {
            if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
              chrome.tabs.sendMessage(
                tab.id,
                { sendFile: true },
                function (response) {
                  console.log("message has send to wxobserve.js");
                }
              );
            }
          });
        });
      }
    );
  };

  const checkLogin = () => {
    return new Promise((resolve) => {
      chrome.windows.getAll(
        {
          populate: true,
        },
        (wins) => {
          wins.forEach((win) => {
            win.tabs.forEach((tab) => {
              if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
                hasOpenWx = true; // already open wx
                chrome.tabs.executeScript(
                  tab.id,
                  {
                    file: "chrome/wxInfo.js",
                  },
                  (res) => {
                    const info = res[0];
                    isLogin = info.isLogin;
                    resolve(isLogin);
                  }
                );
              }
            });
          });
        }
      );
    });
  };

  onMount(async () => {
    const login = await checkLogin();
    if (login) {
      console.log("catchList");
      
      // 监听content script那边发送过来的数据（聊天列表）
      chrome.runtime.onMessage.addListener((request) => {
        chatList = request.chatList
      });

      chrome.windows.getAll(
        {
          populate: true,
        },
        (wins) => {
          wins.forEach((win) => {
            win.tabs.forEach((tab) => {
              if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
                chrome.tabs.sendMessage(
                  tab.id,
                  { getChatList: true },
                  function (response) {
                    console.log("message has send to wxobserve.js");
                  }
                );
              }
            });
          });
        }
      );
    }
  });
</script>

<main class="wrap">
  {#if isLogin}
    <div class="chat-panel">
      <div class="chat-header">文件传输助手</div>

      <div class="chat-body">
        {#each chatList as { type, text, img, fileDesc, filetitle } }
          {#if type === 'text'}
            <div>{ text }</div>
          {:else if type === 'image'}
            <div><img src={img} alt=""></div>
          {:else if type === 'file'}
            <div><span>{ filetitle }</span> <span>{ fileDesc }</span></div>
          {:else}
            <div>{ text }</div>
          {/if}
          
        {/each}
      </div>

      <div class="chat-footer">
        <div class="operations">
          <span class="icon-file" on:click={sendFile}></span>
        </div>
        <textarea class="chat-input" bind:value={message} />
        <div class="input-send">
          <span class="btn { message.length ? '' : 'btn-disabled' }" on:click={sendMessage}>发送</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="chat-header">欢迎使用微信文件传输助手</div>
    <img src="/images/cover.jpeg" alt="" style="width: 100%; vertical-align: top;">
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
    background-color: rgba(0,0,0,.05);
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
    background-color: rgba(0,0,0,.08);
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
    padding: 0 8px;
    border-bottom: 1px solid #e3e4e5;
    color: #191919;
    height: 30px;
    line-height: 30px;
    font-weight: bold;
  }
  .chat-body {
    flex: 1;
    box-sizing: border-box;
    height: 70%;
    overflow-y: auto;
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
    background: url('/images/icon__file.svg') no-repeat 50%/contain;
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
