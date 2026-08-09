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

function routeMeta(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  const toolMatch = pathname.match(/^\/tool\/([a-z0-9-]+)$/);
  if (toolMatch && TOOL_NAMES[toolMatch[1]]) {
    const name = TOOL_NAMES[toolMatch[1]];
    return {
      title: `${name}｜科技教育教具｜微研 WEIYAN`,
      description: `了解微研 WEIYAN 的${name}教具、學習重點、功能特色與可用資源。`,
    };
  }

  const resourceMatch = pathname.match(/^\/resource\/([a-z0-9-]+)$/);
  if (resourceMatch && RESOURCE_NAMES[resourceMatch[1]]) {
    const name = RESOURCE_NAMES[resourceMatch[1]];
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

    const meta = routeMeta(url.pathname);
    if (!meta) {
      if (/\.[a-z0-9]{1,8}$/i.test(url.pathname)) {
        return env.ASSETS.fetch(request);
      }
      // 無副檔名也可能是真實靜態檔：Cloudflare Pages 會把 /foo.html 這類檔案
      // 對外供應在 /foo，並把 /foo.html 308 轉到 /foo。若這裡直接回 404，
      // Google Search Console 的 googlexxxx.html 驗證檔會被擋死。
      const asset = await env.ASSETS.fetch(request);
      if (asset.status === 200) return asset;
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
