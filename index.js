const express = require("express");
const path = require("path");
const fs = require("fs");
const { EdgeTTS } = require("node-edge-tts");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const audioFolder = path.join(__dirname, "audio");

if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder);
}

app.use("/audio", express.static(audioFolder));

app.post("/generate-speech", async (req, res) => {
  try {
    const { text, speed, voice } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text खाली है"
      });
    }

    const fileName = "vaani-" + Date.now() + ".mp3";
    const filePath = path.join(audioFolder, fileName);

    let rate = "default";

    if (speed) {
      const numberSpeed = Number(speed);
      const percent = Math.round((numberSpeed - 1) * 100);

      if (percent > 0) {
        rate = "+" + percent + "%";
      } else if (percent < 0) {
        rate = percent + "%";
      }
    }

   const tts = new EdgeTTS({
    voice: voice || "hi-IN-SwaraNeural",
    lang: "hi-IN",
    rate: rate,
    outputFormat: "audio-24khz-48kbitrate-mono-mp3"
});

    await tts.ttsPromise(text, filePath);

    res.json({
      success: true,
      audioUrl: "/audio/" + fileName
    });

  } catch (error) {
    console.error("TTS Error:", error);

    res.status(500).json({
      error: "Voice generate करने में समस्या हुई"
    });
  }
});

app.listen(PORT, () => {
  console.log("VaaniAI चल रहा है:");
  console.log("http://localhost:" + PORT);
});