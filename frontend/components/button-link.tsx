import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export function ButtonLink({href,children,outline=false,external=false,className=''}:{href:string;children:React.ReactNode;outline?:boolean;external?:boolean;className?:string}) {
 const cls=`link-focus inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 ${outline?'border border-slate-300 bg-transparent text-ink hover:border-gold':'bg-gold text-midnight shadow-glow hover:bg-amber-300'} ${className}`;
 return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}<ArrowUpRight size={16}/></a> : <Link href={href} className={cls}>{children}<ArrowUpRight size={16}/></Link>;
}
