import {qrSvg} from '@/lib/qr';
export const dynamic='force-static';
export function GET(){
 return new Response(qrSvg(),{headers:{'Content-Type':'image/svg+xml','Content-Disposition':'inline; filename="jkj-exchange-website-qr.svg"','Cache-Control':'public, max-age=86400'}});
}
