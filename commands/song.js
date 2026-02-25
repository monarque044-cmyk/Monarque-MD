// ==================== commands/song.js ====================
import yts from 'yt-search';
import axios from 'axios';

export default {
  name: "song",
  description: "Download song from YouTube",
  category: "Download",

  async execute(monarque, m, args) {
    try {
      // -------------------- Check query --------------------
      if (!args.length) {
        await monarque.sendMessage(
          m.chat,
          { text: `❌ Usage: \`.song <song name>\`` },
          { quoted: m }
        );
        await monarque.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return;
      }

      const query = args.join(' ').trim();

      // 🔎 React searching
      await monarque.sendMessage(m.chat, { react: { text: "🔎", key: m.key } });

      // -------------------- Search YouTube --------------------
      let video;
      if (query.includes('youtube.com') || query.includes('youtu.be')) {
        video = { url: query, title: query };
      } else {
        const search = await yts(query);
        if (!search.videos.length) {
          await monarque.sendMessage(
            m.chat,
            { text: `❌ No results found for your query!` },
            { quoted: m }
          );
          await monarque.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });
          return;
        }
        video = search.videos[0];
      }

      // -------------------- Info message --------------------
      await monarque.sendMessage(
        m.chat,
        {
          image: { url: video.thumbnail },
          caption: `🎵 *${video.title}*\n⏱ ${video.timestamp || "N/A"}\n\n⏳ Downloading...`,
        },
        { quoted: m }
      );

      // ⏳ React downloading
      await monarque.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      // -------------------- Call the API --------------------
      const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(video.url)}`;
      const response = await axios.get(apiUrl, { timeout: 60000 });
      const data = response.data;

      if (!data?.status || !data.audio) {
        await monarque.sendMessage(
          m.chat,
          { text: "❌ Failed to fetch from API. Try again later." },
          { quoted: m }
        );
        await monarque.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return;
      }

      const audioUrl = data.audio;
      const title = data.title || video.title;

      // -------------------- Send audio --------------------
      await monarque.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${title.replace(/[^a-zA-Z0-9-_\.]/g, "_")}.mp3`,
          caption: `🎵 *${title}*`,
        },
        { quoted: m }
      );

      // ✅ React success
      await monarque.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
      console.error("❌ SONG ERROR:", error);

      let errorMessage = "❌ Download failed. Please try again later.";
      if (error.code === "ENOTFOUND") errorMessage = "❌ Network error. Check your internet connection.";
      else if (error.response?.status === 404) errorMessage = "❌ Song not found or unavailable.";
      else if (error.response?.status === 429) errorMessage = "❌ Too many requests. Please wait a moment.";

      await monarque.sendMessage(m.chat, { text: errorMessage }, { quoted: m });
      await monarque.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    }
  },
};