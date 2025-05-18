const modelURL = "./model.json";
const metadataURL = "./metadata.json";
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

let model, webcam, maxPredictions;

async function init() {
    const suggestion = document.getElementById("suggestion");
    suggestion.innerHTML = "正在載入模型...";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        suggestion.innerHTML = "正在啟動攝影機...";
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip);

        try {
            await webcam.setup();
            await webcam.play();
            document.getElementById("webcam-container").appendChild(webcam.canvas);
            suggestion.innerHTML = "偵測中...";
            window.requestAnimationFrame(loop);
        } catch (cameraError) {
            console.error("攝影機錯誤:", cameraError);
            suggestion.innerHTML = "無法啟動攝影機。請確認權限與裝置連線。";
        }
    } catch (modelError) {
        console.error("模型載入錯誤:", modelError);
        suggestion.innerHTML = "無法載入模型。請確認網路正常並重新整理。";
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    const emoji = document.getElementById("emoji");
    const suggestion = document.getElementById("suggestion");

    const best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);

    const emojiMap = {
        happy: "😊",
        angry: "😠",
        tired: "😴",
        neutral: "😐"
    };

    const suggestionMap = {
        happy: "她看起來心情很好！",
        angry: "小心，她可能有點不開心。",
        tired: "她看起來很疲倦，記得關心一下她。",
        neutral: "她目前沒有明顯情緒，但可以主動聊天試試看。"
    };

    emoji.innerHTML = emojiMap[best.className] || "❓";
    suggestion.innerHTML = suggestionMap[best.className] || "無法判斷情緒，再觀察一下唷。";

    const speak = new SpeechSynthesisUtterance(suggestion.innerText);
    speak.lang = 'zh-TW';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speak);
}
