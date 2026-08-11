# 微研 WEIYAN

微研專注於科學、工程、機器人與科技教育，並與國立高雄科技大學及在地學校合作辦理科技營隊。

- 正式網站：https://weiyan.designjarvis.com/
- 營隊資訊：https://weiyan.designjarvis.com/camp
- 教具與教材：https://weiyan.designjarvis.com/tools
- STEAM 教育理念：https://weiyan.designjarvis.com/steam

網站部署於 Cloudflare Pages。正式網域是 `weiyan.designjarvis.com`；`weiyan.pages.dev` 僅作為平台預設網域。

## 檔案結構

| 檔案 | 用途 |
|---|---|
| `index.html` | 整個網站。版面、樣式與所有內容資料都在這一個檔案裡 |
| `_worker.js` | Cloudflare Worker。依路由改寫 `<head>` 的 title／description／og／canonical，並處理轉址與 404 |
| `photos/` | 相簿與教具照片（WebP） |
| `downloads/` | 可下載的程式範例（`.tb`） |
| `_worker.test.mjs` | worker 的離線測試，執行 `node _worker.test.mjs` |
| `sitemap.xml` | 退路用的靜態清單。正常情況由 `_worker.js` 動態產生並覆蓋 |
| `CLAUDE.md` | 交給 Claude Code 維護時的工作說明 |

## 改內容要動哪裡

日常維護幾乎都在 `index.html` 裡改資料，**不需要動 `_worker.js`**：

- **換照片** — 覆蓋 `photos/` 底下的檔案即可，檔名不變就不用改程式
- **新增相簿梯次** — 在 `_rawAlbums()` 陣列最前面加一本。CAMP 頁輪播取第一本，
  記得同時更新輪播旁那兩行寫死的日期與說明文字
- **新增營隊** — 加進 `_rawCamps()`
- **新增教具／教材** — 加進 `get tools()` 或 `_rawResources()`
- **改 STEAM 教育理念的文字** — 直接改 `index.html` 裡「STEAM 教育理念」那一段 HTML。
  這一頁沒有用資料陣列，八個方法各是一張 `<article>`，複製一張改文字就能加第九個
- **新增頁面** — 路由名稱加進 `get routeNames()`。若要出現在導覽列，
  桌機導覽已有 8 項、寬度接近上限，加第 9 項前請先確認 960px 寬度下不會擠出去

`_worker.js` 會在執行時從 `index.html` 讀出上述結構，自動得知有哪些網址存在。
新增教具、教材或頁面**不必**同步修改 worker，也不會出現 404。

只有兩種情況需要動 `_worker.js`：

1. 想替某個頁面寫專屬的 SEO 標題與描述 → 加進 `ROUTE_META`
   （沒寫的話會自動產生一組通用的，不會壞）
2. 新增網域轉址規則

`sitemap.xml` 由 worker 依同一份結構動態產生，新增頁面會自動收錄，不必手動維護。
（repo 裡那份靜態 `sitemap.xml` 只是 worker 失效時的退路。）

修改 `_worker.js` 或 `index.html` 的資料結構後，請執行測試確認沒弄壞東西：

```bash
node _worker.test.mjs
```
