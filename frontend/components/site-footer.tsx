import Link from 'next/link';
import {Mail,MapPin,Phone,MessageCircle,ArrowUpRight} from 'lucide-react';
import {BrandLogo} from './brand-logo';
import {BUSINESS,whatsappLink} from '@/lib/constants';
export function SiteFooter(){return <footer className="bg-midnight text-slate-300"><div className="mx-auto max-w-7xl px-5 pb-8 pt-16 md:px-8">
 <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.5fr_1fr_1fr]">
  <div><BrandLogo light/><p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">Talk with our team about RMB, USD and international supplier payment requirements. Clear conversations before your next step.</p><p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><MapPin size={15}/>{BUSINESS.location}</p></div>
  <div><p className="font-bold text-white">Explore</p><div className="mt-5 grid gap-3 text-sm">{[{h:'/about',t:'About us'},{h:'/services',t:'Our services'},{h:'/how-it-works',t:'How it works'},{h:'/request-quote',t:'Request a quote'},{h:'/privacy',t:'Privacy notice'},{h:'/terms',t:'Website terms'}].map(x=><Link key={x.h} href={x.h} className="hover:text-gold">{x.t}</Link>)}</div></div>
  <div><p className="font-bold text-white">Let's talk business</p><div className="mt-5 space-y-4 text-sm"><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-gold"><MessageCircle size={17}/>{BUSINESS.whatsappDisplay} (WhatsApp)</a><a className="flex gap-3 hover:text-gold" href={`tel:${BUSINESS.phoneInternational}`}><Phone size={17}/>{BUSINESS.phoneDisplay}</a><a className="flex gap-3 break-all hover:text-gold" href={`mailto:${BUSINESS.email}`}><Mail size={17}/>{BUSINESS.email}</a><Link className="inline-flex gap-2 text-gold" href="/contact">Contact page <ArrowUpRight size={16}/></Link></div></div>
 </div><div className="flex flex-col justify-between gap-4 pt-7 text-xs leading-6 text-slate-400 sm:flex-row"><span>© {new Date().getFullYear()} JKJ Exchange Services. All rights reserved.</span><span>Service availability, pricing and settlement terms are confirmed individually. No payments are processed on this website.</span></div>
 </div></footer>}
