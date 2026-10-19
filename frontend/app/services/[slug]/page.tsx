import {notFound} from 'next/navigation';
import Link from 'next/link';
import {CheckCircle2,ArrowRight,Users,Briefcase,ClipboardList,AlertTriangle,MessageCircle,ArrowUpRight} from 'lucide-react';
import {PublicShell} from '@/components/public-shell';
import {PageHero} from '@/components/page-hero';
import {ButtonLink} from '@/components/button-link';
import {services,whatsappLink} from '@/lib/constants';
export function generateStaticParams(){return services.map(s=>({slug:s.slug}));}
export const dynamicParams=false;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const s=services.find(x=>x.slug===slug);return s?{title:s.title,description:s.short,alternates:{canonical:'/services/'+s.slug}}:{};}

function ListCard({icon:Icon,title,items,tone}:{icon:typeof Users;title:string;items:string[];tone:string}){
 return <div className="reveal rounded-[24px] border border-line bg-surface p-7"><div className="flex items-center gap-3"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={20}/></span><h3 className="text-lg font-bold text-fg">{title}</h3></div><ul className="mt-5 space-y-3">{items.map(x=><li key={x} className="flex gap-3 text-sm leading-6 text-muted"><CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={18}/>{x}</li>)}</ul></div>;
}

export default async function ServiceDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const s=services.find(x=>x.slug===slug);if(!s)notFound();
 const others=services.filter(x=>x.slug!==s.slug);
 const faqLd={'@context':'https://schema.org','@type':'FAQPage',mainEntity:s.faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))};
 return <PublicShell><PageHero eyebrow={s.tag} title={s.title} description={s.short}/>
 <section className="px-5 py-16 md:px-8 md:py-20"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_.72fr]">
  <div className="reveal"><p className="eyebrow">HOW JKJ CAN HELP</p><h2 className="section-title mt-4">Bring your request. <span className="text-accent">Let's discuss your options.</span></h2>
   <div className="mt-7 max-w-2xl space-y-5 text-base leading-8 text-muted md:text-lg md:leading-9">{s.overview.map(p=><p key={p.slice(0,24)}>{p}</p>)}</div>
   <div className="mt-10 flex flex-wrap gap-3"><ButtonLink href={'/request-quote?service='+s.slug}>Request a quote</ButtonLink><ButtonLink href={whatsappLink(`Hello JKJ, I'd like to ask about ${s.title.toLowerCase()}.`)} external outline>Ask on WhatsApp</ButtonLink></div></div>
  <aside className="reveal self-start rounded-[30px] bg-midnight p-8 text-white md:p-10 lg:sticky lg:top-28"><span className="font-display text-7xl text-gold">{s.icon}</span><h3 className="mt-6 text-2xl font-bold">Tell us about your next payment</h3><p className="mt-4 leading-7 text-slate-300">Useful information includes the payment currency, approximate amount and the channel your supplier prefers.</p><p className="mt-4 rounded-xl bg-white/5 p-4 text-sm leading-6 text-slate-300">Please don't send bank credentials, PINs or identity documents through the enquiry form. We'll explain any verification steps directly.</p><Link href={'/request-quote?service='+s.slug} className="mt-7 inline-flex items-center gap-2 font-bold text-gold hover:text-white">Start an enquiry <ArrowRight size={18}/></Link></aside>
 </div></section>
 <section className="bg-canvas-alt px-5 py-16 md:px-8 md:py-20"><div className="mx-auto max-w-7xl"><div className="grid gap-5 md:grid-cols-2">
  <ListCard icon={Users} title="Who it's for" items={s.forWho} tone="bg-accent-soft text-accent"/>
  <ListCard icon={Briefcase} title="Typical uses" items={s.useCases} tone="bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300"/>
  <ListCard icon={ClipboardList} title="What to have ready" items={s.prepare} tone="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"/>
  <div className="reveal rounded-[24px] border border-accent-line bg-accent-soft/60 p-7"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-accent"><AlertTriangle size={20}/></span><h3 className="text-lg font-bold text-fg">Good to know</h3></div><ul className="mt-5 space-y-3">{s.considerations.map(x=><li key={x} className="flex gap-3 text-sm leading-6 text-fg-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600"/>{x}</li>)}</ul></div>
 </div></div></section>
 <section className="px-5 py-16 md:px-8 md:py-20"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
  <div className="reveal"><p className="eyebrow">QUESTIONS</p><h2 className="section-title mt-4">{s.title.split(' ')[0]} FAQs</h2><p className="mt-4 leading-8 text-muted">Still unsure? Our team is happy to talk it through.</p><a href={whatsappLink(`Hello JKJ, I have a question about ${s.title.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-bold text-green-700 dark:text-green-300"><MessageCircle size={18}/> Ask us on WhatsApp</a></div>
  <div className="reveal space-y-3">{s.faqs.map(f=><details key={f.q} className="group rounded-2xl border border-line bg-surface p-6 transition open:border-accent-line open:shadow-soft"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-fg [&::-webkit-details-marker]:hidden">{f.q}<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl text-accent transition group-open:rotate-45">+</span></summary><p className="mt-4 text-sm leading-7 text-muted">{f.a}</p></details>)}</div>
 </div></section>
 <section className="px-5 pb-20 md:px-8"><div className="mx-auto max-w-7xl"><p className="eyebrow">OTHER PAYMENT ENQUIRIES</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{others.map(o=><Link key={o.slug} href={'/services/'+o.slug} className="card-hover group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-midnight font-display text-2xl text-gold">{o.icon}</span><span className="min-w-0 flex-1 text-sm font-bold text-fg">{o.title}</span><ArrowUpRight size={17} className="shrink-0 text-subtle transition group-hover:text-accent"/></Link>)}</div></div></section>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqLd)}}/>
 </PublicShell>}
