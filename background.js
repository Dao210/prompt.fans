// Chrome Extension Service Worker

// 允许用户点击扩展图标时打开侧边栏
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('prompt.fans extension installed');
});