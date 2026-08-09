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
        if (p === '/robots.txt') return new Response('User-agent: *');
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
  for (const p of ['/', '/camp', '/gallery', '/tool/mtc-v2', '/resource/mtc-forward'])
    check(p, (await get(w, env, p)).status, 200);
  for (const p of ['/totally-bogus', '/tool/nope', '/resource/nope'])
    check(p, (await get(w, env, p)).status, 404);
}

// ---------------------------------------------------------------------------
console.log('\n【每頁有自己的 title 與 canonical（社群分享與收錄靠這個）】');
{
  const w = await fresh(), env = makeEnv();
  const titles = new Set();
  for (const p of ['/', '/camp', '/tool/mtc-v2', '/resource/mtc-forward']) {
    const html = await (await get(w, env, p)).text();
    titles.add((html.match(/<title>(.*?)<\/title>/s) || [])[1]);
    check(`${p} canonical 正確`,
      (html.match(/rel="canonical" href="(.*?)"/) || [])[1], ORIGIN + p);
  }
  check('4 頁的 title 互不相同', titles.size, 4);
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
  check('網址數與站台結構一致', locs.length, 17);
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
}

console.log(`\n通過 ${pass} 項，失敗 ${fail} 項`);
process.exit(fail ? 1 : 0);
