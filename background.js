
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyYTInfo",
    title: "📄 Copier YouTube info en Markdown",
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
