import Link from 'next/link';
import Image from 'next/image';

// The JKJ globe-and-monogram emblem with a live wordmark (Cinzel echoes the logo's Roman
// capitals). By day the navy emblem is used; by night a platinum variant keeps it legible.
// `light` is for always-dark surfaces such as the footer and admin bar.
export function BrandLogo({light=false,compact=false,href='/'}:{light?:boolean;compact?:boolean;href?:string}) {
 const emblem='h-10 w-auto sm:h-12 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-[1.04]';
 return <Link href={href} aria-label="JKJ Exchange Services home" className="link-focus group inline-flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
   {light
    ?<Image src="/brand/jkj-emblem-dark.png" alt="" width={514} height={384} priority className={emblem}/>
    :<>
      <Image src="/brand/jkj-emblem.png" alt="" width={514} height={384} priority className={`${emblem} dark:hidden`}/>
      <Image src="/brand/jkj-emblem-dark.png" alt="" width={514} height={384} priority className={`${emblem} hidden dark:block`}/>
     </>}
   {!compact&&<span className="whitespace-nowrap leading-none">
     <span className={`block font-brand text-[13px] font-bold tracking-[.04em] min-[400px]:text-[15px] sm:text-base sm:tracking-[.06em] ${light?'on-dark text-white':'text-fg'}`}>JKJ <span className="brand-gold">EXCHANGE</span></span>
     <span className={`mt-1 flex items-center gap-1.5 font-brand text-[9px] font-semibold tracking-[.42em] ${light?'text-slate-300':'text-muted'}`}><span className="h-px w-3 bg-gold/70"/>SERVICES</span>
   </span>}
 </Link>;
}
