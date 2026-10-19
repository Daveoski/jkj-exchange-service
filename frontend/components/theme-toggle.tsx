'use client';
import {useEffect,useState} from 'react';
import {flushSync} from 'react-dom';

type Theme='light'|'dark';
const KEY='jkj-theme';

function apply(theme:Theme){const d=document.documentElement;d.dataset.theme=theme;d.style.colorScheme=theme;}

// Day/Night switch. The new theme is revealed in a circle expanding from the switch
// (View Transitions API), falling back to an instant change where unsupported.
export function ThemeToggle({className=''}:{className?:string}){
 const [theme,setTheme]=useState<Theme|null>(null);

 useEffect(()=>{
  setTheme((document.documentElement.dataset.theme as Theme)||'light');
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const follow=(e:MediaQueryListEvent)=>{let saved=null;try{saved=localStorage.getItem(KEY)}catch{}if(!saved){const t=e.matches?'dark':'light';apply(t);setTheme(t);}};
  media.addEventListener('change',follow);return()=>media.removeEventListener('change',follow);
 },[]);

 function toggle(e:React.MouseEvent<HTMLButtonElement>){
  const next:Theme=theme==='dark'?'light':'dark';
  const commit=()=>{flushSync(()=>setTheme(next));apply(next);try{localStorage.setItem(KEY,next)}catch{}};
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc=document as Document&{startViewTransition?:(cb:()=>void)=>{ready:Promise<void>}};
  if(!doc.startViewTransition||reduce){commit();return;}
  const r=e.currentTarget.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  doc.startViewTransition(commit).ready.then(()=>{
   document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]},{duration:650,easing:'cubic-bezier(.65,0,.35,1)',pseudoElement:'::view-transition-new(root)'});
  }).catch(()=>{});
 }

 const dark=theme==='dark';
 return <button type="button" onClick={toggle} role="switch" aria-checked={dark} aria-label={dark?'Switch to day mode':'Switch to night mode'} title={dark?'Day mode':'Night mode'}
  className={`group relative inline-flex h-9 w-[62px] shrink-0 items-center rounded-full border p-1 transition-colors duration-500 sm:h-10 sm:w-[74px] ${dark?'border-gold/30 bg-[#0b1a30]':'border-line bg-surface-2'} ${className}`}>
  {/* track scenery: sun rays by day, stars by night */}
  <span aria-hidden className={`absolute right-2 top-1/2 -translate-y-1/2 text-[12px] sm:right-2.5 sm:text-[13px] transition-opacity duration-500 ${dark?'opacity-0':'opacity-100'}`}>☀</span>
  <span aria-hidden className={`absolute left-2 top-2 h-[3px] w-[3px] rounded-full bg-white transition-opacity duration-500 ${dark?'animate-twinkle opacity-100':'opacity-0'}`}/>
  <span aria-hidden className={`absolute left-4 top-[22px] h-[2px] w-[2px] rounded-full bg-gold transition-opacity duration-700 ${dark?'animate-twinkle opacity-100 [animation-delay:.8s]':'opacity-0'}`}/>
  <span aria-hidden className={`absolute left-[26px] top-3 h-[2px] w-[2px] rounded-full bg-white transition-opacity duration-700 ${dark?'animate-twinkle opacity-100 [animation-delay:1.6s]':'opacity-0'}`}/>
  {/* the knob: a gold sun that becomes a crescent moon */}
  <span aria-hidden className={`relative z-10 h-7 w-7 overflow-hidden rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(.65,0,.35,1)] sm:h-8 sm:w-8 ${dark?'translate-x-[26px] bg-[#e9eef6] sm:translate-x-[34px]':'translate-x-0 bg-gold shadow-[0_0_14px_rgba(230,179,94,.55)]'}`}>
   <span className={`absolute h-7 w-7 rounded-full bg-[#0b1a30] transition-all duration-500 ease-[cubic-bezier(.65,0,.35,1)] ${dark?'left-2.5 -top-1.5':'left-9 -top-9'}`}/>
  </span>
  {theme===null&&<span className="sr-only">Loading theme</span>}
 </button>;
}
