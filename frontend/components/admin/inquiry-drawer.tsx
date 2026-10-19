'use client';
import {useEffect,useRef,useState} from 'react';
import {X,MessageCircle,Mail,Phone,Check,Trash2,LoaderCircle,AlertCircle,Building2,Copy,History} from 'lucide-react';
import {api,ApiError,type InquiryDetail} from '@/lib/api';
import {SERVICE_LABELS} from '@/lib/constants';
import {EMAIL_META,STATUSES,STATUS_META,formatAmount,formatDate,timeAgo,whatsappFor} from './meta';

type Props={id:string;onClose:()=>void;onChanged:()=>void;onDeleted:()=>void;onUnauthorized:()=>void;notify:(m:string)=>void};

export function InquiryDrawer({id,onClose,onChanged,onDeleted,onUnauthorized,notify}:Props){
 const [item,setItem]=useState<InquiryDetail|null>(null);
 const [status,setStatus]=useState('new');const [notes,setNotes]=useState('');
 const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [deleting,setDeleting]=useState(false);const [error,setError]=useState('');
 const panel=useRef<HTMLDivElement>(null);

 useEffect(()=>{let live=true;setLoading(true);setError('');
  api<InquiryDetail>(`/admin/inquiries/${id}`).then(d=>{if(!live)return;setItem(d);setStatus(d.status);setNotes(d.admin_notes);})
   .catch(e=>{if(!live)return;if(e instanceof ApiError&&e.status===401)return onUnauthorized();setError(e.message);})
   .finally(()=>live&&setLoading(false));
  return()=>{live=false};
 },[id,onUnauthorized]);

 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);panel.current?.focus();const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',onKey);document.body.style.overflow=prev}},[onClose]);

 const dirty=!!item&&(status!==item.status||notes.trim()!==item.admin_notes);

 async function save(){if(!item)return;setSaving(true);setError('');
  try{const d=await api<InquiryDetail>(`/admin/inquiries/${item.id}`,{method:'PATCH',body:JSON.stringify({status,admin_notes:notes})});setItem(d);setStatus(d.status);setNotes(d.admin_notes);notify('Changes saved');onChanged();}
  catch(e){if(e instanceof ApiError&&e.status===401)return onUnauthorized();setError(e instanceof Error?e.message:'Save failed.');}
  finally{setSaving(false)}
 }
 async function remove(){if(!item||!window.confirm(`Delete enquiry ${item.reference} from ${item.full_name}? This cannot be undone.`))return;setDeleting(true);
  try{await api(`/admin/inquiries/${item.id}`,{method:'DELETE'});notify('Enquiry deleted');onDeleted();}
  catch(e){if(e instanceof ApiError&&e.status===401)return onUnauthorized();setError(e instanceof Error?e.message:'Delete failed.');setDeleting(false);}
 }

 return <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
  <button aria-label="Close details" className="absolute inset-0 bg-midnight/50 backdrop-blur-[2px]" onClick={onClose}/>
  <div ref={panel} tabIndex={-1} className="animate-slide-in relative flex h-full w-full max-w-2xl flex-col bg-canvas shadow-2xl outline-none">
   <div className="flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
    {item?<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold tracking-wider text-accent">{item.reference}</span><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${STATUS_META[item.status]?.badge}`}>{STATUS_META[item.status]?.label}</span></div><h2 id="drawer-title" className="mt-1.5 truncate font-display text-2xl text-fg">{item.full_name}</h2><p className="mt-0.5 text-xs text-muted">Received {formatDate(item.created_at)} · {timeAgo(item.created_at)}</p></div>:<h2 id="drawer-title" className="font-display text-2xl text-fg">Enquiry</h2>}
    <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-fg"><X size={20}/></button>
   </div>
   <div className="flex-1 overflow-y-auto px-6 py-6">
    {loading?<div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-3/60"/>)}</div>:!item?<p className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">{error||'Enquiry not found.'}</p>:<>
     <div className="flex flex-wrap gap-2"><a href={whatsappFor(item.phone,item.full_name)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"><MessageCircle size={16}/> WhatsApp</a><a href={`mailto:${item.email}?subject=${encodeURIComponent('Re: Your JKJ enquiry '+item.reference)}`} className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-fg ring-1 ring-line hover:ring-accent"><Mail size={16}/> Email</a><a href={'tel:'+item.phone.replace(/[^+0-9]/g,'')} className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-bold text-fg ring-1 ring-line hover:ring-accent"><Phone size={16}/> Call</a></div>
     <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-surface-3 sm:grid-cols-2">{[
      ['Email',item.email],['Phone / WhatsApp',item.phone],['Enquiry',SERVICE_LABELS[item.service]??item.service],['Amount',formatAmount(item.amount,item.currency)],['Preferred reply',item.contact_method],['Business',item.company||'—'],
     ].map(([k,v])=><div key={k} className="bg-surface p-4"><dt className="text-[11px] font-bold uppercase tracking-wider text-subtle">{k}</dt><dd className="mt-1 break-words text-sm font-semibold text-fg">{k==='Business'&&v!=='—'?<span className="inline-flex items-center gap-1.5"><Building2 size={14} className="text-subtle"/>{v}</span>:v}</dd></div>)}</dl>
     <div className="mt-6 rounded-2xl border border-line bg-surface p-5"><div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-wider text-subtle">Message</p><button onClick={()=>{void navigator.clipboard?.writeText(item.message);notify('Message copied')}} className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-accent"><Copy size={13}/> Copy</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-fg-soft">{item.message}</p></div>

     <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-subtle">Lead status</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Lead status">{STATUSES.map(s=><button key={s} role="radio" aria-checked={status===s} onClick={()=>setStatus(s)} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ring-1 transition ${status===s?STATUS_META[s].badge+' ring-2':'bg-surface text-muted ring-line hover:ring-line-strong'}`}><span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`}/>{STATUS_META[s].label}</button>)}</div>
      <label className="field-label mt-5" htmlFor="notes">Private follow-up notes</label>
      <textarea id="notes" maxLength={4000} className="field min-h-28" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Quote sent, supplier details, next call date..."/>
      {error&&<p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"><AlertCircle size={16} className="mt-0.5 shrink-0"/>{error}</p>}
     </div>

     <div className="mt-6"><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-subtle"><History size={14}/> Activity</p>
      <ol className="mt-4 space-y-4 border-l-2 border-line pl-5">{item.events.map(ev=><li key={ev.id} className="relative"><span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-canvas ${ev.kind==='status'?'bg-violet-500':ev.kind==='email'?'bg-sky-500':ev.kind==='created'?'bg-amber-500':'bg-slate-400'}`}/><p className="text-sm font-semibold text-fg">{ev.kind==='created'?'Enquiry received':ev.kind==='status'?`Status: ${ev.detail}`:ev.kind==='email'?'Email notifications':ev.detail}</p>{ev.kind==='email'&&<p className="mt-0.5 break-words text-xs leading-5 text-muted">{ev.detail}</p>}<p className="mt-0.5 text-xs text-subtle">{formatDate(ev.created_at)} · {ev.actor}</p></li>)}</ol>
      <p className={`mt-4 text-xs font-semibold ${EMAIL_META[item.email_status]?.cls}`}>{EMAIL_META[item.email_status]?.label}</p>
     </div>
    </>}
   </div>
   {item&&<div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-6 py-4">
    <button onClick={remove} disabled={deleting} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50">{deleting?<LoaderCircle size={16} className="animate-spin"/>:<Trash2 size={16}/>} Delete</button>
    <div className="flex items-center gap-3">{dirty&&<span className="hidden text-xs text-muted sm:inline">Unsaved changes</span>}<button disabled={!dirty||saving} onClick={save} className="inline-flex items-center gap-2 rounded-full bg-contrast px-6 py-3 text-sm font-bold text-on-contrast transition hover:bg-contrast-hover disabled:opacity-40">{saving?<LoaderCircle size={17} className="animate-spin"/>:<Check size={17}/>}{saving?'Saving...':'Save changes'}</button></div>
   </div>}
  </div>
 </div>;
}
