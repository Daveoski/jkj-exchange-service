import { ArrowUpRight,Banknote,ShieldCheck,Globe2,Ship } from 'lucide-react';
export function TradeVisual(){return <div className="relative mx-auto w-full max-w-[550px]">
 <div className="absolute -right-4 -top-4 hidden h-28 w-28 animate-drift rounded-full border border-gold/25 lg:block"/><div className="absolute -bottom-6 -left-7 hidden h-32 w-32 rounded-full border border-teal/20 lg:block"/>
 <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-white/[.065] p-6 shadow-[0_28px_80px_rgba(0,0,0,.25)] backdrop-blur-lg md:p-7">
  <div className="mb-6 flex items-center justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[.22em] text-gold">JKJ · International trade</div><p className="mt-2 font-display text-2xl text-white">Your business, connected.</p></div><span className="rounded-2xl bg-teal/15 p-3 text-teal"><Globe2 size={28}/></span></div>
  <div className="relative rounded-2xl border border-white/10 bg-midnight/65 px-3 py-5">
   <svg viewBox="0 0 460 192" className="w-full" role="img" aria-label="Illustrative trade route between Nigeria and China">
    <defs><linearGradient id="routeGrad" x1="0" x2="1"><stop offset="0" stopColor="#17aa95"/><stop offset="1" stopColor="#e6b35e"/></linearGradient></defs>
    <g stroke="#446077" strokeWidth=".5" opacity=".55"><path d="M21 57 l17 -25 28 5 8 20 24 -15 18 12 -3 22 -16 12 -22 1 -3 20 -16 11 -29 -19z M98 114 l29 -13 36 13 18 28 -16 37 -29 10 -15 -32z M197 46 l30 -17 25 13 38 -17 47 8 22 16 -19 25 16 11 -22 36 -43 -5 -27 -25 -28 7 -20 -20z M244 127 l22 -10 23 5 13 25 -18 31 -22 -9z M348 126 l27 -6 30 13 -2 24 -21 14 -24 -11z" fill="#182e43"/></g>
    <path d="M92 136 Q208 1 350 84" fill="none" stroke="#e6b35e" strokeOpacity=".14" strokeWidth="9" strokeLinecap="round"/>
    <path d="M92 136 Q208 1 350 84" fill="none" stroke="url(#routeGrad)" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="420" className="animate-draw"/>
    <circle r="4" fill="#fff"><animateMotion dur="4.2s" repeatCount="indefinite" path="M92 136 Q208 1 350 84" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1"/></circle>
    <circle cx="92" cy="136" r="8" fill="#18ab99"/><circle cx="92" cy="136" r="15" fill="none" stroke="#18ab99" opacity=".4"/><circle cx="350" cy="84" r="8" fill="#e6b35e"/><circle cx="350" cy="84" r="15" fill="none" stroke="#e6b35e" opacity=".45"/>
    <text x="37" y="163" fill="#dce5ea" fontSize="15" fontWeight="bold">NIGERIA</text><text x="348" y="64" fill="#e6b35e" fontSize="15" fontWeight="bold">CHINA</text>
   </svg>
   <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-xs text-slate-400">Business currency</p><p className="mt-1 text-lg font-bold text-white">NGN / USD</p></div><div className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-xs text-slate-400">Supplier currency</p><p className="mt-1 text-lg font-bold text-white">CNY (RMB)</p></div></div>
  </div>
  <div className="mt-4 grid grid-cols-2 gap-3"><div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-xs font-semibold text-white"><span className="rounded-lg bg-teal/15 p-2 text-teal"><ShieldCheck size={20}/></span> Quote first</div><div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-xs font-semibold text-white"><span className="rounded-lg bg-gold/15 p-2 text-gold"><Ship size={20}/></span> Supplier focus</div></div>
 </div>
 <div className="floatish absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-bold text-ink shadow-soft sm:flex"><Banknote className="text-teal" size={19}/> RMB & USD enquiries <ArrowUpRight size={16}/></div>
 </div>}
