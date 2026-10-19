import {Download,Camera,FileImage,Megaphone,ReceiptText,Store,Smartphone} from 'lucide-react';
import {PublicShell} from '@/components/public-shell';
import {QrCode} from '@/components/qr-code';
import {PrintButton} from '@/components/print-button';
import Image from 'next/image';
import {SITE_URL,TAGLINE} from '@/lib/constants';
export const metadata={title:'Scan to Visit — QR Code',description:'Scan the JKJ Exchange Services QR code with any phone camera to open our website instantly. Download it for flyers, signage and invoices.',alternates:{canonical:'/qr'}};
const host=SITE_URL.replace(/^https?:\/\//,'');
export default function QrPage(){return <PublicShell>
 <section className="px-5 py-14 md:px-8 md:py-20 print:py-0"><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
  <div className="mx-auto w-full max-w-md print:max-w-none">
   <div className="rounded-[32px] border border-line bg-surface p-6 shadow-soft sm:p-8 print:border-0 print:bg-white print:shadow-none">
    <div className="mb-5 flex flex-col items-center text-center"><Image src="/brand/jkj-emblem.png" alt="" width={514} height={384} className="h-20 w-auto dark:hidden print:!block"/><Image src="/brand/jkj-emblem-dark.png" alt="" width={514} height={384} className="hidden h-20 w-auto dark:block print:!hidden"/><span className="mt-3 font-brand text-lg font-bold tracking-[.06em] text-fg print:text-black">JKJ <span className="brand-gold">EXCHANGE</span> SERVICES</span><span className="mt-1 font-brand text-[10px] font-semibold tracking-[.22em] text-accent">{TAGLINE.toUpperCase()}</span></div>
    <QrCode className="mx-auto w-full" label={`QR code that opens ${host}`}/>
    <p className="mt-5 text-center text-lg font-bold text-fg">Scan to visit our website</p>
    <p className="mt-1 text-center text-sm text-muted">{host}</p>
   </div>
  </div>
  <div className="print:hidden">
   <p className="eyebrow">SCAN · SHARE · CONNECT</p>
   <h1 className="section-title mt-4">Open our website in one scan.</h1>
   <p className="mt-5 max-w-xl leading-8 text-muted">Point any smartphone camera at the code and tap the link that appears — no app needed. It takes customers straight to <strong className="text-fg">{host}</strong>, where they can request a quote or reach us on WhatsApp.</p>
   <ol className="mt-8 space-y-4">{[{icon:Smartphone,t:'Open your phone camera',d:'On most Android phones and iPhones the regular camera app reads QR codes automatically.'},{icon:Camera,t:'Point it at the code',d:'Hold steady for a second until a link banner appears.'},{icon:Store,t:'Tap the link',d:'Our website opens immediately in your browser.'}].map((s,i)=><li key={s.t} className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><s.icon size={20}/></span><span><strong className="block text-fg">{i+1}. {s.t}</strong><span className="text-sm leading-6 text-muted">{s.d}</span></span></li>)}</ol>
   <div className="mt-9 flex flex-wrap gap-3"><a href="/qr.png" download="jkj-exchange-website-qr.png" className="inline-flex items-center gap-2 rounded-full bg-contrast px-6 py-3.5 text-sm font-bold text-on-contrast hover:bg-contrast-hover"><Download size={17}/> Download PNG</a><a href="/qr.svg" download="jkj-exchange-website-qr.svg" className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 text-sm font-bold text-fg hover:border-gold"><FileImage size={17}/> Download SVG (for printers)</a><PrintButton className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 text-sm font-bold text-fg hover:border-gold"/></div>
   <div className="mt-10 rounded-2xl border border-line bg-surface p-6"><p className="text-xs font-bold uppercase tracking-wider text-muted">Great places to use it</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{[{icon:Megaphone,t:'Flyers & posters'},{icon:ReceiptText,t:'Invoices & receipts'},{icon:Store,t:'Shop & market signage'}].map(x=><div key={x.t} className="flex items-center gap-2 text-sm font-semibold text-fg"><x.icon size={17} className="text-teal"/>{x.t}</div>)}</div><p className="mt-4 text-xs leading-5 text-muted">Tip: print at least 3 cm × 3 cm, on a plain light background, for reliable scanning.</p></div>
  </div>
 </div></section>
</PublicShell>}
