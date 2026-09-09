# NINTH LAB｜官方網站

這是一個純靜態網站（HTML + CSS + JavaScript），可以直接放上 **GitHub Pages** 免費上架，並透過 **Decap CMS** 後台以表單方式修改網站內容，不需要碰程式碼。網站核心特色：iPhone／Android／電腦三大分類選擇器、Apple 官網式左右滑動主秀、「選擇故障狀況 → LINE 詢問」一鍵帶入客服訊息。

---

## 一、專案結構說明

```
/
├── index.html              ← 網站首頁
├── assets/
│   ├── css/style.css       ← 網站樣式
│   ├── js/main.js          ← 讀取 content/ 內容、處理所有互動邏輯
│   └── images/             ← Logo、LINE QR Code、示意圖片放這裡
├── content/                ← 網站文字內容（CMS 會修改這裡的檔案）
│   ├── site.json           ← 品牌名稱、電話、LINE 官方帳號 ID、服務地區、SEO
│   ├── homepage.json       ← 首頁各區塊文字（Hero／選擇器／流程／到府服務）
│   ├── services.json       ← 服務分類與維修項目（core：iPhone／Android／電腦；other：平板／音響／其他3C）
│   ├── faq.json            ← 常見問題
│   └── contact.json        ← 聯絡客服區塊文字
├── admin/
│   ├── index.html          ← CMS 後台入口
│   └── config.yml          ← CMS 欄位設定
├── robots.txt
├── sitemap.xml
└── README.md                ← 本說明文件
```

網站不會把文字寫死在 HTML 裡：`main.js` 會自動讀取 `content/` 資料夾裡的 JSON 檔案，把內容顯示到頁面上，並根據使用者選擇的分類／故障狀況即時組出 LINE 詢問訊息。所以未來你只要在 CMS 後台修改內容並發布，網站就會更新，完全不用碰 `index.html`。

---

## 二、把網站放上 GitHub（新手教學）

### Step 1：註冊 / 登入 GitHub

前往 [github.com](https://github.com)，點右上角「Sign up」註冊帳號（已有帳號請直接登入）。

### Step 2：建立 Repository

1. 登入後，點右上角「＋」→「New repository」。
2. **Repository name**：建議取 `your-username.github.io`（把 `your-username` 換成你的 GitHub 帳號名稱）。
   - 這個特殊命名方式可以讓網站網址變成 `https://your-username.github.io`，不需要額外設定。
   - 如果你想用別的名稱也可以，網址會變成 `https://your-username.github.io/repo名稱`。
3. 選擇 **Public**（GitHub Pages 免費方案需要 Public repository）。
4. 不要勾選「Add a README file」（我們已經有了）。
5. 點「Create repository」。

### Step 3：把檔案上傳到 GitHub

最簡單的方式是直接在網頁上拖曳上傳：

1. 進入剛建立的 repository 頁面。
2. 點「uploading an existing file」（或「Add file」→「Upload files」）。
3. 把你收到的所有檔案與資料夾（保持原本的資料夾結構）拖曳進去。
4. 下方 commit 訊息可以填「first commit」，點「Commit changes」。

> 如果你不熟悉「保持資料夾結構」的拖曳方式，也可以改用 GitHub Desktop（一套有圖形介面的軟體，[desktop.github.com](https://desktop.github.com)），把整個資料夾同步上去會更直覺。

### Step 4：確認 index.html 位置

確認 `index.html` 是放在 repository 的**最外層**（不是放在某個子資料夾裡面），這樣 GitHub Pages 才能正確找到首頁。

### Step 5：設定 GitHub Pages

1. 進入 repository 的「Settings」。
2. 左側選單找到「Pages」。
3. 在「Build and deployment」→「Source」選擇 **Deploy from a branch**。
4. Branch 選擇 **main**，資料夾選擇 **/ (root)**。
5. 點「Save」。

### Step 6：等待部署

大約等待 1～2 分鐘，回到同一個 Pages 設定頁面重新整理，上方會出現：

> Your site is live at `https://your-username.github.io/...`

### Step 7：找到網站網址並測試

點擊該網址即可看到你的網站。用手機開啟同一個網址，確認手機版顯示正常。

---

## 三、「選擇故障 → LINE 詢問」是怎麼運作的

網站上客戶點擊任一個故障項目（例如「無法充電／充電孔故障」）後，畫面會出現一段自動組好的訊息預覽，跟一個「LINE 詢問此問題」按鈕。按下後會開啟 LINE App，直接進入與 NINTH LAB 官方帳號的聊天室，訊息已經打在輸入框裡，客戶看過確認沒問題後自己按送出即可。

這是用 LINE 官方支援的網址格式做的：
```
https://line.me/R/oaMessage/{LINE官方帳號ID}/?{訊息文字}
```
LINE 基於防止騷擾的考量，**不開放「自動送出」**，所以一定會留給客戶最後確認、自己按送出這一步——這是目前技術上最穩定、也是唯一被官方支援的做法，不是打折的陽春版功能。

如果之後要換成別的 LINE 官方帳號，只要在 CMS 後台「網站基本設定」把 `LINE 官方帳號 ID` 欄位改掉就好，不用碰程式碼。

---

## 四、設定 Decap CMS 後台（讓你可以像 Word 一樣編輯網站）

### 為什麼選 Decap CMS，不是 Tina CMS 或 Pagefind？

- **Pagefind 不是 CMS**，它是網站內建搜尋功能的工具，不能用來編輯內容，所以不適用。
- **Tina CMS** 的視覺化即時編輯主要是為 React／Next.js 這類框架設計的，如果要套用在純 HTML 網站上，需要額外改造成 React 專案，對完全沒有程式背景的你來說會增加不少複雜度與學習成本。
- **Decap CMS**（前身是 Netlify CMS）是專門為「純 HTML/CSS/JS + GitHub 靜態網站」設計的後台系統：完全免費、不需要框架、可以直接讀寫 GitHub repository 裡的檔案，並且提供圖片上傳、文字編輯、清單新增刪除等「所見即所得」的操作介面，最貼近你要的「登入後台 → 修改 → 儲存 → 發布」流程。

**唯一需要注意的限制**：Decap CMS 要讓你用 GitHub 帳號登入後台，需要一個很小的「授權中介服務（OAuth proxy）」幫忙處理登入流程。這是 GitHub 安全機制的要求，不是 Decap CMS 特有的限制（Tina 也需要類似的機制，只是他們用自己的雲端服務包好了）。

好消息是：這個中介服務**不需要租主機、不需要 VPS**，可以部署在 **Cloudflare Workers** 的免費方案上（每天十萬次請求額度，對這個網站來說完全用不完），設定過程大約 10 分鐘、一次設定好之後就不用再管它。

### Step 1：建立 GitHub OAuth App

1. 前往 GitHub 右上角頭像 →「Settings」→ 左側最下方「Developer settings」→「OAuth Apps」→「New OAuth App」。
2. 填寫：
   - **Application name**：例如「雙北3C維修-CMS」
   - **Homepage URL**：填你的網站網址，例如 `https://your-username.github.io`
   - **Authorization callback URL**：填 `https://your-oauth-worker.example.workers.dev/callback`（下一步部署 Worker 後會拿到真正的網址，屆時再回來修改這裡）
3. 點「Register application」。
4. 進入該 App 頁面，點「Generate a new client secret」，會得到：
   - **Client ID**
   - **Client Secret**（只會顯示一次，請先複製存起來，不要貼在任何公開的地方，包括不要放進 GitHub repository）

### Step 2：部署免費的 OAuth 中介服務（Cloudflare Worker）

1. 註冊 [Cloudflare](https://dash.cloudflare.com/sign-up) 免費帳號。
2. 進入「Workers & Pages」→「Create」→「Create Worker」，取個名稱（例如 `cms-oauth`），部署後你會拿到一個網址，例如：
   `https://cms-oauth.你的帳號.workers.dev`
3. 在 Worker 的程式編輯畫面，貼上開源的 Decap CMS OAuth provider 程式碼（GitHub 上搜尋關鍵字「decap-cms-oauth-cloudflare-worker」或「netlify-cms-oauth-provider cloudflare」，會找到現成、免費、開源的範例程式碼，直接複製貼上即可，不需要自己寫）。
4. 在 Worker 的「Settings」→「Variables」加入兩個環境變數（設定為 **Secret**，不要用一般變數，才不會被看到）：
   - `GITHUB_CLIENT_ID`：貼上 Step 1 拿到的 Client ID
   - `GITHUB_CLIENT_SECRET`：貼上 Step 1 拿到的 Client Secret
5. 儲存後部署。
6. 回到 GitHub OAuth App 設定，把「Authorization callback URL」改成正式的 Worker 網址 + `/callback`，例如：
   `https://cms-oauth.你的帳號.workers.dev/callback`

> **安全提醒**：Client Secret 全程只存在於 Cloudflare Worker 的「Secret 環境變數」裡，絕對不要貼到 `admin/config.yml` 或任何會上傳到公開 GitHub repository 的檔案中。

### Step 3：修改 `admin/config.yml`

打開 `admin/config.yml`，修改最上面兩行：

```yaml
backend:
  name: github
  repo: your-github-username/your-repo-name
  branch: main
  base_url: https://cms-oauth.你的帳號.workers.dev
  auth_endpoint: auth
```

改好後上傳回 GitHub（覆蓋原本的檔案）。

### Step 4：登入後台

1. 開啟 `https://your-username.github.io/admin/`
2. 點「Login with GitHub」
3. 第一次會跳出 GitHub 授權畫面，點「Authorize」
4. 登入成功後就會看到 CMS 後台介面

---

## 五、CMS 後台操作教學（完全新手版）

登入後台後，左側選單會看到四個分類：

- **網站基本設定**：品牌名稱、Logo、電話、LINE QR Code、服務地區、SEO
- **首頁內容**：Hero 標題、服務分類卡片、到府服務、先報價說明、維修流程
- **服務項目**：所有維修服務細項
- **聯絡客服區塊**：聯絡客服區的標題與按鈕文字

### 怎麼修改首頁文字？

點左側「首頁內容」→「首頁各區塊文字」→ 找到你要改的欄位（例如「Hero 主視覺區」裡的「主標題」）→ 直接修改文字 → 右上角「儲存」。

### 怎麼新增／刪除服務項目？

點左側「服務項目」→「服務細項清單」→ 找到對應的「服務分類群組」→ 展開後可以看到「服務項目」清單：

- **新增**：點清單下方的「Add 服務項目」按鈕
- **刪除**：點該項目右上角的垃圾桶圖示
- **修改**：直接點進去改文字

### 怎麼修改價格說明？

本網站刻意不寫死固定價格（因為不同機型、故障狀況價格不同），服務項目最後都會顯示「聯絡客服詢價」按鈕。如果你想調整這段說明文字，可以在「首頁內容」或「聯絡客服區塊」裡修改相關文字欄位。

### 怎麼換 Logo？

點左側「網站基本設定」→「品牌與聯絡資訊」→「Logo」欄位 → 點選圖片區塊 → 上傳新圖片 → 儲存並發布。

### 怎麼換 LINE QR Code？

同一頁面往下找到「LINE QR Code 圖片」欄位，操作方式同上。

### 怎麼修改電話？

同一頁面的「電話」欄位（純數字，例如 `0912345678`，用來產生點擊撥號連結）與「電話顯示格式」欄位（畫面上顯示的格式，例如 `0912-345-678`）。

### 怎麼發布？

每個編輯畫面右上角都有「儲存」按鈕。Decap CMS 預設是「simple」發布模式，儲存後會直接送出 commit 到 GitHub，網站會在幾十秒內自動更新（GitHub Pages 會自動重新部署，你不需要手動做任何事）。

---

## 六、常見問題

**Q：我改了內容，網站怎麼還沒更新？**
GitHub Pages 部署通常需要幾十秒到 1～2 分鐘，可以到 repository 的「Actions」分頁查看部署進度。也可能是瀏覽器快取，試試看強制重新整理（Ctrl+Shift+R / Cmd+Shift+R）。

**Q：Logo 或 QR Code 圖片沒有顯示？**
表示 `assets/images/` 資料夾裡還沒有對應的圖片檔案，或是 CMS 裡的圖片欄位還沒上傳。上傳圖片後畫面就會自動顯示。

**Q：以後想加新的頁面（例如「常見問題」頁）怎麼辦？**
目前架構是單頁式網站（scroll 瀏覽），如果之後需要新增獨立頁面，可以再另外請人（或未來的對話）協助擴充，屬於進階調整。

---

## 七、上線前檢查清單

- [ ] Logo 已上傳且置中顯示正常
- [ ] LINE QR Code 已上傳，清晰可掃描
- [ ] 電話號碼正確，手機點擊可直接撥號
- [ ] 三大分類（iPhone／Android／電腦）與其他服務（平板／音響／其他3C）內容正確
- [ ] 「先報價・確認後施工」文字清楚可見
- [ ] 點選任一故障項目後，LINE 訊息預覽文字正確，按鈕能正確開啟 LINE
- [ ] 服務地區（台北市／新北市）文字正確
- [ ] 沒有出現 Google Maps 或實體地址
- [ ] 手機（375px）／平板（768px）／桌面（1440px）瀏覽都正常，沒有橫向捲動，漢堡選單能正常開合
- [ ] `admin/config.yml` 裡的 `repo` 與 `base_url` 已改成你自己的設定
- [ ] SEO 標題、描述已依實際狀況確認
- [ ] `index.html`／`robots.txt`／`sitemap.xml` 裡的 `example.com` 已換成正式網域
