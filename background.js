chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-content-script") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["contentScript.js"]
        });
      }
    });
  }
});