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
  // 頁面 9（/、tools、resources、projects、steam、about、camp、gallery、join）
  // ＋教具 3 ＋教材 6 = 18
  check('網址數與站台結構一致', locs.length, 18);
  check('沒有重複網址', new Set(locs).size, locs.length);
  // 專案（_rawProjects）不是路由，不可出現在 /resource/ 底下
  check('專案 slug 未被誤判為教材',
    locs.some((l) => l.includes('/resource/nkust-camp')), false);
}

// ---------------------------------------------------------------------------
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
