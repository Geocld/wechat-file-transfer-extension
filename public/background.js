const bgRun = () => {
  // 后台执行js，一直监听事件，可用于插件后台接受信息
  // chrome.runtime.onMessage.addListener(function (req) {
  //   if (req.update) {
  //     chrome.windows.getAll({
  //       populate: true
  //     }, function (wins) {
  //       wins.forEach(function (win) {
  //         win.tabs.forEach(function (tab) {
  //           if (/filehelper\.weixin\.qq\.com/gi.test(tab.url)) {
  //             setTimeout(function () {
  //               chrome.tabs.executeScript(tab.id, {
  //                 file: 'chrome/wxInfo.js'
  //               }, function (res) {
  //                 var info = res[0];
  //                 if (info.login) { // 已登录
  //                   if (+info.unreadCount) {
  //                     chrome.browserAction.setBadgeText({ text: info.unreadCount + '' });
  //                     if (info.unreadCount < 99) {
  //                       chrome.browserAction.setBadgeText({ text: info.unreadCount + '' });
  //                     } else if (info.unreadCount >= 99) {
  //                       chrome.browserAction.setBadgeText({ text: '99+' });
  //                     }
  //                   } else {
  //                     chrome.browserAction.setBadgeText({ text: '' });
  //                   }
  //                 } else {
  //                   chrome.browserAction.setBadgeText({ text: '' });
  //                 }
  //               });
  //             }, 500);
  //           }
  //         });
  //       });
  //     });
  //   }
  // });
}

bgRun();