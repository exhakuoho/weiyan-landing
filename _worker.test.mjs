/**
 * _worker.js 的離線測試。改完 _worker.js 或 index.html 的資料結構後請執行：
 *
 *     node _worker.test.mjs
 *
 * 不需要網路，也不需要部署。用假的 ASSETS 取代 Cloudflare 的靜態資源層。
 * 全部顯示 ✓ 才可以 push。
 */
import { readFileSync } from 'node:fs';

const INDEX = readFileSync('./index.html', 'utf8');
const STATIC_SITEMAP = readFileSync('./sitemap.xml', 'utf8');
const ROBOTS = readFileSync('./robots.txt', 'utf8');
const ORIGIN = 'https://weiyan.designjarvis.com';

let pass = 0, fail = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok ? '' : `  （得到 ${actual}，預期 ${expected}）`}`);
}

function makeEnv(indexHtml = INDEX, lastModified = 'Sat, 09 Aug 2026 03:00:00 GMT') {
  return {
    ASSETS: {
      async fetch(req) {
        const p = new URL(req.url).pathname;
        const h = { 'content-type': 'text/html' };
        if (lastModified) h['last-modified'] = lastModified;
        if (p === '/index.html' || p === '/') return new Response(indexHtml, { headers: h });
        if (p === '/sitemap.xml') return new Response(STATIC_SITEMAP);
        if (p === '/robots.txt') return new Response(ROBOTS, {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
        if (p.startsWith('/photos/') || p.startsWith('/downloads/')) return new Response('bin');
        return new Response('not found', { status: 404 });
      },
    },
  };
}

// 每個情境重新 import，讓 worker 模組層的 SITE 快取重置
const fresh = async () => (await import('./_worker.js?v=' + Math.random())).default;
const get = (w, env, path) => w.fetch(new Request(ORIGIN + path), env);

// ---------------------------------------------------------------------------
console.log('\n【路由：既有頁面可達，不存在的回 404】');
{
  const w = await fresh(), env = makeEnv();
  for (const p of ['/', '/camp', '/gallery', '/steam', '/tool/mtc-v2', '/resource/mtc-forward'])
    check(p, (await get(w, env, p)).status, 200);
  for (const p of ['/totally-bogus', '/tool/nope', '/resource/nope'])
    check(p, (await get(w, env, p)).status, 404);
}

// ---------------------------------------------------------------------------
// 2026-08-25 新增的常態課程頁。這四條路由必須同時存在於 index.html 的
// routeNames 與 worker 的 ROUTE_META，缺一邊就會變成沒有專屬 SEO 文案的通用頁。
console.log('\n【課程頁：七條路由可達且各有專屬 SEO 文案】');
{
  const w = await fresh(), env = makeEnv();
  const coursePaths = ['/courses', '/brick', '/minecraft', '/laser', '/car', '/printing', '/humanoid'];
  const titles = new Set();
  for (const p of coursePaths) {
    const res = await get(w, env, p);
    check(`${p} 可達`, res.status, 200);
    const html = await res.text();
    const title = (html.match(/<title>(.*?)<\/title>/s) || [])[1] || '';
    titles.add(title);
    check(`${p} 有專屬 title`, title.includes('微研 WEIYAN') && !title.includes('營隊專家｜科學'), true);
    check(`${p} canonical 正確`,
      (html.match(/rel="canonical" href="(.*?)"/) || [])[1], ORIGIN + p);
  }
  check('七頁 title 互不相同', titles.size, 7);
  const xml = await (await get(w, env, '/sitemap.xml')).text();
  check('七頁都進了 sitemap',
    coursePaths.every((p) => xml.includes('<loc>' + ORIGIN + p + '</loc>')), true);
}

// ---------------------------------------------------------------------------
console.log('\n【每頁有自己的 title 與 canonical（社群分享與收錄靠這個）】');
{
  const w = await fresh(), env = makeEnv();
  const titles = new Set();
  for (const p of ['/', '/camp', '/steam', '/tool/mtc-v2', '/resource/mtc-forward']) {
    const html = await (await get(w, env, p)).text();
    titles.add((html.match(/<title>(.*?)<\/title>/s) || [])[1]);
    check(`${p} canonical 正確`,
      (html.match(/rel="canonical" href="(.*?)"/) || [])[1], ORIGIN + p);
  }
  check('5 頁的 title 互不相同', titles.size, 5);
}

// ---------------------------------------------------------------------------
console.log('\n【SEO 與 AI 搜尋：每頁語意、分享資訊與非 JS 摘要】');
{
  const w = await fresh(), env = makeEnv();
  const campRes = await get(w, env, '/camp');
  const campHtml = await campRes.text();
  const title = (campHtml.match(/<title>(.*?)<\/title>/s) || [])[1] || '';
  const twitter = (campHtml.match(/<meta name="twitter:title" content="(.*?)">/) || [])[1] || '';
  check('Twitter 標題跟著目前頁面', twitter, title);
  check('非 JS 摘要是營隊頁而非首頁',
    /<noscript>[\s\S]*?<h1>高雄科技營隊與夏令營<\/h1>/.test(campHtml), true);
  check('允許完整搜尋摘要與圖片預覽',
    campHtml.includes('max-snippet:-1') && campHtml.includes('max-image-preview:large'), true);
  check('HTML 語言回應標頭正確', campRes.headers.get('content-language'), 'zh-Hant-TW');
  check('HTTP 索引規則與 HTML 一致', campRes.headers.get('x-robots-tag')?.includes('index, follow'), true);

  const json = (campHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  const graph = JSON.parse(json)['@graph'];
  check('結構化資料包含教育機構', graph.some((x) => x['@type'] === 'EducationalOrganization'), true);
  check('結構化資料包含營隊集合頁',
    graph.some((x) => x['@type'] === 'CollectionPage' && x.url === ORIGIN + '/camp'), true);
  check('結構化資料包含麵包屑', graph.some((x) => x['@type'] === 'BreadcrumbList'), true);

  const toolHtml = await (await get(w, env, '/tool/mtc-v2')).text();
  const toolJson = (toolHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
  const toolGraph = JSON.parse(toolJson)['@graph'];
  check('教具詳細頁標成 LearningResource',
    toolGraph.some((x) => x['@type'] === 'LearningResource' && x.name.includes('MTC V2')), true);
  const crumbs = toolGraph.find((x) => x['@type'] === 'BreadcrumbList');
  check('教具頁麵包屑有三層', crumbs.itemListElement.length, 3);

  const robots = await (await get(w, env, '/robots.txt')).text();
  check('robots 明確允許 OAI-SearchBot', robots.includes('User-agent: OAI-SearchBot'), true);
  check('前端站內切換沿用營隊 SEO 標題',
    INDEX.includes("camp: ['高雄科技營隊與夏令營｜機器人・AI・3D 列印｜' + base"), true);
  check('前端站內切換同步 Open Graph 與 Twitter',
    INDEX.includes("['meta[property=\"og:title\"]', nextTitle]") &&
      INDEX.includes("['meta[name=\"twitter:title\"]', nextTitle]"), true);
}

// ---------------------------------------------------------------------------
console.log('\n【新增內容不必改 _worker.js】');
{
  const withTool = INDEX.replace("slug: 'mtc-v2', name: 'MTC V2',",
    "slug: 'zz-new', name: '新教具', subtitle: 'x', category: 'R', tagline: [], " +
    "imgHint: '', desc: '', overview: '', learn: [], features: [], resources: [] },\n" +
    "      { slug: 'mtc-v2', name: 'MTC V2',");
  const w1 = await fresh();
  check('新教具的頁面可達', (await get(w1, makeEnv(withTool), '/tool/zz-new')).status, 200);
  const w2 = await fresh();
  const xml = await (await get(w2, makeEnv(withTool), '/sitemap.xml')).text();
  check('新教具自動進入 sitemap', xml.includes('/tool/zz-new'), true);

  const withPage = INDEX.replace("'gallery', 'join'", "'gallery', 'join', 'kscrc'");
  const w3 = await fresh();
  check('新頁面可達', (await get(w3, makeEnv(withPage), '/kscrc')).status, 200);
}

// ---------------------------------------------------------------------------
console.log('\n【sitemap 動態產生】');
{
  const w = await fresh(), env = makeEnv();
  const res = await get(w, env, '/sitemap.xml');
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  check('content-type 為 XML', res.headers.get('content-type').includes('xml'), true);
  // 頁面 16（/、tools、resources、courses、brick、minecraft、laser、
  //          car、printing、humanoid、projects、steam、about、camp、gallery、join）
  // ＋教具 4 ＋原教材 6 ＋日常科學教材 5。
  check('網址數與站台結構一致', locs.length, 31);
  check('沒有重複網址', new Set(locs).size, locs.length);
  // 專案（_rawProjects）不是路由，不可出現在 /resource/ 底下
  check('專案 slug 未被誤判為教材',
    locs.some((l) => l.includes('/resource/nkust-camp')), false);
}

// ---------------------------------------------------------------------------
console.log('\n【日常科學：獨立教材子頁與可讀取的內容】');
{
  const w = await fresh(), env = makeEnv();
  const sitemap = await (await get(w, env, '/sitemap.xml')).text();
  const resourcesHtml = await (await get(w, env, '/resources')).text();
  const data = JSON.parse(INDEX.match(/<script id="daily-science-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  const titles = new Set();
  check('五篇資料來源', data.length, 5);
  check('不再同頁展開', INDEX.includes('wy-science-card'), false);
  check('沿用教材卡片的實際網址', INDEX.includes('href="/resource/{{ r.slug }}"'), true);
  check('日常科學分類', INDEX.includes("'ALL', '日常科學'"), true);
  for (const r of data) {
    const path = '/resource/' + r.slug;
    const res = await get(w, env, path);
    const html = await res.text();
    const noJs = html.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const article = schema['@graph'].find(x => x['@type'] === 'Article');
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    titles.add(title);
    check(path + ' 200', res.status, 200);
    check(path + ' 獨立標題', title, r.title + '｜學習資源｜微研 WEIYAN');
    check(path + ' 獨立摘要', html.includes('name="description" content="' + r.desc + '"'), true);
    check(path + ' 唯一 canonical', (html.match(/<link[^>]+rel="canonical"/g)||[]).length, 1);
    check(path + ' canonical 正確', html.includes('href="' + ORIGIN + path + '"'), true);
    check(path + ' 進入 sitemap', sitemap.includes('<loc>' + ORIGIN + path + '</loc>'), true);
    check(path + ' 列表可爬取的連結', resourcesHtml.includes('href="' + path + '"'), true);
    check(path + ' 不執行 JS 也有完整內文', r.content.every(c => noJs.includes(c.p.split('\n\n')[0])), true);
    check(path + ' FAQ 與來源', noJs.includes('家長常問') && noJs.includes(r.sources[0].url), true);
    check(path + ' Article 結構資料', article?.headline, r.title);
    check(path + ' 具體主題關鍵詞', article?.keywords, r.keywords.join(', '));
    check(path + ' 可機讀全文', article?.articleBody.includes(r.content[0].p), true);
    check(path + ' 分享圖', html.includes('property="og:image" content="' + ORIGIN + r.img + '"'), true);
    check(path + ' 允許收錄', res.headers.get('x-robots-tag').startsWith('index, follow'), true);
    const old = await get(w, env, '/blog/' + r.slug);
    check(path + ' 舊連結轉到正確子頁', old.headers.get('location'), ORIGIN + path);
    check(path + ' HEAD 無本文', await (await w.fetch(new Request(ORIGIN + path, {method:'HEAD'}), env)).text(), '');
  }
  check('五個標題互不相同', titles.size, 5);
  check('不收錄 Blog 網址', sitemap.includes('<loc>' + ORIGIN + '/blog'), false);
  check('未知教材為 404', (await get(w, env, '/resource/no-such-lesson')).status, 404);
  const tagged = await get(w, env, '/blog?utm_source=ig');
  check('舊列表連結保留參數', tagged.headers.get('location'), ORIGIN + '/resources?utm_source=ig');
  const extra = {...data[0], slug:'science-auto-test', title:'新增的科普教材'};
  const expanded = INDEX.replace(/(<script id="daily-science-data" type="application\/json">)[\s\S]*?(<\/script>)/,
    (_, before, after) => before + JSON.stringify([...data,extra]) + after);
  const w2 = await fresh();
  check('新增 JSON 教材不必改 worker', (await get(w2, makeEnv(expanded), '/resource/science-auto-test')).status, 200);
  const broken = INDEX.replace(/(<script id="daily-science-data" type="application\/json">)[\s\S]*?(<\/script>)/, '$1not-json$2');
  const w3 = await fresh();
  check('科普 JSON 損毀不影響原教材', (await get(w3, makeEnv(broken), '/resource/mtc-forward')).status, 200);
}

// ---------------------------------------------------------------------------
// 每日排程產出的新欄位：示意圖、動動腦、課堂簡報文案。
// 這些欄位是選填的——舊文章沒有也不能壞，有的文章則要出現在頁面與非 JS 摘要裡。
console.log('\n【每日科普：示意圖、動動腦與課堂簡報文案】');
{
  const w = await fresh(), env = makeEnv();
  const data = JSON.parse(INDEX.match(/<script id="daily-science-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);

  check('樣板有示意圖區塊', INDEX.includes('{{ activeResource.hasDiagram }}'), true);
  check('樣板有動動腦區塊', INDEX.includes('{{ activeResource.hasBrainTeaser }}'), true);
  check('樣板有簡報文案區塊', INDEX.includes('{{ activeResource.hasSlides }}'), true);
  check('簡報文案有複製按鈕', INDEX.includes('onClick="{{ copySlides }}"'), true);
  check('複製文字由 _slidesToText 產生', INDEX.includes('slidesText: this._slidesToText('), true);
  check('downloads 缺漏不會炸', INDEX.includes('hasDownloads: Array.isArray(r.downloads)'), true);

  const withExtras = data.filter(r => r.diagram || r.brainTeaser || r.slides);
  check('至少一篇示範了新欄位', withExtras.length > 0, true);
  for (const r of withExtras) {
    const path = '/resource/' + r.slug;
    const html = await (await get(w, env, path)).text();
    const noJs = html.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const article = schema['@graph'].find(x => x['@type'] === 'Article');
    if (r.diagram) {
      check(path + ' 非 JS 摘要有示意圖', noJs.includes(r.diagram), true);
      check(path + ' 示意圖有圖說', noJs.includes('原理示意圖'), true);
    }
    if (r.brainTeaser) {
      check(path + ' 非 JS 摘要有動動腦', noJs.includes('動動腦'), true);
      check(path + ' 動動腦進入可機讀全文', article.articleBody.includes(r.brainTeaser.split('\n\n')[0]), true);
    }
    if (r.slides) {
      check(path + ' 簡報張數 8-10', r.slides.length >= 8 && r.slides.length <= 10, true);
      check(path + ' 每張最多 4 點', r.slides.every(s => s.bullets.length <= 4), true);
      check(path + ' 每點 20 字內', r.slides.every(s => s.bullets.every(b => b.length <= 20)), true);
      check(path + ' 講稿 50-120 字', r.slides.every(s => s.notes.length >= 50 && s.notes.length <= 120), true);
      check(path + ' 簡報文案不進非 JS 摘要', noJs.includes(r.slides[0].notes), false);
    }
  }

  // 新欄位全缺的文章要照舊運作，排程第一天若漏掉某個欄位不會整頁壞掉
  const bare = { ...data[0], slug: 'science-bare-test' };
  delete bare.diagram; delete bare.diagramCaption; delete bare.brainTeaser;
  delete bare.slides; delete bare.downloads;
  const expanded = INDEX.replace(/(<script id="daily-science-data" type="application\/json">)[\s\S]*?(<\/script>)/,
    (_, before, after) => before + JSON.stringify([...data, bare]) + after);
  const w2 = await fresh();
  const bareRes = await get(w2, makeEnv(expanded), '/resource/science-bare-test');
  const bareHtml = await bareRes.text();
  check('缺新欄位的文章仍 200', bareRes.status, 200);
  check('缺新欄位不會輸出空示意圖', bareHtml.includes('原理示意圖'), false);
}

console.log('\n【降級行為：壞掉時不要把整站弄爛】');
{
  const w = await fresh(), env = makeEnv('<html>壞掉的 index</html>');
  check('index.html 損毀時頁面仍可開', (await get(w, env, '/camp')).status, 200);
  const w2 = await fresh();
  const xml = await (await get(w2, makeEnv('<html>壞了</html>'), '/sitemap.xml')).text();
  check('sitemap 退回靜態檔', xml.includes('<urlset'), true);
  const w3 = await fresh();
  const noLm = await (await get(w3, makeEnv(INDEX, null), '/sitemap.xml')).text();
  check('取不到修改時間就省略 lastmod（不謊報更新）', noLm.includes('<lastmod>'), false);
}

// ---------------------------------------------------------------------------
console.log('\n【轉址】');
{
  const w = await fresh(), env = makeEnv();
  check('/camp/ 去尾斜線', (await get(w, env, '/camp/')).status, 308);
  check('/index.html 導向 /', (await get(w, env, '/index.html')).status, 308);
  const r = await w.fetch(new Request('https://weiyan.pages.dev/camp'), env);
  check('pages.dev 導回正式網域', r.status, 308);

  // 追蹤參數必須原封不動送到頁面，否則日後裝 GA4／投廣告時歸因會靜默失效。
  // 這是刻意的設計選擇，不是漏做——詳見 _worker.js 內 notFound() 前的說明。
  const tracked = await get(w, env, '/camp?utm_source=google&gclid=abc');
  check('帶追蹤參數不觸發轉址', tracked.status, 200);

  const trailing = await get(w, env, '/camp/?utm_source=google&gclid=abc');
  check('去尾斜線時保留追蹤參數',
    trailing.headers.get('location'), ORIGIN + '/camp?utm_source=google&gclid=abc');

  const platform = await w.fetch(
    new Request('https://weiyan.pages.dev/camp?utm_medium=referral&preview=1'), env);
  check('平台網域轉址保留查詢字串',
    platform.headers.get('location'), ORIGIN + '/camp?utm_medium=referral&preview=1');
}

// ---------------------------------------------------------------------------
console.log('\n【前端：舊 hash 網址正規化】');
{
  // 進站時若網址是 /#camp 這種舊格式，改寫成 /camp
  check('有 _normalizeLegacyHash 且進站與 hashchange 都會呼叫',
    (INDEX.match(/this\._normalizeLegacyHash\(/g) || []).length, 2);
  check('舊 hash 會用 replaceState 換成真實路徑',
    INDEX.includes("history.replaceState(null, '', this._pathFor(routeState.route, routeState))"), true);
  // 站內切換必須保留查詢字串，否則歸因參數會在使用者點第一個連結時就消失
  check('站內切換仍帶著 location.search',
    INDEX.includes("this._pathFor(route, extra) + location.search"), true);
  check('殘留的 hash 會被 pushState 清掉',
    INDEX.includes("!location.hash) return;"), true);
}

// ---------------------------------------------------------------------------
console.log('\n【有副檔名但不存在的路徑不可變成 soft 404】');
{
  // 模擬本站 Pages 的行為：找不到的檔案會回退到 SPA 首頁並回 200
  const spaFallback = {
    ASSETS: {
      async fetch(req) {
        const p = new URL(req.url).pathname;
        if (p === '/robots.txt')
          return new Response('User-agent: *', { headers: { 'content-type': 'text/plain' } });
        if (p.startsWith('/photos/'))
          return new Response('bin', { headers: { 'content-type': 'image/webp' } });
        return new Response(INDEX, { headers: { 'content-type': 'text/html' } });
      },
    },
  };
  const w = await fresh();
  check('/nope.html 回 404', (await get(w, spaFallback, '/nope.html')).status, 404);
  check('已移除的驗證檔回 404',
    (await get(w, spaFallback, '/google0532ec45ff7d4c3a.html')).status, 404);
  check('真實圖片仍可取得',
    (await get(w, spaFallback, '/photos/tools/mtc-v2.webp')).status, 200);
  check('robots.txt 仍可取得', (await get(w, spaFallback, '/robots.txt')).status, 200);
}

console.log(`\n通過 ${pass} 項，失敗 ${fail} 項`);
process.exit(fail ? 1 : 0);
