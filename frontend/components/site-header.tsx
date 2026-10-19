'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import {useEffect,useState} from 'react';
import {BrandLogo} from './brand-logo';
const nav=[{href:'/',label:'Home'},{href:'/about',label:'About us'},{href:'/services',label:'Services'},{href:'/how-it-works',label:'How it works'},{href:'/contact',label:'Contact'}];
const isActive=(path:string,href:string)=>href==='/'?path==='/':path===href||path.startsWith(href+'/');
export function SiteHeader(){
 const [open,setOpen]=useState(false);const [scrolled,setScrolled]=useState(false);const path=usePathname();
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>8);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open]);
 return <header className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl transition-shadow ${scrolled?'border-slate-200 shadow-[0_8px_30px_rgba(7,20,37,.06)]':'border-transparent'}`}>
  <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
   <BrandLogo/>
   <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">{nav.map(n=>{const active=isActive(path,n.href);return <Link aria-current={active?'page':undefined} className={`link-focus relative rounded-full px-4 py-2 text-sm font-semibold transition ${active?'text-midnight':'text-slate-500 hover:text-midnight'}`} href={n.href} key={n.href}>{n.label}{active&&<span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold"/>}</Link>})}</nav>
   <div className="flex items-center gap-2">
    <Link href="/request-quote" className="link-focus group hidden items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-bold text-white transition hover:bg-ocean sm:inline-flex">Request a quote <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></Link>
    <button className="rounded-xl border border-slate-200 p-2.5 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
   </div>
  </div>
  {open&&<nav id="mobile-nav" className="animate-fade-up border-t border-slate-100 bg-white px-5 pb-6 pt-2 lg:hidden" aria-label="Mobile navigation">{nav.map(n=><Link key={n.href} aria-current={isActive(path,n.href)?'page':undefined} className={`flex items-center justify-between border-b border-slate-100 py-4 text-base font-bold ${isActive(path,n.href)?'text-amber-700':'text-slate-700'}`} href={n.href}>{n.label}<ArrowUpRight size={16} className="text-slate-300"/></Link>)}<Link href="/request-quote" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-4 text-sm font-extrabold text-midnight">Request a quote <ArrowUpRight size={16}/></Link></nav>}
 </header>;
}
