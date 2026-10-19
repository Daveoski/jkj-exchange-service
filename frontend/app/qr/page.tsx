import {Download,Camera,FileImage,Megaphone,ReceiptText,Store,Smartphone} from 'lucide-react';
import {PublicShell} from '@/components/public-shell';
import {QrCode} from '@/components/qr-code';
import {PrintButton} from '@/components/print-button';
import {SITE_URL} from '@/lib/constants';
export const metadata={title:'Scan to Visit — QR Code',description:'Scan the JKJ Exchange Services QR code with any phone camera to open our website instantly. Download it for flyers, signage and invoices.',alternates:{canonical:'/qr'}};
const host=SITE_URL.replace(/^https?:\/\//,'');
export default function QrPage(){return <PublicShell>
 <section className="px-5 py-14 md:px-8 md:py-20 print:py-0"><div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
  <div className="mx-auto w-full max-w-md print:max-w-none">
   <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 print:border-0 print:shadow-none">
    <div className="mb-5 flex items-center justify-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-lg font-black tracking-tighter text-midnight">JKJ</span><span className="leading-tight"><span className="block text-base font-extrabold tracking-wide text-midnight">JKJ <span className="text-amber-600">EXCHANGE</span></span><span className="block text-[10px] font-semibold tracking-[.3em] text-slate-500">SERVICES</span></span></div>
    <QrCode className="mx-auto w-full" label={`QR code that opens ${host}`}/>
    <p className="mt-5 text-center text-lg font-bold text-midnight">Scan to visit our website</p>
    <p className="mt-1 text-center text-sm text-slate-500">{host}</p>
   </div>
  </div>
  <div className="print:hidden">
   <p className="eyebrow">SCAN · SHARE · CONNECT</p>
   <h1 className="section-title mt-4">Open our website in one scan.</h1>
   <p className="mt-5 max-w-xl leading-8 text-slate-600">Point any smartphone camera at the code and tap the link that appears — no app needed. It takes customers straight to <strong className="text-midnight">{host}</strong>, where they can request a quote or reach us on WhatsApp.</p>
   <ol className="mt-8 space-y-4">{[{icon:Smartphone,t:'Open your phone camera',d:'On most Android phones and iPhones the regular camera app reads QR codes automatically.'},{icon:Camera,t:'Point it at the code',d:'Hold steady for a second until a link banner appears.'},{icon:Store,t:'Tap the link',d:'Our website opens immediately in your browser.'}].map((s,i)=><li key={s.t} className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><s.icon size={20}/></span><span><strong className="block text-midnight">{i+1}. {s.t}</strong><span className="text-sm leading-6 text-slate-600">{s.d}</span></span></li>)}</ol>
   <div className="mt-9 flex flex-wrap gap-3"><a href="/qr.png" download="jkj-exchange-website-qr.png" className="inline-flex items-center gap-2 rounded-full bg-midnight px-6 py-3.5 text-sm font-bold text-white hover:bg-ocean"><Download size={17}/> Download PNG</a><a href="/qr.svg" download="jkj-exchange-website-qr.svg" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3.5 text-sm font-bold text-midnight hover:border-gold"><FileImage size={17}/> Download SVG (for printers)</a><PrintButton className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3.5 text-sm font-bold text-midnight hover:border-gold"/></div>
   <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Great places to use it</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{[{icon:Megaphone,t:'Flyers & posters'},{icon:ReceiptText,t:'Invoices & receipts'},{icon:Store,t:'Shop & market signage'}].map(x=><div key={x.t} className="flex items-center gap-2 text-sm font-semibold text-midnight"><x.icon size={17} className="text-teal"/>{x.t}</div>)}</div><p className="mt-4 text-xs leading-5 text-slate-500">Tip: print at least 3 cm × 3 cm, on a plain light background, for reliable scanning.</p></div>
  </div>
 </div></section>
</PublicShell>}
