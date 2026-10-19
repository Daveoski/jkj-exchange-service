'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowUpRight,LogOut,RefreshCw,Search,Inbox,ChevronRight,Download,KeyRound,AlertCircle,CheckCircle2,X,ArrowDownUp} from 'lucide-react';
import {api,ApiError,type AdminUser,type Inquiry,type InquiryPage,type Stats} from '@/lib/api';
import {SERVICE_LABELS,SERVICE_OPTIONS} from '@/lib/constants';
import {StatsPanel} from '@/components/admin/stats-panel';
import {InquiryDrawer} from '@/components/admin/inquiry-drawer';
import {PasswordDialog} from '@/components/admin/password-dialog';
import {EMAIL_META,STATUSES,STATUS_META,formatAmount,timeAgo} from '@/components/admin/meta';

const PER_PAGE=20;

export default function AdminDashboard(){
 const router=useRouter();
 const [me,setMe]=useState<AdminUser|null>(null);
 const [stats,setStats]=useState<Stats|null>(null);
 const [data,setData]=useState<InquiryPage|null>(null);
 const [loading,setLoading]=useState(true);
 const [problem,setProblem]=useState('');
 const [status,setStatus]=useState('all');const [service,setService]=useState('all');const [sort,setSort]=useState<'newest'|'oldest'>('newest');
 const [search,setSearch]=useState('');const [debounced,setDebounced]=useState('');
 const [page,setPage]=useState(0);
 const [selected,setSelected]=useState<string|null>(null);
 const [passwordOpen,setPasswordOpen]=useState(false);
 const [toast,setToast]=useState('');
 const toastTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);

 const notify=useCallback((message:string)=>{setToast(message);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),3200);},[]);
 const unauthorized=useCallback(()=>router.replace('/admin/login'),[router]);
 const handle=useCallback((e:unknown)=>{if(e instanceof ApiError&&e.status===401){unauthorized();return;}setProblem(e instanceof Error?e.message:'Something went wrong.');},[unauthorized]);

 useEffect(()=>{const t=setTimeout(()=>{setDebounced(search.trim());setPage(0)},300);return()=>clearTimeout(t)},[search]);

 const query=useCallback(()=>{const q=new URLSearchParams({limit:String(PER_PAGE),offset:String(page*PER_PAGE),sort});if(status!=='all')q.set('status',status);if(service!=='all')q.set('service',service);if(debounced)q.set('search',debounced);return q;},[page,sort,status,service,debounced]);

 const loadList=useCallback(async()=>{setLoading(true);setProblem('');try{setData(await api<InquiryPage>('/admin/inquiries?'+query().toString()));}catch(e){handle(e)}finally{setLoading(false)}},[query,handle]);
 const loadStats=useCallback(async()=>{try{setStats(await api<Stats>('/admin/stats'))}catch(e){handle(e)}},[handle]);

 useEffect(()=>{api<AdminUser>('/admin/me').then(setMe).catch(handle);void loadStats();const id=new URLSearchParams(window.location.search).get('inquiry');if(id)setSelected(id);},[handle,loadStats]);
 useEffect(()=>{void loadList()},[loadList]);

 function open(id:string|null){setSelected(id);const url=new URL(window.location.href);if(id)url.searchParams.set('inquiry',id);else url.searchParams.delete('inquiry');window.history.replaceState(null,'',url);}
 const closeDrawer=useCallback(()=>open(null),[]);
 const refreshAll=useCallback(()=>{void loadList();void loadStats();},[loadList,loadStats]);

 async function signOut(){try{await api('/admin/logout',{method:'POST'})}catch{}router.replace('/admin/login');}

 const total=data?.total??0;
 const exportUrl=(()=>{const q=query();q.delete('limit');q.delete('offset');q.delete('sort');return '/api/v1/admin/inquiries/export?'+q.toString();})();
 const filtersActive=status!=='all'||service!=='all'||!!debounced;

 return <div className="min-h-screen bg-[#f1f5f7]">
  <header className="bg-midnight text-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
   <Link href="/admin" className="flex items-center gap-3"><div className="rounded-lg bg-gold px-2.5 py-2 text-sm font-black tracking-tighter text-midnight">JKJ</div><div><p className="text-sm font-extrabold tracking-wide">ADMIN CONTROL CENTER</p><p className="text-xs text-slate-400">Private enquiry management</p></div></Link>
   <div className="flex flex-wrap items-center gap-2 text-sm"><span className="mr-2 hidden text-slate-300 md:inline">{me?.email}</span><Link href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-slate-300 hover:text-gold">Website <ArrowUpRight size={15}/></Link><button onClick={()=>setPasswordOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-slate-300 hover:text-gold"><KeyRound size={15}/> Password</button><button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-semibold hover:border-gold"><LogOut size={15}/> Sign out</button></div>
  </div></header>

  <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
   <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow" suppressHydrationWarning>{greeting()}</p><h1 className="mt-2 font-display text-4xl text-midnight md:text-5xl">Your customer enquiries.</h1><p className="mt-3 max-w-2xl text-sm text-slate-600">Website form submissions appear here instantly. Direct WhatsApp chats, emails and calls are not synced automatically.</p></div>
    <div className="flex gap-2"><a href={exportUrl} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold hover:border-amber-600"><Download size={16}/> Export CSV</a><button onClick={refreshAll} className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-bold text-white hover:bg-ocean"><RefreshCw size={16} className={loading?'animate-spin':''}/> Refresh</button></div></div>

   <StatsPanel stats={stats} loading={!stats}/>

   <div className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 p-5">
     <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-bold text-midnight">Inquiry inbox</h2><p className="text-sm text-slate-500">{total} {total===1?'enquiry':'enquiries'}{filtersActive?' match your filters':''}</p></div>
      <div className="flex flex-wrap gap-2"><label className="relative min-w-0 flex-1 sm:min-w-64"><Search className="absolute left-3.5 top-3 text-slate-400" size={17}/><input aria-label="Search inquiries" className="field !py-2.5 !pl-10 !pr-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email, phone, reference..."/>{search&&<button aria-label="Clear search" onClick={()=>setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-midnight"><X size={16}/></button>}</label>
       <select aria-label="Filter by service" className="field !w-auto !py-2.5" value={service} onChange={e=>{setService(e.target.value);setPage(0)}}><option value="all">All services</option>{SERVICE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
       <button onClick={()=>{setSort(s=>s==='newest'?'oldest':'newest');setPage(0)}} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-amber-500"><ArrowDownUp size={15}/>{sort==='newest'?'Newest':'Oldest'}</button></div></div>
     <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{['all',...STATUSES].map(s=>{const count=s==='all'?stats?.total:stats?.by_status[s];return <button key={s} onClick={()=>{setStatus(s);setPage(0)}} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${status===s?'bg-midnight text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s!=='all'&&<span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`}/>}{s==='all'?'All':STATUS_META[s].label}{count!=null&&<span className={`rounded-full px-1.5 text-xs ${status===s?'bg-white/15':'bg-white'}`}>{count}</span>}</button>})}</div>
    </div>

    {problem&&<div role="alert" className="m-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0"/><span className="flex-1">{problem}</span><button onClick={refreshAll} className="font-bold underline">Retry</button></div>}

    <div className="divide-y divide-slate-100">{loading&&!data?Array.from({length:5}).map((_,i)=><div key={i} className="flex items-center gap-4 px-5 py-5"><div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100"/><div className="flex-1 space-y-2"><div className="h-4 w-48 animate-pulse rounded bg-slate-100"/><div className="h-3 w-72 animate-pulse rounded bg-slate-100"/></div></div>)
     :data&&data.items.length===0?<div className="p-14 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50"><Inbox className="text-amber-600" size={30}/></div><h3 className="mt-5 text-lg font-bold text-midnight">{filtersActive?'No enquiries match these filters':'No enquiries yet'}</h3><p className="mt-2 text-sm text-slate-500">{filtersActive?'Try a different search or status.':'New website requests will appear here the moment they arrive.'}</p>{filtersActive&&<button onClick={()=>{setStatus('all');setService('all');setSearch('')}} className="mt-5 rounded-full border border-slate-300 px-5 py-2 text-sm font-bold hover:border-amber-500">Clear filters</button>}</div>
     :data?.items.map(it=><Row key={it.id} it={it} onOpen={()=>open(it.id)}/>)}</div>

    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5 text-sm text-slate-500"><span>Showing {total===0?0:page*PER_PAGE+1}–{Math.min(total,(page+1)*PER_PAGE)} of {total}</span><div className="flex gap-2"><button disabled={page===0||loading} onClick={()=>setPage(p=>p-1)} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:border-amber-500 disabled:opacity-40">Previous</button><button disabled={(page+1)*PER_PAGE>=total||loading} onClick={()=>setPage(p=>p+1)} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:border-amber-500 disabled:opacity-40">Next</button></div></div>
   </div>
  </main>

  {selected&&<InquiryDrawer id={selected} onClose={closeDrawer} onChanged={refreshAll} onDeleted={()=>{closeDrawer();refreshAll();}} onUnauthorized={unauthorized} notify={notify}/>}
  {passwordOpen&&<PasswordDialog onClose={()=>setPasswordOpen(false)} notify={notify}/>}
  {toast&&<div role="status" className="animate-fade-up fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white shadow-2xl"><CheckCircle2 size={17} className="text-gold"/>{toast}</div>}
 </div>;
}

function Row({it,onOpen}:{it:Inquiry;onOpen:()=>void}){
 const meta=STATUS_META[it.status];
 return <button onClick={onOpen} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-amber-50/40">
  <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${it.status==='new'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-600'}`}>{it.full_name.slice(0,1).toUpperCase()}{it.status==='new'&&<span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-amber-500"/>}</div>
  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className={`truncate text-midnight ${it.status==='new'?'font-extrabold':'font-bold'}`}>{it.full_name}</p>{it.company&&<span className="truncate text-xs text-slate-400">{it.company}</span>}<span className="font-mono text-[11px] font-bold text-amber-700">{it.reference}</span></div>
   <p className="mt-1 truncate text-sm text-slate-500">{SERVICE_LABELS[it.service]??it.service} · {formatAmount(it.amount,it.currency)} · via {it.contact_method}</p>
   <p className="mt-1 line-clamp-1 text-xs text-slate-400">{it.message}</p></div>
  <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex"><span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta?.badge}`}>{meta?.label??it.status}</span><span className="text-xs text-slate-400" title={new Date(it.created_at).toLocaleString()}>{timeAgo(it.created_at)}</span>{it.email_status!=='sent'&&<span className={`text-[11px] font-semibold ${EMAIL_META[it.email_status]?.cls}`}>{EMAIL_META[it.email_status]?.label}</span>}</div>
  <ChevronRight size={18} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600"/>
 </button>;
}

function greeting(){const h=new Date().getHours();return h<12?'GOOD MORNING':h<17?'GOOD AFTERNOON':'GOOD EVENING';}
