
// contentScript.js
(() => {
  const extractVideoInfo = () => {
    const title = document.title;
    const url = window.location.href;

    // Tentative de récupération du JSON interne de YouTube
    let ytData = null;
    try {
      const scripts = Array.from(document.querySelectorAll("script"));
      const ytScript = scripts.find(s => s.textContent.includes("ytInitialPlayerResponse"));
      if (ytScript) {
        const match = ytScript.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});/);
        if (match && match[1]) {
          ytData = JSON.parse(match[1]);
        }
      }
    } catch (e) {
      console.error("Erreur parsing ytInitialPlayerResponse", e);
    }

    const videoDetails = ytData?.videoDetails;
    const microformat = ytData?.microformat?.playerMicroformatRenderer;

    return {
      type: "video",
      title: videoDetails?.title || title,
      url: url,
      channel: videoDetails?.author || "",
      uploadDate: microformat?.uploadDate || "",
      viewCount: videoDetails?.viewCount || "",
      description: videoDetails?.shortDescription || "",
      hashtags: (videoDetails?.keywords || []).filter(t => t.startsWith("#")),
    };
  };

  const generateMarkdown = (info) => {
    return `---\ntype: ${info.type}\ntitle: "${info.title}"\nurl: ${info.url}\nchannel: "${info.channel}"\nuploadDate: ${info.uploadDate}\nviewCount: ${info.viewCount}\nhashtags: ${info.hashtags.join(", ")}\n---\n\n${info.description}`;
  };

  const info = extractVideoInfo();
  const md = generateMarkdown(info);
  console.log("\u{1F4C4} Obsidian markdown note:", md);
  navigator.clipboard.writeText(md)
    .then(() => alert("✅ Vidéo copiée au format Obsidian !"))
    .catch(err => alert("❌ Erreur de copie : " + err));
})();
