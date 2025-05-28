
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyYTInfo",
    title: "📄 Copier YouTube info en Markdown/JSON",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyYTInfo") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"]
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-content-script") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["contentScript.js"]
        });
      }
    });
  }
});
