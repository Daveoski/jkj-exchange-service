'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {X,TrendingUp,TrendingDown,Minus,ArrowRight,MessageCircle,BadgeCheck,RefreshCw} from 'lucide-react';
import {whatsappLink} from '@/lib/constants';

type Pair={base:string;quote:string;rate:number;change_pct:number|null};
type RatesData={market:{as_of:string;source:string;pairs:Pair[];fetched_at:string}|null;jkj:{cny_ngn:number|null;usd_ngn:number|null;note:string;updated_at:string|null}|null};

const SYMBOL:Record<string,string>={USD:'$',CNY:'¥',NGN:'₦',GBP:'£',EUR:'€'};
const NAME:Record<string,string>={USD:'US dollar',CNY:'Chinese yuan (RMB)',GBP:'British pound',EUR:'Euro'};
const SEEN_KEY='jkj-rates-seen';
const fmt=(n:number,max=2)=>new Intl.NumberFormat('en-NG',{minimumFractionDigits:2,maximumFractionDigits:max}).format(n);
const rateFmt=(n:number)=>fmt(n,n<20?4:2);

function Change({pct}:{pct:number|null}){
 if(pct==null)return null;
 const Icon=pct>0?TrendingUp:pct<0?TrendingDown:Minus;
 const cls=pct>0?'text-emerald-600':pct<0?'text-red-600':'text-slate-400';
 return <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums ${cls}`} title="Change vs previous day"><Icon size={12}/>{pct>0?'+':''}{pct.toFixed(2)}%</span>;
}

export function RatesPopup(){
 const [data,setData]=useState<RatesData|null>(null);
 const [failed,setFailed]=useState(false);
 const [open,setOpen]=useState(false);
 const [amount,setAmount]=useState('1000');
 const [currency,setCurrency]=useState('CNY');
 const panel=useRef<HTMLDivElement>(null);

 async function load(){setFailed(false);try{const r=await fetch('/api/v1/rates');if(!r.ok)throw 0;setData(await r.json());}catch{setFailed(true)}}
 useEffect(()=>{void load()},[]);
 useEffect(()=>{
  let seen=false;try{seen=!!sessionStorage.getItem(SEEN_KEY)}catch{}
  if(seen)return;
  const t=setTimeout(()=>{setOpen(true);try{sessionStorage.setItem(SEEN_KEY,'1')}catch{}},4000);
  return()=>clearTimeout(t);
 },[]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open]);

 const pairs=data?.market?.pairs??[];
 const jkj=data?.jkj;
 const toNgn=(code:string)=>{
  if(code==='CNY'&&jkj?.cny_ngn)return {rate:jkj.cny_ngn,jkj:true};
  if(code==='USD'&&jkj?.usd_ngn)return {rate:jkj.usd_ngn,jkj:true};
  const p=pairs.find(x=>x.base===code&&x.quote==='NGN');return p?{rate:p.rate,jkj:false}:null;
 };
 const headline=toNgn('USD');
 const conv=toNgn(currency);const amt=Number(amount);
 const asOf=data?.market?.as_of?new Date(data.market.as_of+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):null;

 function toggle(){setOpen(o=>!o);try{sessionStorage.setItem(SEEN_KEY,'1')}catch{};setTimeout(()=>panel.current?.focus(),0);}

 if(failed&&!data)return null;

 return <div className="print:hidden">
  {!open&&<button onClick={toggle} aria-expanded={false} aria-controls="rates-panel" className="animate-fade-up fixed bottom-5 left-4 z-40 flex items-center gap-2.5 rounded-full border border-white/10 bg-midnight py-2 pl-2 pr-4 text-left text-white shadow-lift transition hover:-translate-y-0.5 sm:left-5">
   <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-base font-black text-midnight">₦</span>
   <span className="leading-tight"><span className="block text-[10px] font-bold uppercase tracking-[.16em] text-gold">Rates today</span><span className="block text-sm font-bold tabular-nums">{headline?<>$1 = ₦{fmt(headline.rate)}</>:'Loading…'}</span></span>
  </button>}
  {open&&<div id="rates-panel" ref={panel} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby="rates-title" className="animate-fade-up fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-lift outline-none sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[390px]">
   <div className="relative overflow-hidden rounded-t-[24px] bg-midnight px-5 pb-5 pt-5 text-white">
    <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-white/5"/>
    <div className="relative flex items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-gold"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60"/><span className="relative h-2 w-2 rounded-full bg-gold"/></span>Exchange rate update</p><h2 id="rates-title" className="mt-2 font-display text-2xl">Today's rates</h2>{asOf&&<p className="mt-0.5 text-xs text-slate-400">Market reference as of {asOf}</p>}</div><button onClick={()=>setOpen(false)} aria-label="Close exchange rates" className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><X size={19}/></button></div>
   </div>
   <div className="space-y-4 p-5">
    {jkj&&<div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-amber-800"><BadgeCheck size={14}/> JKJ indicative rates</p><div className="mt-3 grid grid-cols-2 gap-3">{jkj.cny_ngn&&<div><p className="text-xs text-slate-500">¥1 RMB</p><p className="text-xl font-extrabold tabular-nums text-midnight">₦{fmt(jkj.cny_ngn)}</p></div>}{jkj.usd_ngn&&<div><p className="text-xs text-slate-500">$1 USD</p><p className="text-xl font-extrabold tabular-nums text-midnight">₦{fmt(jkj.usd_ngn)}</p></div>}</div>{jkj.note&&<p className="mt-2 text-xs leading-5 text-amber-900">{jkj.note}</p>}{jkj.updated_at&&<p className="mt-1 text-[11px] text-slate-500">Updated {new Date(jkj.updated_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>}</div>}
    {pairs.length>0?<div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Market reference (mid-market)</p><ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">{pairs.map(p=><li key={p.base+p.quote} className="flex items-center gap-3 px-4 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-midnight">{SYMBOL[p.base]}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-midnight">{p.base} → {p.quote}</span><span className="block truncate text-[11px] text-slate-400">{NAME[p.base]}</span></span><span className="text-right"><span className="block text-sm font-extrabold tabular-nums text-midnight">{SYMBOL[p.quote]}{rateFmt(p.rate)}</span><Change pct={p.change_pct}/></span></li>)}</ul></div>
     :!jkj&&<div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin"/> Loading rates…</div>}
    {(pairs.length>0||jkj)&&<div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Quick estimate</p><div className="mt-2 flex gap-2"><label className="sr-only" htmlFor="rates-amount">Amount</label><input id="rates-amount" inputMode="decimal" className="field !py-2.5 tabular-nums" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^\d.]/g,''))}/><label className="sr-only" htmlFor="rates-currency">Currency</label><select id="rates-currency" className="field !w-28 !py-2.5" value={currency} onChange={e=>setCurrency(e.target.value)}>{['CNY','USD','GBP','EUR'].filter(c=>toNgn(c)).map(c=><option key={c} value={c}>{c}</option>)}</select></div>{conv&&amt>0&&<p className="mt-3 text-sm text-slate-600">≈ <strong className="text-lg tabular-nums text-midnight">₦{fmt(amt*conv.rate)}</strong> <span className="text-xs text-slate-400">({conv.jkj?'JKJ indicative':'market'} rate)</span></p>}</div>}
    <p className="text-[11px] leading-5 text-slate-500">For information only — not an offer or a guaranteed rate. JKJ confirms the actual rate, fees and terms with you before any transaction.{data?.market&&<> Market data: {data.market.source}.</>}</p>
    <div className="flex gap-2"><Link href="/request-quote" onClick={()=>setOpen(false)} className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-bold text-white hover:bg-ocean">Get a firm quote <ArrowRight size={16} className="transition group-hover:translate-x-0.5"/></Link><a href={whatsappLink("Hello JKJ, what's your exchange rate today for my supplier payment?")} target="_blank" rel="noopener noreferrer" aria-label="Ask about today's rate on WhatsApp" className="inline-flex items-center justify-center rounded-full bg-green-600 px-4 text-white hover:bg-green-700"><MessageCircle size={18}/></a></div>
   </div>
  </div>}
 </div>;
}
