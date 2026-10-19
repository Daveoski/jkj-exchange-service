import {PublicShell} from './public-shell';
import {PageHero} from './page-hero';
import {LEGAL_UPDATED} from '@/lib/constants';

export type LegalSection={id:string;title:string;body:React.ReactNode};

export function LegalPage({eyebrow,title,description,intro,sections}:{eyebrow:string;title:string;description:string;intro:React.ReactNode;sections:LegalSection[]}){
 return <PublicShell><PageHero eyebrow={eyebrow} title={title} description={description}/>
  <section className="px-5 py-14 md:px-8 md:py-20"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[250px_1fr]">
   <nav aria-label="On this page" className="hidden lg:block"><div className="sticky top-28"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">On this page</p><ol className="mt-4 space-y-2 border-l border-slate-200 text-sm">{sections.map((s,i)=><li key={s.id}><a href={'#'+s.id} className="-ml-px block border-l-2 border-transparent py-1 pl-4 text-slate-500 hover:border-gold hover:text-midnight">{i+1}. {s.title}</a></li>)}</ol></div></nav>
   <article className="prose-jkj min-w-0">
    <p className="!mt-0 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Last updated: {LEGAL_UPDATED}</p>
    <div className="mt-4">{intro}</div>
    <details className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden"><summary className="cursor-pointer font-bold text-midnight">Contents</summary><ol className="mt-3 space-y-1.5 text-sm">{sections.map((s,i)=><li key={s.id}><a href={'#'+s.id}>{i+1}. {s.title}</a></li>)}</ol></details>
    {sections.map((s,i)=><section key={s.id} id={s.id} className="scroll-mt-28"><h2>{i+1}. {s.title}</h2>{s.body}</section>)}
   </article>
  </div></section>
 </PublicShell>;
}
