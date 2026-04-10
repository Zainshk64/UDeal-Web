import { NextRequest, NextResponse } from 'next/server';

/** Same-origin proxy so client can read image bytes without CORS (e.g. edit-ad re-upload). */
const ALLOWED_HOST = /^(?:https?:\/\/)?(?:www\.)?udealzone\.com\//i;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  let target: string;
  try {
    target = decodeURIComponent(raw);
  } catch {
    return NextResponse.json({ error: 'Bad url' }, { status: 400 });
  }
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }
  if (!ALLOWED_HOST.test(target)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  const res = await fetch(target, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: 'Upstream failed' }, { status: 502 });
  }
  const blob = await res.blob();
  const ct = res.headers.get('content-type') || 'image/jpeg';
  return new NextResponse(blob, {
    headers: {
      'Content-Type': ct,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
