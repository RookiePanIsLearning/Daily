# 💰 Couple Expense Tracker (情侶專屬記帳系統)

fronted url : https://rookiepanislearning.github.io/Daily/

## 1. 產品介紹 (About This Project)

這是一個專為 Peter 與 Fish Yu 設計的專屬記帳系統，旨在解決我們日常開銷分攤與大筆金額分期的痛點，讓每個月底的結算變得自動且透明。

**🏗️ 系統架構：**
* **Frontend (前端):** 採用純 HTML/JS 搭配 Bootstrap 5 實作的響應式網頁 (Web App)，完美適配手機操作體驗，並使用 Chart.js 進行視覺化數據渲染。
* **Backend (後端):** 透過 Google Apps Script (GAS) 建立 RESTful API (`doGet`, `doPost`)，處理資料的新增、修改、刪除與單月明細查詢。
* **Database (資料庫):** 使用 Google Sheets 作為輕量級資料庫，確保資料隨時可查閱且完全免費。

**✨ 核心功能：**
* **精準拆帳：** 記錄每筆開銷的「代墊人 (Payer)」與「負擔方式 (Payment)」，系統自動計算淨餘額，一眼看出當月誰該給誰多少錢。
* **自動分期：** 內建分期付款邏輯，大筆開銷只需輸入一次，後端 API 會自動處理除不盡的餘額並按月攤提寫入資料庫。
* **動態儀表板：** 透過 API 實時抓取當月報表，動態更新總花費與各分類圓餅圖。

---

## 2. 為什麼這樣做？ (Why GitHub Pages?)

身為測試工程師，我們在軟體開發流程中已經非常依賴 **CI/CD (持續整合/持續部署)** 所帶來的便利性。將這個靜態前端網頁託管在 **GitHub Pages**，正是為了把這種極簡的自動化部署體驗帶入這個專案中。

簡單來說，GitHub Pages 就像是一個免費的雲端伺服器，它會隨時盯著 `main` 分支中的 `index.html`，只要有更新，就會自動把它打包並發布成公開的網頁。

### 💡 給未來的自己提個醒：這套架構的最大好處
這套流程搭建好之後是**全自動的**。未來如果想要修改畫面（例如把按鈕換個顏色，或是新增一個圖表），只需要在本地端改好程式碼，然後 `git push` 到 `main` 分支。

後台機器人就會自動觸發建置，大約一分鐘後，Fish Yu 和我手機桌面上的 Web App 就會自動變成最新版，**完全不需要重新傳送任何連結給對方！**

---

## 🛠️ 部署與設定指南 (Deployment Setup)
*(若未來需要重新設定 GitHub Pages，請參考以下步驟)*

**Step 1. 確認入口檔案**
確保合併進 `main` 分支的專案根目錄下，有一個名為 `index.html` 的檔案。這是 GitHub Pages 預設尋找的網站首頁。

**Step 2. 開啟 GitHub Pages 功能**
1. 在 GitHub 專案頁面上方，點擊最右邊的 **「Settings」**。
2. 在左側選單中，往下捲動找到 **「Pages」** 並點擊進入。
3. 在畫面中間找到 **「Build and deployment」** 區塊。
4. 看到 **「Branch」** 下方的下拉式選單，點開並將 `None` 改為 **`main`**。
5. 右邊的資料夾選項保持預設的 `/ (root)` 不動，然後點擊 **「Save」**。

**Step 3. 監控部署進度**
點擊專案首頁上方的 **「Actions」** 頁籤，會看到一個名為 `pages build and deployment` 的任務正在執行。通常不到一分鐘，就會變成綠色勾勾代表部署成功。

**Step 4. 取得專屬網址**
回到 **Settings > Pages** 畫面，最上方會出現一個綠色框框提示：
> *Your site is live at `https://[你的帳號].github.io/[Repo名稱]/`*

這串就是我們的專屬記帳 App 連結！只要在手機瀏覽器打開它，並選擇**「加入主畫面 (Add to Home Screen)」**，就能享有如同原生 App 般的操作體驗。