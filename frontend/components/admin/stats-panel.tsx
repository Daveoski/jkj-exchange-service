import {Inbox,Sparkles,Clock3,CheckCircle2,TrendingUp} from 'lucide-react';
import type {Stats} from '@/lib/api';
import {SERVICE_LABELS} from '@/lib/constants';

function ActivityChart({daily}:{daily:Stats['daily']}){
 const max=Math.max(1,...daily.map(d=>d.count));
 return <div className="flex h-24 items-end gap-[3px]" role="img" aria-label={`Enquiries per day over the last 30 days, peak ${max}`}>
  {daily.map(d=><div key={d.date} className="group relative flex-1">
   <div className={`w-full rounded-t-[3px] transition-colors ${d.count?'bg-gold group-hover:bg-amber-500':'bg-white/10'}`} style={{height:`${Math.max(4,(d.count/max)*88)}px`}}/>
   <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[11px] font-bold text-midnight shadow group-hover:block">{new Date(d.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}: {d.count}</span>
  </div>)}
 </div>;
}

export function StatsPanel({stats,loading}:{stats:Stats|null;loading:boolean}){
 const s=stats?.by_status??{};
 const cards=[
  {label:'Total enquiries',value:stats?.total,icon:Inbox,tone:'text-amber-700 bg-amber-50'},
  {label:'New — awaiting reply',value:s.new,icon:Sparkles,tone:'text-amber-700 bg-amber-50'},
  {label:'Active conversations',value:stats?(s.contacted??0)+(s.in_progress??0):undefined,icon:Clock3,tone:'text-violet-700 bg-violet-50'},
  {label:'Completed',value:s.completed,icon:CheckCircle2,tone:'text-emerald-700 bg-emerald-50'},
 ];
 const services=Object.entries(stats?.by_service??{}).sort((a,b)=>b[1]-a[1]);
 const serviceMax=Math.max(1,...services.map(([,v])=>v));
 return <div className="mb-9 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
  <div className="grid gap-4 sm:grid-cols-2">{cards.map(c=><div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-500"><span>{c.label}</span><span className={`rounded-lg p-2 ${c.tone}`}><c.icon size={18}/></span></div>{loading&&c.value===undefined?<div className="mt-4 h-10 w-16 animate-pulse rounded-lg bg-slate-100"/>:<div className="mt-3 text-4xl font-extrabold tabular-nums text-midnight">{c.value??0}</div>}</div>)}</div>
  <div className="flex flex-col rounded-2xl bg-midnight p-6 text-white shadow-sm">
   <div className="flex items-start justify-between"><div><p className="text-sm text-slate-400">Last 30 days</p><p className="mt-1 text-4xl font-extrabold tabular-nums">{stats?.last_30_days??0}</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-gold"><TrendingUp size={14}/>{stats?.last_7_days??0} this week</span></div>
   <div className="mt-6">{stats?<ActivityChart daily={stats.daily}/>:<div className="h-24 animate-pulse rounded-lg bg-white/5"/>}</div>
   {services.length>0&&<div className="mt-6 space-y-2 border-t border-white/10 pt-5">{services.slice(0,4).map(([k,v])=><div key={k} className="flex items-center gap-3 text-xs"><span className="w-36 shrink-0 truncate text-slate-300">{SERVICE_LABELS[k]??k}</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-teal" style={{width:`${(v/serviceMax)*100}%`}}/></span><span className="w-6 text-right font-bold tabular-nums">{v}</span></div>)}</div>}
  </div>
 </div>;
}
