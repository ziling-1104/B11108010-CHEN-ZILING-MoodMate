// 初始化變數
let model, webcam, maxPredictions;
let latestFaceLandmarks = null;
let lastUpdateTime = 0;
const updateInterval = 3000;
let currentAudio = null;

const emotionLog = { happy: 0, angry: 0, tired: 0, neutral: 0 };

const audioMap = {
  happy: ["happy_1.mp3", "happy_2.mp3", "happy_3.mp3"],
  angry: ["angry_1.mp3", "angry_2.mp3", "angry_3.mp3"],
  tired: ["tired_1.mp3", "tired_2.mp3", "tired_3.mp3"],
  neutral: ["neutral_1.mp3", "neutral_2.mp3", "neutral_3.mp3"]
};

const suggestionPool = {
  happy: ["她心情不錯！你可以說：『看到你我也整天都快樂！』", "氣氛超棒，可以說：『笑得像仙女一樣欸～』", "開心的時候最可愛，你可以說：『我是不是該錄起來，每天看一次』"],
  angry: ["小心，她可能有點不開心。你可以說：『我剛才是不是太急了？對不起嘛～抱一下？』", "她似乎有點氣氣的。試試：『要不要我請你喝奶茶？不氣不氣～』", "火氣上來了？來點柔軟的：『你是我最重要的人，我想跟你好好講講』"],
  tired: ["她好像很累。你可以說：『辛苦啦～今天不要再想工作了！』", "她有點疲倦。輕輕一句：『來，我幫你按摩三分鐘～』", "看起來需要放鬆一下：『我們來看部溫馨的劇好不好？』"],
  neutral: ["她現在沒特別情緒。你可以說：『這週末你有想去哪裡嗎？』", "中性狀態～你可以說：『如果只能選一種飲料，你會喝？』", "平靜模式～用趣味破冰：『昨天夢到我們去環島欸！你夢到什麼？』"]
};

async function loadTeachableModel() {
  model = await tmImage.load(
    "https://teachablemachine.withgoogle.com/models/MbSMHGKtH/model.json",
    "https://teachablemachine.withgoogle.com/models/MbSMHGKtH/metadata.json"
  );
  maxPredictions = model.getTotalClasses();
  webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup();
  await webcam.play();
  document.getElementById("webcam-container").appendChild(webcam.canvas);
}

function startFaceMesh() {
  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  faceMesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      latestFaceLandmarks = results.multiFaceLandmarks[0];
    }
  });
  const camera = new Camera(webcam.canvas, {
    onFrame: async () => {
      await faceMesh.send({ image: webcam.canvas });
    },
    width: 200,
    height: 200
  });
  camera.start();
}

async function init() {
  await loadTeachableModel();
  startFaceMesh();
  requestAnimationFrame(loop);
}

async function loop() {
  const now = Date.now();
  if (now - lastUpdateTime > updateInterval) {
    webcam.update();
    await detectEmotion();
    lastUpdateTime = now;
  }
  requestAnimationFrame(loop);
}

async function detectEmotion() {
  let className = "neutral";

  const predictions = await model.predict(webcam.canvas);
  const angry = predictions.find(p => p.className === "angry");
  if (angry && angry.probability > 0.8) {
    className = "angry";
  } else if (latestFaceLandmarks) {
    const mouthOpen = getYDiff(14, 13);
    const smileCurve = getYDiff(61, 291);
    const eyeOpen = getYDiff(159, 145);

    if (mouthOpen > 0.025 && eyeOpen < 0.01) {
      className = "tired";
    } else if (smileCurve < 0.01 && eyeOpen > 0.015) {
      className = "happy";
    } else {
      className = "neutral";
    }
  }
  displayEmotion(className);
}

function getYDiff(index1, index2) {
  return Math.abs(latestFaceLandmarks[index1].y - latestFaceLandmarks[index2].y);
}

function displayEmotion(className) {
  const emojiMap = { happy: "😊", angry: "😠", tired: "😴", neutral: "😐" };
  const bgColorMap = { happy: "#fff0f5", angry: "#ffeaea", tired: "#e8f0ff", neutral: "#f4f4f4" };

  const emoji = document.getElementById("emoji");
  const suggestion = document.getElementById("suggestion");
  const history = document.getElementById("history");

  const resultEmoji = emojiMap[className];
  const text = suggestionPool[className][Math.floor(Math.random() * 3)];

  emoji.innerText = resultEmoji;
  suggestion.innerText = text;
  document.body.style.backgroundColor = bgColorMap[className];

  if (currentAudio) currentAudio.pause();
  const sound = new Audio(audioMap[className][Math.floor(Math.random() * 3)]);
  currentAudio = sound;
  sound.play();

  const time = new Date().toLocaleTimeString();
  const log = document.createElement("div");
  log.innerText = `[${time}] ${resultEmoji} ${text}`;
  history.prepend(log);

  emotionLog[className]++;
}

window.onload = init;
