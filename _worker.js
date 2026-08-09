const CANONICAL_ORIGIN = 'https://weiyan.designjarvis.com';

const ROUTE_META = {
  '/': {
    title: '微研 WEIYAN｜營隊專家｜科學・工程・機器人科技教育｜營隊與教材教具',
    description: '微研 WEIYAN 是營隊專家，與國立高雄科技大學及在地學校合作辦理科技營隊，並提供機器人、人工智慧與程式、3D 列印、工程結構等教材教具與課程資源。',
  },
  '/tools': {
    title: '科技教育教具｜微研 WEIYAN',
    description: '探索微研 WEIYAN 的機器人、自走車、程式設計與 3D 列印科技教育教具。',
  },
  '/resources': {
    title: '科學與工程學習資源｜微研 WEIYAN',
    description: '機器人、人工智慧、程式設計、3D 列印與工程教育的課程教材與學習資源。',
  },
  '/camp': {
    title: '科技營隊與報名｜微研 WEIYAN 營隊專家',
    description: '查看微研 WEIYAN 與國立高雄科技大學及在地學校合作辦理的科技營隊、課程內容、日期與報名資訊。',
  },
  '/gallery': {
    title: '科技營隊活動相簿｜微研 WEIYAN',
    description: '瀏覽微研 WEIYAN 科技營隊與實作課程的真實活動照片及學習成果。',
  },
  '/projects': {
    title: '科技教育專案實績｜微研 WEIYAN',
    description: '微研 WEIYAN 的校園課程、科技營隊、機器人教育與數位製造工作坊實績。',
  },
  '/about': {
    title: '關於微研 WEIYAN｜科學與科技教育團隊',
    description: '認識專注於科學、工程、機器人與科技教育的微研 WEIYAN。',
  },
  '/join': {
    title: '合作與人才招募｜微研 WEIYAN',
    description: '與微研 WEIYAN 合作設計科技營隊與課程，或加入講師、內容與影像製作團隊。',
  },
};

// 教具與教材的名稱只是 SEO 文案上的美化，實際「有哪些路由存在」一律
// 從 index.html 推導（見 readSite）。這裡的對照表僅供覆寫用，
// 沒列到的 slug 會自動採用 index.html 裡的名稱，不會 404。
const TOOL_NAMES = {
  'mtc-v2': 'MTC V2 智慧自走車',
  'humanoid-robot': '人形機器人',
  '3d-printing': '3D 列印與數位製造',
};

const RESOURCE_NAMES = {
  'mtc-forward': 'MTC V2 自走車前進控制',
  'mtc-sensor': 'MTC V2 感測器應用',
  'humanoid-basic': '人形機器人基礎控制',
  'ai-intro': '人工智慧入門',
  '3d-first-model': '第一個 3D 模型',
  'eng-structure': '工程結構與穩定',
};

// ---------------------------------------------------------------------------
// 站台結構一律從 index.html 推導，避免「新增頁面卻忘了改 worker → 404」。
// 每個 deployment 的 isolate 只解析一次；重新部署會換新 isolate，不會讀到舊的。
// ---------------------------------------------------------------------------
let SITE = null;

function section(html, from, to) {
  const a = html.indexOf(from);
  if (a < 0) return '';
  const b = html.indexOf(to, a + from.length);
  return b > a ? html.slice(a, b) : html.slice(a);
}

function pairs(text, re) {
  const out = {};
  for (const m of text.matchAll(re)) out[m[1]] = m[2];
  return out;
}

function parseSite(html) {
  // routeNames 是 app 自己的路由清單，新增頁面本來就得寫進去，等於零額外維護。
  const names = section(html, 'get routeNames()', '}')
    .match(/'([a-z]+)'/g) || [];
  const pages = new Set(['/']);
  for (const raw of names) {
    const n = raw.slice(1, -1);
    if (n !== 'home' && n !== 'tool' && n !== 'resource') pages.add('/' + n);
  }

  const tools = pairs(section(html, 'get tools()', 'get categories()'),
    /slug: '([a-z0-9-]+)', name: '([^']*)'/g);
  const resources = pairs(section(html, '_rawResources()', 'get resourceFilters()'),
    /slug: '([a-z0-9-]+)', title: '([^']*)'/g);

  // 解析結果明顯不合理時視為失敗，交由呼叫端退回寬鬆模式（寧可不擋，也不要整站 404）
  const ok = pages.size > 1 && Object.keys(tools).length > 0;
  return ok ? { pages, tools, resources } : null;
}

async function readSite(env, url) {
  if (SITE !== null) return SITE;
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/index.html', url)));
    if (!res.ok) return null;
    SITE = parseSite(await res.text());
  } catch {
    SITE = null;
  }
  return SITE;
}

function routeMeta(pathname, site) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  if (!site) return null;

  if (site.pages.has(pathname)) {
    // 新頁面尚未在 ROUTE_META 寫專屬文案時，先給一組通用的，至少不會 404
    const label = pathname.slice(1);
    return {
      title: `${label}｜微研 WEIYAN`,
      description: ROUTE_META['/'].description,
    };
  }

  const toolMatch = pathname.match(/^\/tool\/([a-z0-9-]+)$/);
  if (toolMatch && site.tools[toolMatch[1]]) {
    const name = TOOL_NAMES[toolMatch[1]] || site.tools[toolMatch[1]];
    return {
      title: `${name}｜科技教育教具｜微研 WEIYAN`,
      description: `了解微研 WEIYAN 的${name}教具、學習重點、功能特色與可用資源。`,
    };
  }

  const resourceMatch = pathname.match(/^\/resource\/([a-z0-9-]+)$/);
  if (resourceMatch && site.resources[resourceMatch[1]]) {
    const name = RESOURCE_NAMES[resourceMatch[1]] || site.resources[resourceMatch[1]];
    return {
      title: `${name}｜學習資源｜微研 WEIYAN`,
      description: `查看微研 WEIYAN 的${name}課程內容、學習目標與教材資源。`,
    };
  }

  return null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function rewriteHead(html, pathname, meta) {
  const canonical = `${CANONICAL_ORIGIN}${pathname === '/' ? '/' : pathname}`;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${description}">`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}">`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}">`)
    .replace(/(<meta name="robots"[^>]*>)/i, `$1\n<link rel="canonical" href="${canonical}">`);
}

function redirect(location, status = 308) {
  return new Response(null, { status, headers: { location } });
}

function notFound() {
  return new Response(
    '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>找不到頁面｜微研 WEIYAN</title></head><body><main><h1>找不到這個頁面</h1><p><a href="/">回到微研 WEIYAN 首頁</a></p></main></body></html>',
    { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'weiyan.pages.dev') {
      return redirect(`${CANONICAL_ORIGIN}${url.pathname}${url.search}`);
    }

    if (url.hostname === 'weiyan-camp.designjarvis.com') {
      return redirect(`${CANONICAL_ORIGIN}/camp${url.search}`);
    }

    if (url.pathname === '/index.html') {
      return redirect(`${url.origin}/${url.search}`);
    }

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      return redirect(`${url.origin}${url.pathname.slice(0, -1)}${url.search}`);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return env.ASSETS.fetch(request);
    }

    const site = await readSite(env, url);
    const meta = routeMeta(url.pathname, site);
    if (!meta) {
      if (/\.[a-z0-9]{1,8}$/i.test(url.pathname)) {
        return env.ASSETS.fetch(request);
      }
      // 解析 index.html 失敗時不判定 404：寧可放行讓 SPA 自己處理，
      // 也不要因為 worker 讀不到站台結構就把整站打成 404。
      if (!site) {
        const fallback = await env.ASSETS.fetch(
          new Request(new URL('/index.html', url), { headers: request.headers }));
        if (fallback.ok) return new Response(await fallback.text(), {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        });
      }
      // Cloudflare Pages 把 /foo.html 供應在 /foo，並將 /foo.html 308 轉到 /foo。
      // Google Search Console 的驗證檔就是這種形狀，必須放行，否則驗證會 404。
      // 這裡限定驗證檔的命名樣式，不做通用的 ASSETS 回退——因為本站的
      // Pages 設定對任何未知路徑都會回退到 SPA 首頁並回 200，
      // 通用回退會讓所有錯誤網址變成 soft 404。
      if (/^\/google[0-9a-f]{8,32}$/i.test(url.pathname)) {
        return env.ASSETS.fetch(request);
      }
      return notFound();
    }

    const assetUrl = new URL('/index.html', url);
    const assetRequest = new Request(assetUrl, { method: 'GET', headers: request.headers });
    const assetResponse = await env.ASSETS.fetch(assetRequest);
    if (!assetResponse.ok) return assetResponse;

    const html = rewriteHead(await assetResponse.text(), url.pathname, meta);
    const headers = new Headers(assetResponse.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('link', `<${CANONICAL_ORIGIN}${url.pathname === '/' ? '/' : url.pathname}>; rel="canonical"`);

    return new Response(request.method === 'HEAD' ? null : html, {
      status: 200,
      headers,
    });
  },
};
