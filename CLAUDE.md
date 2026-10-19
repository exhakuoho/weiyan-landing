# CLAUDE.md — 微研官網（給 Claude Code 的工作說明）

這個檔案會在每次開啟本 repo 時自動載入。**動手前先讀完。**

## 這是什麼、誰在用

微研 WEIYAN 的官方網站，部署在 Cloudflare Pages，網域 `weiyan.designjarvis.com`。
推上 GitHub `main` 分支就會自動部署，約 1–2 分鐘生效。

**維護者不是本科系出身。** 所以：

- 不要假設對方看得懂術語，解釋要用白話
- 不要留下「你要記得同時改另一個檔案」這種隱形規則——那種東西一定會被忘記，
  要嘛用程式自動處理，要嘛寫進這個檔案
- 每次動完都要實際驗證，不能只說「應該可以了」

## 開場先做這三件事

```bash
git pull                 # 可能有其他 session 或 GPT 分支推過東西
node _worker.test.mjs    # 要「失敗 0 項」才動手（總項數會隨科普文章增加，不看總數）
```

第三件：確認你要改的東西屬於哪一類（見下方「改東西要動哪裡」）。

## 檔案結構

| 檔案 | 說明 |
|---|---|
| `index.html` | **整個網站**。版面、樣式、所有內容資料都在這一個檔案裡（2026-10-19 約 380 KB；每日科普每多一篇約增加 13 KB，文章累積到上百篇前要規劃把文章資料拆出去） |
| `_worker.js` | Cloudflare Worker。依路由改寫 meta、產生 JSON-LD／非 JS 摘要與 sitemap、處理轉址及 404 |
| `_worker.test.mjs` | worker 的離線測試，`node _worker.test.mjs` |
| `photos/` | 相簿與教具照片，WebP |
| `photos/brand/weiyan-logo.jpg` | 微研原始完整 Logo，包含品牌文字與標語；保留作為原始素材 |
| `photos/brand/weiyan-symbol.png` | 純圖標版本的**原始高解析素材**（1254×1254，882 KB）。已移除下方文字，完整保留星球、軌道與星星，不做裁切。**頁面不引用它**，換圖時從這張重新壓 |
| `photos/brand/weiyan-symbol-160.webp` | **頁首與手機選單實際使用的圖檔**（160×160，4 KB）。顯示尺寸只有 40×40，換圖一定要壓過再放——直接掛原始 PNG 等於每個訪客白下載 882 KB |
| `downloads/` | 可下載的程式範例 `.tb` |
| `sitemap.xml` | **退路用的靜態檔**。正常情況由 worker 動態產生並覆蓋它 |
| `robots.txt` | 允許全部，並宣告 sitemap |

## 改東西要動哪裡

日常維護幾乎都只改 `index.html` 裡的資料，**不需要動 `_worker.js`**：

| 要做的事 | 改哪裡 |
|---|---|
| 換照片 | 覆蓋 `photos/` 底下同名檔案 |
| 新增相簿梯次 | `_rawAlbums()` 陣列**最前面**加一本 |
| 新增／修改營隊 | `_rawCamps()` |
| 新增教具 | `get tools()` |
| 新增教材 | `_rawResources()`。要放封面照就加一行 `img: '/photos/...webp'`，卡片與詳細頁會自動吃，沒填就顯示佔位框 |
| 改 STEAM 教育理念的文字 | `index.html` 的「STEAM 教育理念」區塊（純 HTML，沒有資料陣列） |
| 新增頁面 | `get routeNames()` 加一個路由名 |
| 改常態課程頁 | `index.html` 的 `isCourses`／`isBrick`／`isCar`／`isLaser`／`isPrinting`／`isHumanoid`／`isMinecraft` 七個區塊（純 HTML，無資料陣列） |

worker 會在執行時從 `index.html` 讀出上述結構，自動得知有哪些網址存在，
並據此產生 sitemap。**新增內容不必同步改 worker，也不會 404。**

只有兩種情況要動 `_worker.js`：想替某頁寫專屬 SEO 文案（加進 `ROUTE_META`），
或新增網域轉址規則。

### SEO 與 AI 搜尋的自動化

- worker 會依目前網址產生獨立的 title、description、Open Graph、Twitter、canonical、
  WebPage 與 BreadcrumbList；教具及教材詳細頁會再產生 LearningResource。
- body 裡的 `<noscript>` 也會改成目前頁面的摘要，讓不執行 JavaScript 的搜尋服務不會把
  每個網址都誤認成首頁。不要把它改回寫死的首頁文案。
- 日常科普文章現在是既有 `/resource/<slug>` 教材子頁，不是同頁展開，也不是獨立 Blog。
  所有文章資料集中在 `index.html` 的 `<script id="daily-science-data" type="application/json">`；
  標題、摘要、主圖、關鍵主題、學習目標、材料、內文、比較表、FAQ、參考來源只需在這裡修改。
  前端 `_scienceResources()` 與 worker 都讀取同一份 JSON，會自動生成教材卡片、分類、
  獨立 meta/canonical、Article/LearningResource、sitemap，以及不執行 JS 也能閱讀的完整內文。
  新增同格式資料不用再修改 worker；原本六份教材仍保留在 `_rawResources()`。
  教材卡片使用真實 href 正常跳頁，直接開啟、重新整理與分享網址都會取得該篇的搜尋資訊。
- `robots.txt` 的 `User-agent: *` 允許一般搜尋引擎，並明確允許 OAI-SearchBot。
  Cloudflare 的 Bot／WAF 是否另行封鎖爬蟲仍要在後台確認，不能用假 User-Agent 的 curl 判定。
- 本站不靠額外的 `llms.txt` 排名；主要頁面要保留具體、可見的 H1、場域、課程主題與實績文字。
- `node _worker.test.mjs` 會驗證 JSON-LD、Twitter meta、非 JS 摘要、語言標頭與 OAI-SearchBot 規則。

### 每日科普專欄（2026-10-18 起）

每天 08:30 由雲端排程任務產一篇新文章並開 PR 審稿，merge 後才上架。
主題輪替與已發布清單在 `science/進度.md`，排程任務每次都會讀它避免重複。

文章一樣寫進 `daily-science-data` 陣列（放**最前面**＝最新），除了原本的欄位，
排程產出的文章會多四個**選填**欄位。舊文章沒有這些欄位完全不影響，頁面會自動跳過：

| 欄位 | 內容 |
|---|---|
| `type` | `A`（科學新知）／`B`（工程視角）／`weekend`（週末動手玩），只給選題用，頁面不顯示 |
| `diagram` | 原理示意圖路徑 `/photos/blog/<slug>-diagram.svg`。viewBox 800×450、深色底 `#101114`，只能用基本圖形與文字，**不可有 `<script>`、`on*` 屬性或外部連結** |
| `diagramCaption` | 示意圖的圖說，同時當作 `alt` 文字 |
| `brainTeaser` | 文末「動動腦」問題，純文字，用 `\n\n` 分段 |
| `slides` | 課堂簡報文案 8–10 張 `{no, title, bullets[], notes}`。每張最多 4 點、每點 20 字內、`notes` 講稿 50–120 字。顯示在文章頁可展開的「課堂簡報文案」區塊，附「複製全部」按鈕 |

`_worker.test.mjs` 的「每日科普」區塊會驗證上述格式；改這幾個欄位前先跑一次測試。
`slides` **不會**進非 JS 摘要與 sitemap，那是給老師用的，不是給搜尋引擎的。

#### 每次開 PR 都要附「線上預覽」連結

Haku 要的是**可以直接點開看的畫面**，不是截圖、不是模擬。
Cloudflare Pages 會自動為每個分支開一個預覽站，網址規則是把分支名的 `/` 換成 `-`：

```
分支  claude/science-2026-10-19
預覽  https://claude-science-2026-10-19.weiyan-landing.pages.dev
文章  https://claude-science-2026-10-19.weiyan-landing.pages.dev/resource/<slug>
```

**PR 說明的第一段就要放這個連結**，而且要先用 curl 確認回 200、標題正確、
主視覺與示意圖都抓得到，再把連結寫進去——不要貼一個沒驗證過的網址給他點。

```bash
U="https://claude-science-$(date +%F).weiyan-landing.pages.dev"
curl -sL "$U/resource/<slug>" | grep -o "<title>[^<]*"
curl -s -o /dev/null -w "%{http_code}\n" "$U/photos/blog/<slug>.webp"
```

推上去之後要等 1–2 分鐘 Cloudflare 才建好，第一次抓到 404 是正常的，重試即可。

**注意**：`_worker.js` 只把 `weiyan.pages.dev` 這一個網域導回正式站，
`*.weiyan-landing.pages.dev` 的分支預覽**不會**被導走，所以預覽站可以正常使用。

#### 測試項數會隨篇數成長

`node _worker.test.mjs` 的總項數**不是固定的**，每多一篇文章就多約 25 項
（5 篇時 183 項，6 篇時 208 項）。**判斷標準是「失敗 0 項」，不是總數。**
測試裡不可以再寫死篇數或 sitemap 筆數，要由 `daily-science-data` 的實際長度推算。

#### 主視覺需要 Cloudflare 金鑰

排程任務用 Cloudflare Workers AI 產生主視覺，排程環境要設定 `CF_ACCOUNT_ID` 與 `CF_AI_TOKEN`。
2026-10-19 首次執行時兩者都沒設，主視覺改用手繪向量暫代圖，PR 說明會標註「主視覺未產生」。
金鑰補上之前，每天的主視覺都會是暫代圖。

### 唯一還沒自動化的地方

CAMP 頁輪播取 `_rawAlbums()[0]`，但輪播旁的日期與說明文字是**寫死在 HTML 裡**的
（搜尋 `ON SITE ·`）。新增相簿梯次時要一起改，否則會變成新照片配舊圖說。

### 導覽列已接近寬度上限

桌機導覽目前 **9 項**（TOOLS／RESOURCES／COURSES／CAMP／GALLERY／PROJECTS／STEAM／
ABOUT／JOIN）。2026-08-25 加入 COURSES 時實測：在原本的 960px 斷點下，
logo 與導覽之間的間距被擠成 **0px**，所以同時做了兩件事——
`gap` 從 28px 縮到 24px，斷點從 `innerWidth < 960` 調到 **`< 1040`**。
1040px 時量到的餘裕是 88px。

2026-08-29 頁首品牌區改為 Logo ＋「微研 Weiyan」＋「白空科研有限公司」後寬度增加，
斷點再提高為 **`< 1120`**。實際預覽在 1120px 量得品牌與導覽間距 139px，1119px 會切換為漢堡選單。
修改品牌文字時，頁首與手機全螢幕選單的品牌區要一起更新。
兩處使用同一張 `photos/brand/weiyan-symbol-160.webp`，都以 `object-fit:contain` 完整顯示，不做 CSS 裁切；未來更換圖標時，頁首與手機選單要一起更新。

**要加第 10 個導覽項目前，先在 1120px 量一次**：

```js
// 在 DevTools console 執行，gap 至少要留 40px
const h=document.querySelector('header'),n=h.querySelector('nav'),l=h.querySelector('a');
Math.round(n.getBoundingClientRect().left - l.getBoundingClientRect().right)
```

擠不下就再縮 `gap`、把斷點往上調，或把新頁面收進既有的分類頁（COURSES 就是
這樣收了六個課程頁，只佔一格導覽）。手機版全螢幕選單已加 `overflow-y:auto`，
機身短的手機（667px 高以下）才滑得到最後一項。

## 常態課程頁（2026-08-25 新增）

`/courses` 是分類頁，底下**六個**課程頁：`/brick`（積木機器人）、`/car`（AI自走車）、
`/laser`（雷切科學課）、`/printing`（3D 列印）、`/humanoid`（AI 人形機器人）、
`/minecraft`（Minecraft 科技探索）。分類頁的卡片順序＝資料完整度由高到低。

- 六頁都是**純 HTML 寫在 `index.html` 裡**，沒有資料陣列，直接改文字就好。
- 樣式集中在 `<style>` 裡的 `.wc-*` 類別（`wc` = weiyan course）。大字、圓角、
  每條課程線一個主色：積木 `#2F7DE1`、自走車 `#7A4DE8`、雷切 `#F2803C`、
  3D列印 `#D4491F`、人形機器人 `#1B7FA8`、Minecraft `#3FAE68`。
- 放照片用 `.wc-photo`（外層設 `aspect-ratio`，裡面放 `<img loading="lazy">`）。
  產品照或教學圖卡要完整顯示時，在 `<img>` 加 `style="object-fit:contain;"`。
- **`.wc-hero` 與 `.wc-sec` 只能設 `padding-top`／`padding-bottom`**，
  不要用 `padding` 簡寫——簡寫會把 `.wc` 的左右內距歸零，內容會貼到螢幕邊緣。
  （這個坑已經踩過一次。）
- 路由名只能用**純小寫英文字母**：`_worker.js` 解析 `routeNames` 的正則是
  `/'([a-z]+)'/g`，帶連字號或數字的路由名會整個抓不到，sitemap 就會漏掉那一頁。
- 新增課程頁要同時改三個地方，`node _worker.test.mjs` 的「課程頁」區塊會擋住漏改：
  1. `index.html` 的 `get routeNames()`
  2. `index.html` 的 `renderVals()`（`isXxx` 旗標 ＋ `goXxx` 跳轉）與 `_syncHead()`
  3. `_worker.js` 的 `ROUTE_META`（沒寫就只有通用 SEO 文案）

### 課程頁的照片來源

`photos/courses/` 底下：

| 檔案 | 來源 | 用在 |
|---|---|---|
| `humanoid-01`～`10.webp` | `01_課程體系/自研發教案教材/九軸人形機器人/AI人形機器人課程圖片集.pdf` 抽出的十張教學圖卡 | `/humanoid` |
| `print-01`～`05.webp` | `02_夏令營與營隊/空氣品質夏令營/照片/`（2025 年營隊實拍） | `/printing` |

`/car` 沒有另存新檔，直接引用站上既有的 `photos/camp-2026-07/`、
`photos/camp-2026-07-29/`、`photos/tools/mtc-v2/`——那批本來就是自走車營隊的照片。

**`print-01`～`05` 裡有學生正面入鏡。** 2026-08-26 使用者已確認肖像權可使用。
之後若要新增有學生入鏡的照片，一樣要先確認同意再放。

### 課程頁還沒填完的東西

**橘底 `待填` 欄位（`wc-todo`）已於 2026-08-26 全部填完，目前為 0 個。**
六頁的價格與堂數如下，改價格時直接搜尋數字即可：

| 頁面 | 堂數 | 費用 | 上課時間 | 其他 |
|---|---|---|---|---|
| `/car` | 8 堂／期 | 4,800（早鳥 4,200，11/30 前） | 每週三 16:00–17:30 | 地點：高科大旁強納森美語教室（2026-10-17 定案）；報名走 weiyan-aicar-2026.pages.dev |
| `/brick` | 8 堂 | 4,800 | 歡迎 LINE 諮詢 | |
| `/laser` | 8 堂／期 | 4,800（早鳥 4,200，11/30 前） | 每週三 13:30–15:00 | 地點：高科大旁強納森美語教室；每班限 12 人；報名走 weiyan-laser-2026.pages.dev（repo `exhakuoho/weiyan-laser-2026`）；CAMP 頁卡片 `laser-weekly-2026` |
| `/printing` | 8 堂 | 8,000 | 歡迎 LINE 諮詢 | 年齡：國小中高年級～高中三年級；要自備筆電 |
| `/humanoid` | 常態課 8 堂／培訓營 8 堂 | 4,800（培訓營分開計價） | 歡迎 LINE 諮詢 | 體驗課 1 小時 |
| `/minecraft` | 未定案 | 未定案 | — | 頁面上有「課程資訊整理中」說明，這是刻意的，不是漏填 |

六個課程頁的 CTA 按鈕已全部改為 LINE（`https://lin.ee/rZW93KN`），
不再用 Email。站上 LINE 連結共 9 處（6 個課程頁 CTA ＋ `/laser` 頂部報名區 ＋ `/camp` 按鈕 ＋ footer），
**全部是同一個網址**，換帳號時要一起換，不要只改 footer。

`/laser` 標題下方有置頂「報名中」區塊（2026-10-17 加），兩個入口連到
`weiyan-laser-2026.pages.dev/?style=cute#register`（3–4 年級）與 `?style=tech#register`（5–6 年級），
跟紙本傳單上的 QR 是同一組網址；改報名網址時傳單 QR 也要重做
（`01_課程體系/初階 雷切教案/傳單_v3_QR與錯字修正.py`）。早鳥截止後記得改這塊的「早鳥 NT$ 4,200」字樣。

**唯一還沒補的是照片**：`/brick` 有 `PHOTO 02`～`06`、`/laser` 有 `PHOTO 07`，
共 6 張虛線框在等實拍照。放法見
`01_課程體系/積木教案/網站/README_怎麼放照片.md`（該資料夾的 `photos/` 目前是空的）。
**照片一定要用自己拍的**，不要從網路抓——這是營利性招生頁。
**這 6 張補完前，`/brick` 與 `/laser` 不適合上線給家長看**（頁面上會出現
「PHOTO 02」這種內部標記）。

## 照片處理慣例

- 格式 WebP、品質 85、長邊上限 1600（來源比較小就維持原生解析度，**不要放大**）
- 讀取來源照片時記得依 EXIF 轉正，否則直向照片會橫躺
- 相簿容器是 `aspect-ratio:16/9` + `object-fit:contain`，不會裁切但會有黑邊；
  教具卡片是 `object-fit:cover`，會裁切，主體要留邊

## 踩過的坑（不要再踩一次）

1. **中文沒有空白，不能用 `split()` 算字數。** 要看內容量請算字元數，
   並扣掉樣板（導覽選單在 HTML 裡重複三次，約 1,100 字元）。
2. **`section()` 的起點要用定義處。** 曾經寫 `'_rawResources()'` 結果比對到前面的
   呼叫處，區塊一路吃到 `_rawProjects()`，把 4 筆專案誤判成教材，
   生出 `/resource/nkust-camp` 這種假網址。要寫 `'_rawResources() {'`。
3. **Cloudflare Pages 會把 `/foo.html` 轉到 `/foo`。** 上傳 Google 驗證檔那種
   `.html` 檔會被 308，別以為是自己弄錯。（目前已改用 DNS 驗證，檔案已移除。）
4. **這個站的 Pages 設定對未知路徑會回退到 SPA 首頁並回 200。** 所以
   「用 ASSETS 回退」不能當成通用的找不到處理，會讓所有錯誤網址變成 soft 404。
5. **`git add -A` 會掃到還沒 commit 的其他改動。** 曾經把規格修正誤併進
   Google 驗證檔的 commit。請明確指定檔名。
6. **用 curl 假冒 bot 的 User-Agent 測試會得到假結果。** Cloudflare 會擋偽裝爬蟲，
   403 不代表該爬蟲被政策封鎖。要看真實設定請進 Cloudflare 後台。
7. **驗證線上部署時，`/index.html` 會 308。** 要抓實際內容請用 `curl -L` 或直接
   打 `/`、`/camp` 這類真實路徑。

## 收工前

1. `node _worker.test.mjs` 全過
2. push 後**實際驗證線上結果**，不要只看 commit 成功：
   ```bash
   curl -sL "https://weiyan.designjarvis.com/camp" | grep -o "<title>[^<]*"
   curl -s -o /dev/null -w "%{http_code}\n" "https://weiyan.designjarvis.com/totally-bogus"   # 應為 404
   ```
3. 部署要 1–2 分鐘，第一次抓到舊內容是正常的，重試即可
4. 跟使用者回報時，講清楚**實際驗證到什麼**，不要說「應該生效了」

## 這個站在 designjarvis 家族裡的位置

`designjarvis.com` 底下有十幾個各自獨立的 Cloudflare Pages 專案，本站只是其中之一。
跨站規則（不要加 `<base href>`、canonical 不可指向 apex 等）以 DesignJarvis 的
SEO 交接說明為準，但**下面幾點是本站特有、與那份文件不同的**：

- **canonical 與 og:url 由 `_worker.js` 即時注入，`index.html` 裡沒有這幾行。**
  不要因為在 `index.html` 搜不到就手動補一行，會變成兩個 canonical 互打。
  要改請改 `_worker.js` 的 `CANONICAL_ORIGIN` 或 `rewriteHead()`。
- **本站的 `sitemap.xml` 是動態產生的**，站內新增頁面會自動收錄，
  不需要去 `home.designjarvis.com` 的總 sitemap 加一筆。
  那份總 sitemap 列的是「各站入口」（本站只佔 `/` 與 `/camp` 兩筆），
  只有新增**整個站**時才需要動它。
- **`weiyan-camp.designjarvis.com` 導向 `/camp` 用的是 308**（不是 301），由 worker 處理。
- **robots.txt 由本 repo 供應**。2026-08-09 已關閉 Cloudflare 的 Managed robots.txt，
  舊文件說「該檔由 Cloudflare 代管、不可修改」已不成立。
- apex `designjarvis.com` 目前**沒有 DNS 記錄、無法解析**，任何 canonical、連結、
  sitemap 都不可指向它。

## 相關資源

- 原廠（東業創新）MTC V2 資料：`https://trgreat.com/mtc-v2-guide/`、`https://trgreat.com/tu-wiki/`
- 微研是 MTC V2 的**高雄區代理**
- 原廠開源中心：`https://trgreat.com/dongyelab/`（3D 列印檔、競賽場地、教案）。
  轉載這些素材前需取得書面同意，代理權不等於內容授權
