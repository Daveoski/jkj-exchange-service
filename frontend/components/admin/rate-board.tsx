'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {Coins,LoaderCircle,Check,AlertCircle,Eye,EyeOff} from 'lucide-react';
import {api,ApiError} from '@/lib/api';

type Board={is_published:boolean;cny_ngn:number|null;usd_ngn:number|null;note:string;updated_at:string|null;updated_by:string};
type Market={pairs:{base:string;quote:string;rate:number}[]}|null;

const num=(v:string)=>v.trim()===''?null:Number(v);
const fmt=(n:number)=>new Intl.NumberFormat('en-NG',{maximumFractionDigits:2}).format(n);

export function RateBoard({notify,onUnauthorized}:{notify:(m:string)=>void;onUnauthorized:()=>void}){
 const [board,setBoard]=useState<Board|null>(null);
 const [market,setMarket]=useState<Market>(null);
 const [published,setPublished]=useState(false);const [cny,setCny]=useState('');const [usd,setUsd]=useState('');const [note,setNote]=useState('');
 const [saving,setSaving]=useState(false);const [error,setError]=useState('');

 useEffect(()=>{
  api<Board>('/admin/rates').then(b=>{setBoard(b);setPublished(b.is_published);setCny(b.cny_ngn?.toString()??'');setUsd(b.usd_ngn?.toString()??'');setNote(b.note);})
   .catch(e=>{if(e instanceof ApiError&&e.status===401)onUnauthorized();});
  fetch('/api/v1/rates').then(r=>r.ok?r.json():null).then(d=>setMarket(d?.market??null)).catch(()=>{});
 },[onUnauthorized]);

 const ref=(base:string)=>market?.pairs.find(p=>p.base===base&&p.quote==='NGN')?.rate;

 async function save(e:FormEvent){e.preventDefault();setError('');
  const c=num(cny),u=num(usd);
  if((c!==null&&!(c>0))||(u!==null&&!(u>0))){setError('Rates must be positive numbers.');return;}
  setSaving(true);
  try{const b=await api<Board>('/admin/rates',{method:'PUT',body:JSON.stringify({is_published:published,cny_ngn:c,usd_ngn:u,note})});setBoard(b);notify(b.is_published?'Rates published to the website':'Rates saved (not shown on website)');}
  catch(err){if(err instanceof ApiError&&err.status===401)return onUnauthorized();setError(err instanceof Error?err.message:'Could not save rates.');}
  finally{setSaving(false)}
 }

 return <form onSubmit={save} className="mb-9 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
  <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Coins size={20}/></span><div><h2 className="text-xl font-bold text-midnight">Rate board</h2><p className="mt-0.5 text-sm text-slate-500">Publish JKJ's indicative rates in the website's exchange-rate pop-up. Market reference rates are always shown automatically.</p></div></div>
   <button type="button" role="switch" aria-checked={published} onClick={()=>setPublished(p=>!p)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${published?'bg-emerald-50 text-emerald-800 ring-emerald-200':'bg-slate-50 text-slate-600 ring-slate-200'}`}>{published?<Eye size={16}/>:<EyeOff size={16}/>}{published?'Shown on website':'Hidden from website'}</button></div>
  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end">
   <div><label className="field-label" htmlFor="rate-cny">₦ per ¥1 (RMB)</label><input id="rate-cny" inputMode="decimal" className="field tabular-nums" placeholder={ref('CNY')?`Market ≈ ${fmt(ref('CNY')!)}`:'e.g. 215.50'} value={cny} onChange={e=>setCny(e.target.value.replace(/[^\d.]/g,''))}/></div>
   <div><label className="field-label" htmlFor="rate-usd">₦ per $1 (USD)</label><input id="rate-usd" inputMode="decimal" className="field tabular-nums" placeholder={ref('USD')?`Market ≈ ${fmt(ref('USD')!)}`:'e.g. 1,550'} value={usd} onChange={e=>setUsd(e.target.value.replace(/[^\d.]/g,''))}/></div>
   <div className="sm:col-span-2 lg:col-span-1"><label className="field-label" htmlFor="rate-note">Note for customers <span className="font-normal text-slate-400">(optional)</span></label><input id="rate-note" maxLength={240} className="field" placeholder="e.g. Valid today until 5pm. Larger amounts may get better rates." value={note} onChange={e=>setNote(e.target.value)}/></div>
   <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-6 py-3 text-sm font-bold text-white hover:bg-ocean disabled:opacity-50">{saving?<LoaderCircle size={16} className="animate-spin"/>:<Check size={16}/>}Save</button>
  </div>
  {error&&<p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16}/>{error}</p>}
  <p className="mt-3 text-xs text-slate-500">{board?.updated_at?`Last updated ${new Date(board.updated_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} by ${board.updated_by}. `:''}Changes can take up to 5 minutes to appear for visitors.</p>
 </form>;
}
