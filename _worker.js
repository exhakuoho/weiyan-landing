const CANONICAL_ORIGIN = 'https://weiyan.designjarvis.com';

const ROUTE_META = {
  '/': {
    title: '高雄 STEAM 科技教育｜機器人・AI・3D 列印課程與營隊｜微研 WEIYAN',
    description: '微研 WEIYAN 以高雄為主要教學現場，與國立高雄科技大學及在地學校合作辦理科技營隊，並提供機器人、AI 程式、3D 列印與工程教育的教材教具及課程資源。',
  },
  '/tools': {
    title: 'STEAM 科技教育教具｜機器人・自走車・3D 列印｜微研 WEIYAN',
    description: '探索微研 WEIYAN 的機器人、MTC V2 智慧自走車、程式設計與 3D 列印科技教育教具，了解學習重點、功能特色與可用教材。',
  },
  '/resources': {
    title: '機器人・AI・3D 列印學習資源與教材｜微研 WEIYAN',
    description: '瀏覽微研 WEIYAN 的機器人、人工智慧、程式設計、3D 列印與工程教育課程教材、程式範例及學習資源。',
  },
  '/courses': {
    title: '常態課程｜積木機器人・AI 自走車・3D 列印・Minecraft｜微研 WEIYAN',
    description: '微研 WEIYAN 的六條常態課程線：積木機器人、AI 自走車、雷切科學課、3D 列印、AI 人形機器人與 Minecraft 科技探索，依年齡分級，從動手實作到程式控制與競賽。',
  },
  '/brick': {
    title: '積木機器人課程｜四階段學習路徑｜微研 WEIYAN',
    description: '從動力機械到程式控制的四階段機器人課程：SPM 動力機械、WeDo 入門程式、SPIKE Prime 程式控制與 VEX IQ 競賽實戰，國小低年級至國中依能力分級。',
  },
  '/minecraft': {
    title: 'Minecraft 科技探索課程｜紅石電路與工程思維｜微研 WEIYAN',
    description: '在 Minecraft 方塊世界裡教紅石電路、機械結構、程式邏輯與工程設計，七個主題世界各有不同的物理限制與任務挑戰。',
  },
  '/laser': {
    title: '雷切科學課｜小怪獸科學群島與 GRID-8 案件簿｜微研 WEIYAN',
    description: '八件雷射切割教具、兩套分齡世界觀：國小 3–4 年級的小怪獸科學群島，與 5–6 年級的 GRID-8 城市科學案件簿，用探究式學習認識平衡、光、電與能源。',
  },
  '/car': {
    title: 'AI 自走車常態班｜八堂課從程式到自動駕駛｜微研 WEIYAN',
    description: '八堂 AI 自走車課程，從馬達控制、感測器、速度量測到條件判斷與 AI 自動駕駛入門。不計分、不比賽，對應 108 課綱，國小中高年級至國中。',
  },
  '/printing': {
    title: '3D 列印課程｜建模、切片到實機列印｜微研 WEIYAN',
    description: '兒童與青少年 3D 列印課程：Tinkercad 建模、切片參數、實機列印與後處理，基礎班與進階班，作品可帶回家。',
  },
  '/humanoid': {
    title: 'AI 人形機器人課程｜體驗課與八堂培訓營｜微研 WEIYAN',
    description: '一小時體驗課帶孩子拆解「AI 的身體」：舵機、關節、自由度與重心；八堂培訓營整合 3D 列印、Arduino 程式與機構組裝，做出會動的機械手臂。',
  },
  '/camp': {
    title: '高雄科技營隊與夏令營｜機器人・AI・3D 列印｜微研 WEIYAN',
    description: '查看微研 WEIYAN 與國立高雄科技大學及在地學校合作辦理的高雄科技營隊、夏令營課程、適合年齡、日期、費用與報名資訊。',
  },
  '/gallery': {
    title: '高雄科技營隊活動相簿｜真實課堂與學習成果｜微研 WEIYAN',
    description: '瀏覽微研 WEIYAN 在高雄辦理的科技營隊、機器人與實作課程真實活動照片、團隊挑戰及學生學習成果。',
  },
  '/projects': {
    title: '高雄科技教育專案實績｜校園課程與營隊合作｜微研 WEIYAN',
    description: '查看微研 WEIYAN 在高雄的校園課程、科技營隊、機器人教育與數位製造工作坊實績，以及與大學和在地學校的合作紀錄。',
  },
  '/steam': {
    title: 'STEAM 教育理念與教學方法｜微研 WEIYAN',
    description: '微研 WEIYAN 的科技教育方法：問題導向學習（PBL）、引導式探究、設計思考、工程設計流程（EDP）、做中學、迭代式設計、運算思維與跨域 STEAM 學習，以及它們如何真正發生在課堂上。',
  },
  '/about': {
    title: '關於微研 WEIYAN｜高雄 STEAM 科技教育團隊',
    description: '認識以高雄為主要教學現場、專注於科學、工程、機器人、AI 與 STEAM 科技教育的微研 WEIYAN 團隊、理念與合作方向。',
  },
  '/join': {
    title: '高雄科技營隊講師招募與課程合作｜微研 WEIYAN',
    description: '與微研 WEIYAN 合作設計高雄科技營隊與 STEAM 課程，或加入營隊講師、內容企劃與影像製作團隊；常態收件。',
  },
};

const PAGE_TYPES = {
  '/tools': 'CollectionPage',
  '/resources': 'CollectionPage',
  '/camp': 'CollectionPage',
  '/gallery': 'CollectionPage',
  '/projects': 'CollectionPage',
  '/courses': 'CollectionPage',
  '/steam': 'WebPage',
  '/about': 'AboutPage',
  '/join': 'WebPage',
};

const NAV_LINKS = [
  ['/', '首頁'],
  ['/tools', '科技教育教具'],
  ['/resources', '學習資源'],
  ['/courses', '常態課程'],
  ['/camp', '科技營隊'],
  ['/gallery', '活動相簿'],
  ['/projects', '專案實績'],
  ['/steam', 'STEAM 教育理念'],
  ['/about', '關於微研'],
  ['/join', '合作與招募'],
];

// 教具與教材的名稱只是 SEO 文案上的美化，實際「有哪些路由存在」一律
// 從 index.html 推導（見 readSite）。這裡的對照表僅供覆寫用，
// 沒列到的 slug 會自動採用 index.html 裡的名稱，不會 404。
const TOOL_NAMES = {
  'mtc-v2': 'MTC V2 智慧自走車',
  'humanoid-robot': '九軸PANDA互動式機器人',
  '3d-printing': '3D 列印與數位製造',
  'micro-injection-molding': '微型射出機',
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

  // 注意：起點要用「定義處」而不是呼叫處。若寫成 '_rawResources()'，會先比對到
  // 前面的 this._rawResources() 呼叫，區塊一路吃到 _rawProjects()，
  // 把 4 筆專案誤判成教材，產生 /resource/nkust-camp 這種不存在的網址。
  const tools = pairs(section(html, 'get tools() {', 'get categories()'),
    /slug: '([a-z0-9-]+)', name: '([^']*)'/g);
  const resources = pairs(section(html, '_rawResources() {', 'get resourceFilters()'),
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
    const lastModified = res.headers.get('last-modified');
    SITE = parseSite(await res.text());
    if (SITE) {
      // lastmod 取自 index.html 的實際修改時間。取不到就不寫這個欄位——
      // 寧可省略，也不要每天填今天的日期去謊報「內容有更新」。
      const d = lastModified ? new Date(lastModified) : null;
      SITE.lastmod = d && !isNaN(d) ? d.toISOString().slice(0, 10) : null;
    }
  } catch {
    SITE = null;
  }
  return SITE;
}

// sitemap 由站台結構直接產生，新增頁面不必再手動維護一份清單。
function sitemapXml(site) {
  const paths = [
    ...site.pages,
    ...Object.keys(site.tools).map((s) => '/tool/' + s),
    ...Object.keys(site.resources).map((s) => '/resource/' + s),
  ];
  const body = paths
    .map((p) => '  <url>\n    <loc>' + CANONICAL_ORIGIN + p + '</loc>' +
      (site.lastmod ? '\n    <lastmod>' + site.lastmod + '</lastmod>' : '') +
      '\n  </url>')
    .join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body + '\n</urlset>\n';
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

function routeLabel(pathname, meta, site) {
  if (pathname === '/') return '首頁';
  const toolMatch = pathname.match(/^\/tool\/([a-z0-9-]+)$/);
  if (toolMatch) return TOOL_NAMES[toolMatch[1]] || site?.tools?.[toolMatch[1]] || meta.title.split('｜')[0];
  const resourceMatch = pathname.match(/^\/resource\/([a-z0-9-]+)$/);
  if (resourceMatch) return RESOURCE_NAMES[resourceMatch[1]] || site?.resources?.[resourceMatch[1]] || meta.title.split('｜')[0];
  return meta.title.split('｜')[0];
}

function breadcrumbData(pathname, label) {
  if (pathname === '/') return null;
  const canonical = CANONICAL_ORIGIN + pathname;
  const items = [{ name: '首頁', url: CANONICAL_ORIGIN + '/' }];
  if (pathname.startsWith('/tool/')) {
    items.push({ name: '科技教育教具', url: CANONICAL_ORIGIN + '/tools' });
  } else if (pathname.startsWith('/resource/')) {
    items.push({ name: '學習資源', url: CANONICAL_ORIGIN + '/resources' });
  }
  items.push({ name: label, url: canonical });
  return {
    '@type': 'BreadcrumbList',
    '@id': canonical + '#breadcrumb',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function structuredData(pathname, meta, site) {
  const canonical = CANONICAL_ORIGIN + (pathname === '/' ? '/' : pathname);
  const organizationId = CANONICAL_ORIGIN + '/#organization';
  const websiteId = CANONICAL_ORIGIN + '/#website';
  const webpageId = canonical + '#webpage';
  const label = routeLabel(pathname, meta, site);
  const graph = [
    {
      '@type': 'EducationalOrganization',
      '@id': organizationId,
      name: '微研 WEIYAN',
      alternateName: ['微研', 'WEIYAN', 'weiyan'],
      url: CANONICAL_ORIGIN + '/',
      logo: {
        '@type': 'ImageObject',
        url: CANONICAL_ORIGIN + '/og-image.png',
        width: 1200,
        height: 630,
      },
      description: '微研 WEIYAN 以高雄為主要教學現場，專注於科學、工程、機器人與 STEAM 科技教育。',
      areaServed: 'TW',
      sameAs: ['https://www.instagram.com/weiyan_aixsteam/'],
      knowsAbout: ['科學教育', '機器人教學', '智慧自走車', '人工智慧', '程式設計', '3D 列印', '工程教育', 'STEAM'],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: CANONICAL_ORIGIN + '/',
      name: '微研 WEIYAN',
      inLanguage: 'zh-Hant-TW',
      publisher: { '@id': organizationId },
    },
  ];

  const breadcrumb = breadcrumbData(pathname, label);
  const page = {
    '@type': PAGE_TYPES[pathname] || (pathname.startsWith('/tool/') || pathname.startsWith('/resource/') ? 'ItemPage' : 'WebPage'),
    '@id': webpageId,
    url: canonical,
    name: meta.title,
    description: meta.description,
    inLanguage: 'zh-Hant-TW',
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    publisher: { '@id': organizationId },
  };
  if (site?.lastmod) page.dateModified = site.lastmod;
  if (breadcrumb) page.breadcrumb = { '@id': breadcrumb['@id'] };

  const isTool = pathname.startsWith('/tool/');
  const isResource = pathname.startsWith('/resource/');
  if (isTool || isResource) {
    const entityId = canonical + '#learning-resource';
    page.mainEntity = { '@id': entityId };
    graph.push({
      '@type': 'LearningResource',
      '@id': entityId,
      url: canonical,
      name: label,
      description: meta.description,
      inLanguage: 'zh-Hant-TW',
      learningResourceType: isTool ? 'STEAM 科技教育教具' : '課程教材與學習資源',
      educationalUse: isTool ? '課堂實作與工程探究' : '課程學習與自主練習',
      provider: { '@id': organizationId },
    });
  } else if (pathname === '/' || pathname === '/about') {
    page.mainEntity = { '@id': organizationId };
  }

  graph.push(page);
  if (breadcrumb) graph.push(breadcrumb);
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
}

function noscriptContent(pathname, meta, site) {
  const canonical = CANONICAL_ORIGIN + (pathname === '/' ? '/' : pathname);
  const label = routeLabel(pathname, meta, site);
  const links = NAV_LINKS.map(([href, text]) =>
    `<a href="${href}">${escapeHtml(text)}</a>`).join(' · ');
  return '<noscript><main aria-label="頁面摘要" style="max-width:960px;margin:32px auto;padding:0 20px;font-family:system-ui,sans-serif;">' +
    `<h1>${escapeHtml(label)}</h1>` +
    `<p>${escapeHtml(meta.description)}</p>` +
    `<p><a href="${canonical}">此頁永久網址</a></p>` +
    `<nav aria-label="網站主要頁面">${links}</nav>` +
    '</main></noscript>';
}

function rewriteHead(html, pathname, meta, site) {
  const canonical = `${CANONICAL_ORIGIN}${pathname === '/' ? '/' : pathname}`;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const schema = structuredData(pathname, meta, site);

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${description}">`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}">`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}">`)
    .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">${schema}</script>`)
    .replace(/(<meta name="robots"[^>]*>)/i, `$1\n<link rel="canonical" href="${canonical}">`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/i, noscriptContent(pathname, meta, site));
}

function redirect(location, status = 308) {
  return new Response(null, { status, headers: { location } });
}

// 刻意不在邊緣剝除 utm_*、gclid、fbclid、_gl 等追蹤參數。
// canonical 已經忽略查詢字串（/camp?gclid=x 的 canonical 就是 /camp），
// 剝除拿不到額外的 SEO 效益；但 308 會發生在頁面載入之前，
// 會讓日後的 GA4／Google Ads／Meta Pixel 永遠讀不到歸因參數，
// 而且失效時完全沒有錯誤訊息。若日後要讓網址看起來乾淨，
// 正確做法是等追蹤碼讀完之後在前端用 history.replaceState 換掉。

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

    if (url.pathname === '/sitemap.xml' && site) {
      return new Response(sitemapXml(site), {
        headers: {
          'content-type': 'application/xml; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        },
      });
    }

    const meta = routeMeta(url.pathname, site);
    if (!meta) {
      if (/\.[a-z0-9]{1,8}$/i.test(url.pathname)) {
        const asset = await env.ASSETS.fetch(request);
        // 本站的 Pages 設定對找不到的檔案會回退到 SPA 首頁並回 200，
        // 例如 /不存在的檔.html 會拿到首頁而不是 404，形成 soft 404。
        // 用 SPA 專屬的標籤辨識這種情況，改回真正的 404。
        if (asset.status === 200 &&
            (asset.headers.get('content-type') || '').includes('text/html')) {
          const body = await asset.text();
          if (body.includes('<x-dc>')) return notFound();
          return new Response(body, { status: 200, headers: asset.headers });
        }
        return asset;
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
      return notFound();
    }

    const assetUrl = new URL('/index.html', url);
    const assetRequest = new Request(assetUrl, { method: 'GET', headers: request.headers });
    const assetResponse = await env.ASSETS.fetch(assetRequest);
    if (!assetResponse.ok) return assetResponse;

    const html = rewriteHead(await assetResponse.text(), url.pathname, meta, site);
    const headers = new Headers(assetResponse.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('content-language', 'zh-Hant-TW');
    headers.set('link', `<${CANONICAL_ORIGIN}${url.pathname === '/' ? '/' : url.pathname}>; rel="canonical"`);
    headers.set('x-robots-tag', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    return new Response(request.method === 'HEAD' ? null : html, {
      status: 200,
      headers,
    });
  },
};
