document.getElementById("extractBtn").addEventListener("click", async () => {
  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Injecter et exécuter le content script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"]
    });
  } catch (error) {
    console.error("Erreur lors de l'exécution du script:", error);
    alert("❌ Erreur lors de l'extraction des données");
  }
});

// Fonction pour générer le Markdown
function generateMarkdown(info) {
  return `---\ntype: ${info.type}\ntitle: "${info.title}"\nurl: ${info.url}\nchannel: "${info.channel}"\nvideoId: ${info.videoId}\nuploadDate: ${info.uploadDate}\nviewCount: ${info.viewCount}\nembedUrl: ${info.embedUrl}\nthumbnail: ${info.thumbnail}\nhashtags: ${info.hashtags.join(", ")}\nkeywords: ${info.keywords.join(", ")}\n---\n\n${info.description}`;
}

// Fonction pour générer le JSON
function generateJSON(info) {
  return JSON.stringify(info, null, 2);
}

// Fonction pour nettoyer les noms de fichiers
function sanitize(str) {
  return str.replace(/[^\w\d_-]+/g, "_");
}

// Écouteur pour les messages du content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "extractedData") {
    try {
      const info = request.data;
      const format = prompt("Format de sortie ? (markdown/json)", "markdown");
      const data = format === "json" ? generateJSON(info) : generateMarkdown(info);
      const extension = format === "json" ? "json" : "md";
      const fileName = `${sanitize(info.channel)}-${sanitize(info.title)}.${extension}`;

      // Copier dans le presse-papiers
      await navigator.clipboard.writeText(data);
      
      // Télécharger le fichier
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      
      alert(`✅ Données copiées et téléchargées en ${format} !`);
    } catch (err) {
      alert("❌ Erreur de copie : " + err);
    }
  }
});