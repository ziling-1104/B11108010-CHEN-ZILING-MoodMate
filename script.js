let model, camera, faceMesh;
let isSpeakingEnabled = true;
let lastSpokenText = "";
let currentAudio = null;
let angryThreshold = 0.85;
let emotionCounts = { happy: 0, angry: 0, tired: 0, neutral: 0 };

const suggestionPool = {
  happy: [
    "她心情不錯！你可以說：『看到你我也整天都快樂！』",
    "氣氛超棒，可以說：『笑得像仙女一樣欸～』",
    "開心的時候最可愛，你可以說：『我是不是該錄起來，每天看一次』"
  ],
  angry: [
    "小心，她可能有點不開心。你可以說：『我剛才是不是太急了？對不起嘛～抱一下？』",
    "她似乎有點氣氣的。試試：『要不要我請你喝奶茶？不氣不氣～』",
    "火氣上來了？來點柔軟的：『你是我最重要的人，我想跟你好好講講』"
  ],
  tired: [
    "她好像很累。你可以說：『辛苦啦～今天不要再想工作了！』",
    "她有點疲倦。輕輕一句：『來，我幫你按摩三分鐘～』",
    "看起來需要放鬆一下：『我們來看部溫馨的劇好不好？』"
  ],
  neutral: [
    "她現在沒特別情緒。你可以說：『這週末你有想去哪裡嗎？』",
    "中性狀態～你可以說：『如果只能選一種飲料，你會喝？』",
    "平靜模式～用趣味破冰：『昨天夢到我們去環島欸！你夢到什麼？』"
  ]
};

const audioMap = {
  happy: [new Audio("happy_1.mp3"), new Audio("happy_2.mp3"), new Audio("happy_3.mp3")],
  angry: [new Audio("angry_1.mp3"), new Audio("angry_2.mp3"), new Audio("angry_3.mp3")],
  tired: [new Audio("tired_1.mp3"), new Audio("tired_2.mp3"), new Audio("tired_3.mp3")],
  neutral: [new Audio("neutral_1.mp3"), new Audio("neutral_2.mp3"), new Audio("neutral_3.mp3")]
};

async function init() {
  const emoji = document.getElementById("emoji");
  const suggestion = document.getElementById("suggestion");
  suggestion.innerText = "正在載入模型與鏡頭...";

  model = await tmImage.load(
    "https://teachablemachine.withgoogle.com/models/MbSMHGKtH/model.json",
    "https://teachablemachine.withgoogle.com/models/MbSMHGKtH/metadata.json"
  );

  const video = document.createElement("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.width = 400;
  video.height = 300;
  document.getElementById("webcam-container").appendChild(video);

  camera = new Camera(video, {
    onFrame: async () => {
      await faceMesh.send({ image: video });
      await predictAngry(video);
    },
    width: 400,
    height: 300
  });
  await camera.start();

  faceMesh = new FaceMesh({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
  faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
  faceMesh.onResults(onResults);
}

async function predictAngry(video) {
  const prediction = await model.predict(video);
  const angryProb = prediction.find(p => p.className === "angry")?.probability || 0;
  if (angryProb > angryThreshold) updateEmotion("angry");
}

function onResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;
  const keypoints = results.multiFaceLandmarks[0];

  const leftMouth = keypoints[61];
  const rightMouth = keypoints[291];
  const topLip = keypoints[13];
  const bottomLip = keypoints[14];

  const mouthOpen = Math.abs(bottomLip.y - topLip.y);
  const mouthCurve = rightMouth.y - leftMouth.y;

  if (mouthOpen > 0.065) {
    updateEmotion("tired");
  } else if (mouthCurve < -0.015) {
    updateEmotion("happy");
  } else {
    updateEmotion("neutral");
  }
}

function updateEmotion(className) {
  const emojiMap = { happy: "😊", angry: "😠", tired: "😴", neutral: "😐" };
  const emoji = document.getElementById("emoji");
  const suggestion = document.getElementById("suggestion");
  const history = document.getElementById("history");
  const resultEmoji = emojiMap[className] || "❓";
  const pool = suggestionPool[className] || ["..."];
  const resultText = pool[Math.floor(Math.random() * pool.length)];

  emoji.innerText = resultEmoji;
  suggestion.innerText = resultText;

  if (isSpeakingEnabled && resultText !== lastSpokenText) {
    if (currentAudio && !currentAudio.paused) currentAudio.pause();
    const audios = audioMap[className];
    currentAudio = audios[Math.floor(Math.random() * audios.length)];
    currentAudio.currentTime = 0;
    currentAudio.play();
    lastSpokenText = resultText;
  }

  const time = new Date().toLocaleTimeString();

  const log = document.createElement("div");
  log.textContent = `[${time}] ${resultEmoji} ${resultText}`;
  log.style.color = getColorByClass(className);
  history.prepend(log);



}

function toggleSpeech() {
  isSpeakingEnabled = !isSpeakingEnabled;
  const button = document.getElementById("speech-toggle");
  button.innerText = isSpeakingEnabled ? "🔊 語音開啟" : "🔇 語音關閉";
}

function getColorByClass(className) {
  switch (className) {
    case "happy": return "#ff69b4";
    case "angry": return "#ff4d4d";
    case "tired": return "#999";
    case "neutral": return "#666";
    default: return "#333";
  }
}
