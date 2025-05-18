# LoveMood+ 女友生氣偵測器

一個利用機器學習與網頁攝影機，幫助你快速偵測女友情緒的小工具。只需一鍵啟動，就能即時辨識「開心」、「生氣」、「疲倦」、「中性」等情緒，並給出貼心建議，還支援語音播報！

---

## 功能特色

- ✅ 即時偵測人臉情緒
- ✅ 支援四種情緒分類：開心、憤怒、疲倦、中性
- ✅ 結果以表情符號與中文建議顯示
- ✅ 自動語音播報建議（中文）
- ✅ 操作簡單，無需安裝軟體

---

## 使用方式

1. **下載或 clone 本專案：**
   ```bash
   git clone https://github.com/ziling-1104/B11108010-GHEN-ZILING-LoveMoodPlus.git
   ```

2. **開啟 `index.html`：**
   - 直接以瀏覽器打開 `index.html` 即可使用。
   - 須允許攝影機權限。

3. **點擊「啟動偵測」按鈕，即可開始辨識情緒。**

---

## 檔案結構簡介

- `index.html`：主網頁
- `style.css`：頁面樣式
- `script.js`：主要邏輯（模型載入、攝影機控制、情緒判斷、語音播報）
- `model.json`、`metadata.json`、`weights.bin`：Teachable Machine 訓練匯出的模型檔案

---

## 機器學習模型說明

- 本專案使用 [Teachable Machine](https://teachablemachine.withgoogle.com/) 訓練自訂情緒分類模型。
- 支援四類情緒：happy（開心）、angry（生氣）、tired（疲倦）、neutral（中性）。
- 模型檔案包含於本專案（model.json、metadata.json、weights.bin）。

---

## 技術棧

- HTML / CSS / JavaScript
- [Teachable Machine Image Library](https://github.com/googlecreativelab/teachablemachine-community)
- Web Speech API（語音播報）

---

## 注意事項

- 使用時需允許瀏覽器取得攝影機權限。
- 本專案僅為課程專題或個人練習用途，模型準確率有限，僅供娛樂參考。

---

## License

MIT License

---

## 聯絡方式

- 製作人員：B11108010
- [GitHub 專案頁](https://github.com/ziling-1104/B11108010-GHEN-ZILING-LoveMoodPlus)
