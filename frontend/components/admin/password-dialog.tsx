'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {X,KeyRound,LoaderCircle,AlertCircle} from 'lucide-react';
import {api} from '@/lib/api';

export function PasswordDialog({onClose,notify}:{onClose:()=>void;notify:(m:string)=>void}){
 const [current,setCurrent]=useState('');const [next,setNext]=useState('');const [confirm,setConfirm]=useState('');const [saving,setSaving]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[onClose]);
 async function submit(e:FormEvent){e.preventDefault();setError('');
  if(next!==confirm){setError('The new passwords do not match.');return;}
  setSaving(true);
  try{await api('/admin/password',{method:'POST',body:JSON.stringify({current_password:current,new_password:next})});notify('Password updated. Other sessions were signed out.');onClose();}
  catch(err){setError(err instanceof Error?err.message:'Could not update password.');}
  finally{setSaving(false)}
 }
 return <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby="pw-title">
  <button aria-label="Close" className="absolute inset-0 bg-midnight/50 backdrop-blur-[2px]" onClick={onClose}/>
  <form onSubmit={submit} className="animate-fade-up relative w-full max-w-md rounded-[24px] bg-surface p-7 shadow-2xl">
   <div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-midnight text-gold"><KeyRound size={22}/></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-surface-2"><X size={18}/></button></div>
   <h2 id="pw-title" className="mt-5 font-display text-3xl text-fg">Change password</h2>
   <p className="mt-2 text-sm text-muted">At least 10 characters using three of: lowercase, uppercase, numbers, symbols.</p>
   <div className="mt-6 space-y-4">
    <div><label className="field-label" htmlFor="pw-current">Current password</label><input id="pw-current" type="password" autoComplete="current-password" required className="field" value={current} onChange={e=>setCurrent(e.target.value)}/></div>
    <div><label className="field-label" htmlFor="pw-new">New password</label><input id="pw-new" type="password" autoComplete="new-password" required minLength={10} className="field" value={next} onChange={e=>setNext(e.target.value)}/></div>
    <div><label className="field-label" htmlFor="pw-confirm">Confirm new password</label><input id="pw-confirm" type="password" autoComplete="new-password" required minLength={10} className="field" value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>
   </div>
   {error&&<p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"><AlertCircle size={16} className="mt-0.5 shrink-0"/>{error}</p>}
   <button disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-contrast px-6 py-3.5 font-bold text-on-contrast hover:bg-contrast-hover disabled:opacity-60">{saving&&<LoaderCircle size={17} className="animate-spin"/>}{saving?'Updating...':'Update password'}</button>
  </form>
 </div>;
}
