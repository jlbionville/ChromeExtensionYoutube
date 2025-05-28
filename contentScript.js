// contentScript.js
(() => {
    const getVideoType = () => {
      const url = window.location.href;
      if (url.includes("/shorts/")) return "short";
      return "video";
    };
  
    const extractVideoInfo = () => {
      const title = document.title;
      const url = window.location.href;
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
        type: getVideoType(),
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
  
    const generateJSON = (info) => JSON.stringify(info, null, 2);
  
    const sanitize = (str) => str.replace(/[^\w\d_-]+/g, "_");
  
    const format = prompt("Format de sortie ? (markdown/json)", "markdown");
    const info = extractVideoInfo();
    const data = format === "json" ? generateJSON(info) : generateMarkdown(info);
    const extension = format === "json" ? "json" : "md";
    const fileName = `${sanitize(info.channel)}-${sanitize(info.title)}.${extension}`;
  
    console.log("\u{1F4C4} Note YouTube:", data);
    navigator.clipboard.writeText(data)
      .then(() => {
        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        alert(`✅ Données copiées et téléchargées en ${format} !`);
      })
      .catch(err => alert("❌ Erreur de copie : " + err));
  })();
  