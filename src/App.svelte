<script>
  // @ts-nocheck
  import { onMount } from "svelte";

  let isLogin = false;
  let hasOpenWx = false;
  let message = '';

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
    chrome.windows.getAll({
        populate: true
    }, (wins) => {
      wins.forEach((win) => {
        win.tabs.forEach((tab) => {
          if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
            chrome.tabs.sendMessage(tab.id, { sendMessage: true, message }, function(response){
              console.log(response)
              console.log('message has send to wxobserve.js')
              message = ''
            })
          }
        })
      })
    })
  }

  const sendFile = () => {
    chrome.windows.getAll({
        populate: true
    }, (wins) => {
      wins.forEach((win) => {
        win.tabs.forEach((tab) => {
          if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
            chrome.tabs.sendMessage(tab.id, { sendFile: true }, function(response){
              console.log('message has send to wxobserve.js')
            })
          }
        })
      })
    })
  }

  onMount(() => {
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
                }
              );
            }
          });
        });
      }
    );
  });
</script>

<main class="wrap">
  {#if isLogin}
    <div class="chat-panel">
      <div class="chat-header">文件传输助手</div>

      <div class="chat-body" />

      <div class="chat-footer">
        <textarea class="chat-input" bind:value={message} />
        <div class="input-send">
          <button on:click={sendFile}>文件</button>
          <button on:click={sendMessage}>发送</button>
        </div>
      </div>
    </div>
  {:else}
    <button on:click={viewPage}>进入</button>
  {/if}
</main>

<style>
  .wrap {
    width: 300px;
    min-height: 300px;
  }
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 400px;
  }
  .chat-header {
    border-bottom: 1px solid #e3e4e5;
    color: #191919;
  }
  .chat-body {
    flex: 1;
    box-sizing: border-box;
    height: 80%;
  }
  .chat-footer {
    border-top: 1px solid #e3e4e5;
    display: flex;
    flex-direction: column;
    height: 100px;
  }
  .chat-input {
    border: none;
    resize: none;
    flex: 1;
    font-size: 14px;
    padding: 0 8px;
    background-color: #f9f9f9;
    outline: none;
  }
  .input-send {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px;
    line-height: 32px;
  }
</style>
