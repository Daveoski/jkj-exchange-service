'use client';
import {Suspense,useEffect,useState,type FormEvent} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter,useSearchParams} from 'next/navigation';
import {ThemeToggle} from '@/components/theme-toggle';
import {LockKeyhole,LoaderCircle,ShieldCheck,ArrowLeft,Eye,EyeOff,AlertCircle} from 'lucide-react';
import {api} from '@/lib/api';

function safeNext(value:string|null){return value&&value.startsWith('/admin')&&!value.startsWith('//')?value:'/admin';}

function LoginForm(){
 const router=useRouter();const params=useSearchParams();const next=safeNext(params.get('next'));
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [visible,setVisible]=useState(false);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 // Already signed in (e.g. arriving from an email link)? Go straight to the dashboard.
 useEffect(()=>{api('/admin/me').then(()=>router.replace(next)).catch(()=>{});},[router,next]);
 async function login(e:FormEvent){e.preventDefault();setLoading(true);setError('');
  try{await api('/admin/login',{method:'POST',body:JSON.stringify({email:email.trim(),password})});router.replace(next);router.refresh();}
  catch(err){setError(err instanceof Error?err.message:'Sign-in failed.');setLoading(false);}
 }
 return <form onSubmit={login} className="mt-8 space-y-5">
  <div><label className="field-label" htmlFor="admin_email">Email address</label><input autoComplete="username" id="admin_email" className="field" type="email" required autoFocus value={email} onChange={e=>setEmail(e.target.value)}/></div>
  <div><label className="field-label" htmlFor="admin_password">Password</label><div className="relative"><input autoComplete="current-password" id="admin_password" className="field pr-12" required type={visible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'} className="absolute right-3 top-3.5 text-muted hover:text-fg">{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
  {error&&<p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</p>}
  <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-contrast px-6 py-4 font-bold text-on-contrast transition hover:bg-contrast-hover disabled:opacity-60">{loading?<LoaderCircle className="animate-spin" size={18}/>:<LockKeyhole size={18}/>} {loading?'Signing in...':'Sign in securely'}</button>
 </form>;
}

export default function AdminLogin(){
 return <main className="hero-glow grid-pattern noise relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
  <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] animate-drift rounded-full border border-white/5"/>
  <div className="animate-fade-up relative w-full max-w-md rounded-[28px] bg-surface p-8 shadow-2xl sm:p-10">
   <div className="mb-8 flex items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-accent"><ArrowLeft size={16}/> Back to website</Link><ThemeToggle/></div>
   <Image src="/brand/jkj-emblem.png" alt="JKJ Exchange Services" width={514} height={384} priority className="h-16 w-auto dark:hidden"/>
   <Image src="/brand/jkj-emblem-dark.png" alt="JKJ Exchange Services" width={514} height={384} priority className="hidden h-16 w-auto dark:block"/>
   <p className="eyebrow mt-7">AUTHORIZED STAFF ONLY</p><h1 className="mt-3 font-display text-4xl text-fg">JKJ Admin Login</h1><p className="mt-3 text-sm leading-7 text-muted">Sign in to securely view and manage website enquiries.</p>
   <Suspense fallback={<div className="mt-8 h-64"/>}><LoginForm/></Suspense>
   <p className="mt-8 flex items-center gap-2 text-xs text-muted"><ShieldCheck size={16} className="shrink-0 text-teal"/> Admin accounts are created by the website owner, not through public registration.</p>
  </div>
 </main>;
}
