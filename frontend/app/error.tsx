'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {BUSINESS,whatsappLink} from '@/lib/constants';
export default function Error({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error(error)},[error]);
 return <div className="hero-glow flex min-h-screen flex-col items-center justify-center px-5 text-center text-white"><p className="text-sm font-bold tracking-widest text-gold">SOMETHING WENT WRONG</p><h1 className="mt-5 max-w-2xl font-display text-5xl">We hit an unexpected snag.</h1><p className="mt-5 max-w-lg text-slate-300">Please try again. If it keeps happening you can always reach us on WhatsApp at {BUSINESS.whatsappDisplay}.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={reset} className="rounded-full bg-gold px-7 py-4 font-bold text-midnight">Try again</button><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-7 py-4 font-bold">WhatsApp us</a><Link href="/" className="rounded-full border border-white/30 px-7 py-4 font-bold">Homepage</Link></div></div>;
}
