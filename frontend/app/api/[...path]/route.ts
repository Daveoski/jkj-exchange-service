import type { NextRequest } from 'next/server';

// Same-origin proxy to the FastAPI backend. Keeping the API on the website's own domain
// means the admin session cookie is first-party and no browser CORS is involved.
// The visitor's IP is forwarded with a shared secret so the backend can rate-limit fairly.

export const dynamic = 'force-dynamic';

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
const FORWARD_REQUEST = ['accept', 'authorization', 'content-type', 'cookie', 'user-agent', 'x-jkj-request'];
const DROP_RESPONSE = new Set(['connection', 'content-encoding', 'content-length', 'keep-alive', 'set-cookie', 'transfer-encoding']);

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${BACKEND}/api/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (process.env.PROXY_SECRET && ip) {
    headers.set('x-jkj-proxy-secret', process.env.PROXY_SECRET);
    headers.set('x-jkj-client-ip', ip);
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch {
    return Response.json({ detail: 'Our servers are temporarily unreachable. Please try again shortly.' }, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, name) => {
    if (!DROP_RESPONSE.has(name)) responseHeaders.set(name, value);
  });
  for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append('set-cookie', cookie);

  return new Response(upstream.status === 204 ? null : upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
