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

  const info = {
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

  // Envoyer les données à la popup
  chrome.runtime.sendMessage({
    action: "extractedData",
    data: info
  });
};

// Démarrer l'extraction
extractVideoInfo();