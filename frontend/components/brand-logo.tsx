import Link from 'next/link';
export function BrandLogo({light=false}:{light?:boolean}) {
 return <Link href="/" aria-label="JKJ Exchange Services home" className="link-focus inline-flex items-center gap-3">
   <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/45 bg-gold text-lg font-black tracking-tighter text-midnight shadow-glow">JKJ</span>
   <span className="leading-tight"><span className={`block text-base font-extrabold tracking-wide ${light?'text-white':'text-midnight'}`}>JKJ <span className="text-gold">EXCHANGE</span></span><span className={`block text-[10px] font-semibold tracking-[.3em] ${light?'text-slate-300':'text-slate-500'}`}>SERVICES</span></span>
 </Link>;
}
