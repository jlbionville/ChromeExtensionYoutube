
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
      videoId: videoDetails?.videoId || "",
      channel: videoDetails?.author || "",
      uploadDate: microformat?.uploadDate || "",
      viewCount: videoDetails?.viewCount || "",
      description: videoDetails?.shortDescription || "",
      hashtags: (videoDetails?.keywords || []).filter(t => t.startsWith("#")),
      keywords: (videoDetails?.keywords || []).filter(t => !t.startsWith("#")),
      embedUrl: microformat?.embedUrl || "",
      thumbnail: videoDetails?.thumbnail?.thumbnails?.at(-1)?.url || "",
    };
  };

  const generateMarkdown = (info) => {
    return `---\ntype: ${info.type}\ntitle: "${info.title}"\nurl: ${info.url}\nchannel: "${info.channel}"\nvideoId: ${info.videoId}\nuploadDate: ${info.uploadDate}\nviewCount: ${info.viewCount}\nembedUrl: ${info.embedUrl}\nthumbnail: ${info.thumbnail}\nhashtags: ${info.hashtags.join(", ")}\nkeywords: ${info.keywords.join(", ")}\n---\n\n${info.description}`;
  };

  const info = extractVideoInfo();
  const md = generateMarkdown(info);
  console.log("\u{1F4C4} Obsidian markdown note:", md);
  navigator.clipboard.writeText(md)
    .then(() => {
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${info.videoId || "youtube_note"}.md`;
      a.click();
      alert("✅ Note copié et téléchargé !");
    })
    .catch(err => alert("❌ Erreur de copie : " + err));
})();
