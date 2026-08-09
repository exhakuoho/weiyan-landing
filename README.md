# 微研 WEIYAN

微研專注於科學、工程、機器人與科技教育，並與國立高雄科技大學及在地學校合作辦理科技營隊。

- 正式網站：https://weiyan.designjarvis.com/
- 營隊資訊：https://weiyan.designjarvis.com/camp
- 教具與教材：https://weiyan.designjarvis.com/tools

網站部署於 Cloudflare Pages。正式網域是 `weiyan.designjarvis.com`；`weiyan.pages.dev` 僅作為平台預設網域。

## 檔案結構

| 檔案 | 用途 |
|---|---|
| `index.html` | 整個網站。版面、樣式與所有內容資料都在這一個檔案裡 |
| `_worker.js` | Cloudflare Worker。依路由改寫 `<head>` 的 title／description／og／canonical，並處理轉址與 404 |
| `photos/` | 相簿與教具照片（WebP） |
| `downloads/` | 可下載的程式範例（`.tb`） |
| `sitemap.xml` | 提交給搜尋引擎的網址清單 |
| `google*.html` | Google Search Console 驗證檔，驗證成功後仍須保留 |

## 改內容要動哪裡

日常維護幾乎都在 `index.html` 裡改資料，**不需要動 `_worker.js`**：

- **換照片** — 覆蓋 `photos/` 底下的檔案即可，檔名不變就不用改程式
- **新增相簿梯次** — 在 `_rawAlbums()` 陣列最前面加一本。CAMP 頁輪播取第一本，
  記得同時更新輪播旁那兩行寫死的日期與說明文字
- **新增營隊** — 加進 `_rawCamps()`
- **新增教具／教材** — 加進 `get tools()` 或 `_rawResources()`
- **新增頁面** — 路由名稱加進 `get routeNames()`

`_worker.js` 會在執行時從 `index.html` 讀出上述結構，自動得知有哪些網址存在。
新增教具、教材或頁面**不必**同步修改 worker，也不會出現 404。

只有兩種情況需要動 `_worker.js`：

1. 想替某個頁面寫專屬的 SEO 標題與描述 → 加進 `ROUTE_META`
   （沒寫的話會自動產生一組通用的，不會壞）
2. 新增網域轉址規則

另外，`sitemap.xml` 目前是手動維護的，新增頁面時請記得補上，否則搜尋引擎不會主動收錄。
