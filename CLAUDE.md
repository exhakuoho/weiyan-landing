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
node _worker.test.mjs    # 39 項，全過才動手
```

第三件：確認你要改的東西屬於哪一類（見下方「改東西要動哪裡」）。

## 檔案結構

| 檔案 | 說明 |
|---|---|
| `index.html` | **整個網站**。版面、樣式、所有內容資料都在這一個檔案裡（約 150 KB） |
| `_worker.js` | Cloudflare Worker。依路由改寫 `<head>` 的 meta、產生 sitemap、處理轉址與 404 |
| `_worker.test.mjs` | worker 的離線測試，`node _worker.test.mjs` |
| `photos/` | 相簿與教具照片，WebP |
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
| 新增教材 | `_rawResources()` |
| 改 STEAM 教育理念的文字 | `index.html` 的「STEAM 教育理念」區塊（純 HTML，沒有資料陣列） |
| 新增頁面 | `get routeNames()` 加一個路由名 |
| 改常態課程頁 | `index.html` 的 `isCourses`／`isBrick`／`isMinecraft`／`isLaser` 四個區塊（純 HTML，無資料陣列） |

worker 會在執行時從 `index.html` 讀出上述結構，自動得知有哪些網址存在，
並據此產生 sitemap。**新增內容不必同步改 worker，也不會 404。**

只有兩種情況要動 `_worker.js`：想替某頁寫專屬 SEO 文案（加進 `ROUTE_META`），
或新增網域轉址規則。

### 唯一還沒自動化的地方

CAMP 頁輪播取 `_rawAlbums()[0]`，但輪播旁的日期與說明文字是**寫死在 HTML 裡**的
（搜尋 `ON SITE ·`）。新增相簿梯次時要一起改，否則會變成新照片配舊圖說。

### 導覽列已接近寬度上限

桌機導覽目前 **9 項**（TOOLS／RESOURCES／COURSES／CAMP／GALLERY／PROJECTS／STEAM／
ABOUT／JOIN）。2026-08-25 加入 COURSES 時實測：在原本的 960px 斷點下，
logo 與導覽之間的間距被擠成 **0px**，所以同時做了兩件事——
`gap` 從 28px 縮到 24px，斷點從 `innerWidth < 960` 調到 **`< 1040`**。
1040px 時量到的餘裕是 88px。

**要加第 10 個導覽項目前，先在 1040px 量一次**：

```js
// 在 DevTools console 執行，gap 至少要留 40px
const h=document.querySelector('header'),n=h.querySelector('nav'),l=h.querySelector('a');
Math.round(n.getBoundingClientRect().left - l.getBoundingClientRect().right)
```

擠不下就再縮 `gap`、把斷點往上調，或把新頁面收進既有的分類頁（COURSES 就是
這樣收了三個課程頁，只佔一格導覽）。手機版全螢幕選單已加 `overflow-y:auto`，
機身短的手機（667px 高以下）才滑得到最後一項。

## 常態課程頁（2026-08-25 新增）

`/courses` 是分類頁，底下三個課程頁：`/brick`（積木機器人）、`/minecraft`
（Minecraft 科技探索）、`/laser`（雷切科學課）。

- 四頁都是**純 HTML 寫在 `index.html` 裡**，沒有資料陣列，直接改文字就好。
- 樣式集中在 `<style>` 裡的 `.wc-*` 類別（`wc` = weiyan course）。大字、圓角、
  每條課程線一個主色：積木 `#2F7DE1`、Minecraft `#3FAE68`、雷切 `#F2803C`。
- **`.wc-hero` 與 `.wc-sec` 只能設 `padding-top`／`padding-bottom`**，
  不要用 `padding` 簡寫——簡寫會把 `.wc` 的左右內距歸零，內容會貼到螢幕邊緣。
  （這個坑已經踩過一次。）
- 路由名只能用**純小寫英文字母**：`_worker.js` 解析 `routeNames` 的正則是
  `/'([a-z]+)'/g`，帶連字號或數字的路由名會整個抓不到，sitemap 就會漏掉那一頁。
- 新增課程頁要同時改三個地方，`node _worker.test.mjs` 的「課程頁」區塊會擋住漏改：
  1. `index.html` 的 `get routeNames()`
  2. `index.html` 的 `renderVals()`（`isXxx` 旗標 ＋ `goXxx` 跳轉）與 `_syncHead()`
  3. `_worker.js` 的 `ROUTE_META`（沒寫就只有通用 SEO 文案）

### 課程頁還沒填完的東西

頁面上橘底 `待填` 的欄位（搜尋 `wc-todo`）：三頁的上課時間與費用、積木課的堂數。
另外七個 `PHOTO 0X` 虛線框是等實拍照片的位置，放法見
`01_課程體系/積木教案/網站/README_怎麼放照片.md`。**照片一定要用自己拍的**，
不要從網路抓——這是營利性招生頁。

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
